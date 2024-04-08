import bluebird from 'bluebird';
import _ from 'lodash';

import { FlashAssessmentAlgorithm } from '../../../../src/certification/flash-certification/domain/models/FlashAssessmentAlgorithm.js';
import { CertificationAssessmentHistory } from '../../../../src/certification/scoring/domain/models/CertificationAssessmentHistory.js';
import { CertificationAssessmentScore } from '../../../../src/certification/scoring/domain/models/CertificationAssessmentScore.js';
import { CertificationAssessmentScoreV3 } from '../../../../src/certification/scoring/domain/models/CertificationAssessmentScoreV3.js';
import { AssessmentResultFactory } from '../../../../src/certification/scoring/domain/models/factories/AssessmentResultFactory.js';
import { ABORT_REASONS } from '../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { CertificationVersion } from '../../../../src/certification/shared/domain/models/CertificationVersion.js';
import { config } from '../../../../src/shared/config.js';
import { AssessmentResult } from '../../../../src/shared/domain/models/AssessmentResult.js';
import * as areaRepository from '../../../../src/shared/infrastructure/repositories/area-repository.js';
import {
  AnswerCollectionForScoring,
  CertificationContract,
  CertifiedLevel,
  CertifiedScore,
  CompetenceMark,
  ReproducibilityRate,
} from '../../models/index.js';
import * as placementProfileService from '../placement-profile-service.js';
import * as scoringService from './scoring-service.js';

const calculateCertificationAssessmentScore = async function ({
  certificationAssessment,
  continueOnError,
  dependencies = {
    areaRepository,
    placementProfileService,
  },
}) {
  const testedCompetences = await _getTestedCompetences({
    userId: certificationAssessment.userId,
    limitDate: certificationAssessment.createdAt,
    version: CertificationVersion.V2,
    placementProfileService: dependencies.placementProfileService,
  });

  const matchingCertificationChallenges = _selectChallengesMatchingCompetences(
    certificationAssessment.certificationChallenges,
    testedCompetences,
  );

  const matchingAnswers = _selectAnswersMatchingCertificationChallenges(
    certificationAssessment.certificationAnswersByDate,
    matchingCertificationChallenges,
  );

  const allAreas = await dependencies.areaRepository.list();
  return _getResult(matchingAnswers, matchingCertificationChallenges, testedCompetences, allAreas, continueOnError);
};

const handleV3CertificationScoring = async function ({
  event,
  certificationAssessment,
  locale,
  answerRepository,
  assessmentResultRepository,
  certificationAssessmentHistoryRepository,
  certificationChallengeForScoringRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  flashAlgorithmConfigurationRepository,
  flashAlgorithmService,
  scoringConfigurationRepository,
}) {
  const { certificationCourseId, id: assessmentId } = certificationAssessment;
  const allAnswers = await answerRepository.findByAssessment(assessmentId);
  const certificationChallengesForScoring = await certificationChallengeForScoringRepository.getByCertificationCourseId(
    { certificationCourseId },
  );

  const certificationCourse = await certificationCourseRepository.get({ id: certificationCourseId });

  const abortReason = certificationCourse.isAbortReasonCandidateRelated()
    ? ABORT_REASONS.CANDIDATE
    : ABORT_REASONS.TECHNICAL;

  const configuration = await flashAlgorithmConfigurationRepository.getMostRecentBeforeDate(
    certificationCourse.getStartDate(),
  );

  const algorithm = new FlashAssessmentAlgorithm({
    flashAlgorithmImplementation: flashAlgorithmService,
    configuration,
  });

  const v3CertificationScoring = await scoringConfigurationRepository.getLatestByDateAndLocale({
    locale,
    date: certificationCourse.getStartDate(),
  });

  const certificationAssessmentScore = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
    algorithm,
    challenges: certificationChallengesForScoring,
    allAnswers,
    abortReason,
    maxReachableLevelOnCertificationDate: certificationCourse.getMaxReachableLevelOnCertificationDate(),
    v3CertificationScoring,
  });

  const assessmentResult = await _createV3AssessmentResult({
    allAnswers,
    certificationAssessment,
    certificationAssessmentScore,
    certificationCourse,
    juryId: event?.juryId,
  });

  if (_hasV3CertificationLacksOfAnswersForTechnicalReason({ allAnswers, certificationCourse })) {
    certificationCourse.cancel();
  }

  const certificationAssessmentHistory = CertificationAssessmentHistory.fromChallengesAndAnswers({
    algorithm,
    challenges: certificationChallengesForScoring,
    allAnswers,
  });

  await certificationAssessmentHistoryRepository.save(certificationAssessmentHistory);

  await _saveV3Result({
    assessmentResult,
    certificationCourseId,
    certificationAssessmentScore,
    assessmentResultRepository,
    competenceMarkRepository,
  });

  return certificationCourse;
};

function isLackOfAnswersForTechnicalReason({ certificationCourse, certificationAssessmentScore }) {
  return certificationCourse.isAbortReasonTechnical() && certificationAssessmentScore.hasInsufficientCorrectAnswers();
}

export { calculateCertificationAssessmentScore, handleV3CertificationScoring, isLackOfAnswersForTechnicalReason };

function _selectAnswersMatchingCertificationChallenges(answers, certificationChallenges) {
  return answers.filter(({ challengeId }) => _.some(certificationChallenges, { challengeId }));
}

function _selectChallengesMatchingCompetences(certificationChallenges, testedCompetences) {
  return certificationChallenges.filter(({ competenceId }) => _.some(testedCompetences, { id: competenceId }));
}

function _getSumScoreFromCertifiedCompetences(listCompetences) {
  return _(listCompetences).map('obtainedScore').sum();
}

function _getCompetenceMarksWithCertifiedLevelAndScore(
  answers,
  listCompetences,
  reproducibilityRate,
  certificationChallenges,
  continueOnError,
  answerCollection,
  allAreas,
) {
  return listCompetences.map((competence) => {
    const challengesForCompetence = _.filter(certificationChallenges, { competenceId: competence.id });
    const answersForCompetence = _selectAnswersMatchingCertificationChallenges(answers, challengesForCompetence);

    if (!continueOnError) {
      CertificationContract.assertThatCompetenceHasAtLeastOneChallenge(challengesForCompetence, competence.index);
      CertificationContract.assertThatEveryAnswerHasMatchingChallenge(answersForCompetence, challengesForCompetence);
      CertificationContract.assertThatNoChallengeHasMoreThanOneAnswer(answersForCompetence, challengesForCompetence);
    }

    const certifiedLevel = CertifiedLevel.from({
      numberOfChallenges: answerCollection.numberOfChallengesForCompetence(competence.id),
      numberOfCorrectAnswers: answerCollection.numberOfCorrectAnswersForCompetence(competence.id),
      numberOfNeutralizedAnswers: answerCollection.numberOfNeutralizedChallengesForCompetence(competence.id),
      estimatedLevel: competence.estimatedLevel,
      reproducibilityRate,
    });
    const certifiedScore = CertifiedScore.from({ certifiedLevel, estimatedScore: competence.pixScore });
    const area = allAreas.find((area) => area.id === competence.areaId);
    return new CompetenceMark({
      level: scoringService.getBlockedLevel(certifiedLevel.value),
      score: scoringService.getBlockedPixScore(certifiedScore.value),
      area_code: area.code,
      competence_code: competence.index,
      competenceId: competence.id,
    });
  });
}

function _getCompetenceMarksWithFailedLevel(listCompetences, allAreas) {
  return listCompetences.map((competence) => {
    const area = allAreas.find((area) => area.id === competence.areaId);
    return new CompetenceMark({
      level: scoringService.getBlockedLevel(CertifiedLevel.invalidate().value),
      score: scoringService.getBlockedPixScore(0),
      area_code: area.code,
      competence_code: competence.index,
      competenceId: competence.id,
    });
  });
}

function _getResult(answers, certificationChallenges, testedCompetences, allAreas, continueOnError) {
  if (!continueOnError) {
    CertificationContract.assertThatWeHaveEnoughAnswers(answers, certificationChallenges);
  }

  const answerCollection = AnswerCollectionForScoring.from({ answers, challenges: certificationChallenges });

  const reproducibilityRate = ReproducibilityRate.from({
    numberOfNonNeutralizedChallenges: answerCollection.numberOfNonNeutralizedChallenges(),
    numberOfCorrectAnswers: answerCollection.numberOfCorrectAnswers(),
  });

  const hasEnoughNonNeutralizedChallengesToBeTrusted =
    CertificationContract.hasEnoughNonNeutralizedChallengesToBeTrusted(
      answerCollection.numberOfChallenges(),
      answerCollection.numberOfNonNeutralizedChallenges(),
    );

  if (!reproducibilityRate.isEnoughToBeCertified()) {
    return new CertificationAssessmentScore({
      competenceMarks: _getCompetenceMarksWithFailedLevel(testedCompetences, allAreas),
      percentageCorrectAnswers: reproducibilityRate.value,
      hasEnoughNonNeutralizedChallengesToBeTrusted,
    });
  }

  const competenceMarks = _getCompetenceMarksWithCertifiedLevelAndScore(
    answers,
    testedCompetences,
    reproducibilityRate.value,
    certificationChallenges,
    continueOnError,
    answerCollection,
    allAreas,
  );
  const scoreAfterRating = _getSumScoreFromCertifiedCompetences(competenceMarks);

  if (!continueOnError) {
    CertificationContract.assertThatScoreIsCoherentWithReproducibilityRate(scoreAfterRating, reproducibilityRate.value);
  }

  return new CertificationAssessmentScore({
    competenceMarks,
    percentageCorrectAnswers: reproducibilityRate.value,
    hasEnoughNonNeutralizedChallengesToBeTrusted,
  });
}

async function _getTestedCompetences({ userId, limitDate, version, placementProfileService }) {
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate, version });
  return _(placementProfile.userCompetences)
    .filter((uc) => uc.isCertifiable())
    .map((uc) => _.pick(uc, ['id', 'index', 'areaId', 'name', 'estimatedLevel', 'pixScore']))
    .value();
}

function _createV3AssessmentResult({
  allAnswers,
  certificationAssessment,
  certificationAssessmentScore,
  certificationCourse,
  juryId,
}) {
  if (certificationCourse.isRejectedForFraud()) {
    return AssessmentResultFactory.buildFraud({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      assessmentId: certificationAssessment.id,
      juryId,
    });
  }

  if (_shouldRejectWhenV3CertificationCandidateDidNotAnswerToEnoughQuestions({ allAnswers, certificationCourse })) {
    return AssessmentResultFactory.buildLackOfAnswers({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      status: certificationAssessmentScore.status,
      assessmentId: certificationAssessment.id,
      emitter: AssessmentResult.emitters.PIX_ALGO,
      juryId,
    });
  }

  if (_hasV3CertificationLacksOfAnswersForTechnicalReason({ allAnswers, certificationCourse })) {
    return AssessmentResultFactory.buildLackOfAnswersForTechnicalReason({
      pixScore: certificationAssessmentScore.nbPix,
      reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
      status: certificationAssessmentScore.status,
      assessmentId: certificationAssessment.id,
      emitter: AssessmentResult.emitters.PIX_ALGO,
      juryId,
    });
  }

  return AssessmentResultFactory.buildStandardAssessmentResult({
    pixScore: certificationAssessmentScore.nbPix,
    reproducibilityRate: certificationAssessmentScore.getPercentageCorrectAnswers(),
    status: certificationAssessmentScore.status,
    assessmentId: certificationAssessment.id,
    emitter: AssessmentResult.emitters.PIX_ALGO,
    juryId,
  });
}

async function _saveV3Result({
  assessmentResult,
  certificationCourseId,
  certificationAssessmentScore,
  assessmentResultRepository,
  competenceMarkRepository,
}) {
  const newAssessmentResult = await assessmentResultRepository.save({
    certificationCourseId,
    assessmentResult,
  });

  await bluebird.mapSeries(certificationAssessmentScore.competenceMarks, (competenceMark) => {
    const competenceMarkDomain = new CompetenceMark({
      ...competenceMark,
      assessmentResultId: newAssessmentResult.id,
    });
    return competenceMarkRepository.save(competenceMarkDomain);
  });
}

function _shouldRejectWhenV3CertificationCandidateDidNotAnswerToEnoughQuestions({ allAnswers, certificationCourse }) {
  if (certificationCourse.isAbortReasonTechnical()) {
    return false;
  }
  return _candidateDidNotAnswerEnoughV3CertificationQuestions({ allAnswers });
}

function _candidateDidNotAnswerEnoughV3CertificationQuestions({ allAnswers }) {
  return allAnswers.length < config.v3Certification.scoring.minimumAnswersRequiredToValidateACertification;
}

function _hasV3CertificationLacksOfAnswersForTechnicalReason({ allAnswers, certificationCourse }) {
  return (
    certificationCourse.isAbortReasonTechnical() && _candidateDidNotAnswerEnoughV3CertificationQuestions({ allAnswers })
  );
}
