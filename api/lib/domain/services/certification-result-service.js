const _ = require('lodash');
const {
  MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED,
  PIX_COUNT_BY_LEVEL,
  UNCERTIFIED_LEVEL,
} = require('../constants');
const CertificationContract = require('../../domain/models/CertificationContract');
const scoringService = require('./scoring/scoring-service');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const placementProfileService = require('./placement-profile-service');
const { CertifiedLevel } = require('../models/CertifiedLevel');
const CompetenceAnswerCollectionForScoring = require('../models/CompetenceAnswerCollectionForScoring');

function _selectAnswersMatchingCertificationChallenges(answers, certificationChallenges) {
  return answers.filter(
    ({ challengeId }) => _.some(certificationChallenges, { challengeId }),
  );
}

function _selectChallengesMatchingCompetences(certificationChallenges, testedCompetences) {
  return certificationChallenges.filter(
    ({ competenceId }) => _.some(testedCompetences, { id: competenceId }),
  );
}

function _computedPixToRemovePerCompetence(certifiedLevel, pixScore) {
  if (certifiedLevel.isUncertified()) {
    return pixScore;
  }
  if (certifiedLevel.isDowngraded()) {
    return PIX_COUNT_BY_LEVEL;
  }
  return 0;
}

function _getSumScoreFromCertifiedCompetences(listCompetences) {
  return _(listCompetences).map('obtainedScore').sum();
}

function _getCompetencesWithCertifiedLevelAndScore(answers, listCompetences, reproducibilityRate, certificationChallenges, continueOnError) {
  return listCompetences.map((competence) => {
    const challengesForCompetence = _.filter(certificationChallenges, { competenceId: competence.id });
    const answersForCompetence = _selectAnswersMatchingCertificationChallenges(answers, challengesForCompetence);

    if (!continueOnError) {
      CertificationContract.assertThatCompetenceHasEnoughChallenge(challengesForCompetence, competence.index);
      CertificationContract.assertThatCompetenceHasEnoughAnswers(answersForCompetence, competence.index);
      CertificationContract.assertThatEveryAnswerHasMatchingChallenge(answersForCompetence, challengesForCompetence);
    }

    const competenceAnswerCollection = CompetenceAnswerCollectionForScoring.from({ answersForCompetence, challengesForCompetence });

    const certifiedLevel = CertifiedLevel.from({
      numberOfChallengesAnswered: competenceAnswerCollection.numberOfChallengesAnswered(),
      numberOfCorrectAnswers: competenceAnswerCollection.numberOfCorrectAnswers(),
      estimatedLevel: competence.estimatedLevel,
      reproducibilityRate,
    });
    return {
      name: competence.name,
      index: competence.index,
      area_code: competence.area.code,
      id: competence.id,
      positionedLevel: scoringService.getBlockedLevel(competence.estimatedLevel),
      positionedScore: competence.pixScore,
      obtainedLevel: scoringService.getBlockedLevel(certifiedLevel.value),
      obtainedScore: competence.pixScore - _computedPixToRemovePerCompetence(certifiedLevel, competence.pixScore),
    };
  });
}

function _getCompetenceWithFailedLevel(listCompetences) {
  return listCompetences.map((competence) => {
    return {
      name: competence.name,
      index: competence.index,
      area_code: competence.area.code,
      id: competence.id,
      positionedLevel: competence.estimatedLevel,
      positionedScore: competence.pixScore,
      obtainedLevel: UNCERTIFIED_LEVEL,
      obtainedScore: 0,
    };
  });
}

function _getResult(answers, certificationChallenges, testedCompetences, continueOnError) {

  if (!continueOnError) {
    CertificationContract.assertThatWeHaveEnoughAnswers(answers, certificationChallenges);
  }

  const reproducibilityRate = Math.round(_computeAnswersSuccessRate(answers));
  if (reproducibilityRate < MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED) {
    return {
      competencesWithMark: _getCompetenceWithFailedLevel(testedCompetences),
      totalScore: 0,
      percentageCorrectAnswers: reproducibilityRate,
    };
  }

  const competencesWithMark = _getCompetencesWithCertifiedLevelAndScore(answers, testedCompetences, reproducibilityRate, certificationChallenges, continueOnError);
  const scoreAfterRating = _getSumScoreFromCertifiedCompetences(competencesWithMark);

  if (!continueOnError) {
    CertificationContract.assertThatScoreIsCoherentWithReproducibilityRate(scoreAfterRating, reproducibilityRate);
  }

  return { competencesWithMark, totalScore: scoreAfterRating, percentageCorrectAnswers: reproducibilityRate };
}

function _getChallengeInformation(listAnswers, certificationChallenges, competences) {
  return listAnswers.map((answer) => {

    const certificationChallengeRelatedToAnswer = certificationChallenges.find(
      (certificationChallenge) => certificationChallenge.challengeId === answer.challengeId,
    ) || {};

    const competenceValidatedByCertifChallenge = competences.find((competence) => competence.id === certificationChallengeRelatedToAnswer.competenceId) || {};

    return {
      result: answer.result.status,
      value: answer.value,
      challengeId: answer.challengeId,
      competence: competenceValidatedByCertifChallenge.index || '',
      skill: certificationChallengeRelatedToAnswer.associatedSkillName || '',
    };
  });
}

async function _getTestedCompetences({ userId, limitDate, isV2Certification }) {
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate, isV2Certification });
  return _(placementProfile.userCompetences)
    .filter((uc) => uc.isCertifiable())
    .map((uc) => _.pick(uc, ['id', 'area', 'index', 'name', 'estimatedLevel', 'pixScore']))
    .value();
}

function _computeAnswersSuccessRate(answers = []) {
  const numberOfAnswers = answers.length;

  if (!numberOfAnswers) {
    return 0;
  }

  const numberOfValidAnswers = answers.filter((answer) => answer.isOk()).length;

  return (numberOfValidAnswers % 100 / numberOfAnswers) * 100;
}

module.exports = {
  async getCertificationResult({ certificationAssessment, continueOnError }) {
    const allPixCompetences = await competenceRepository.listPixCompetencesOnly();
    const allChallenges = await challengeRepository.findOperative();

    // userService.getPlacementProfile() + filter level > 0 => avec allCompetence (bug)
    const testedCompetences = await _getTestedCompetences({
      userId: certificationAssessment.userId,
      limitDate: certificationAssessment.createdAt,
      isV2Certification: certificationAssessment.isV2Certification,
    });

    // map sur challenges filtre sur competence Id - S'assurer qu'on ne travaille que sur les compétences certifiables
    const matchingCertificationChallenges = _selectChallengesMatchingCompetences(certificationAssessment.certificationChallenges, testedCompetences);

    // decoration des challenges en ajoutant le type
    matchingCertificationChallenges.forEach((certifChallenge) => {
      const challenge = _.find(allChallenges, { id: certifChallenge.challengeId });
      certifChallenge.type = challenge ? challenge.type : 'EmptyType';
    });

    // map sur challenges filtre sur challenge Id
    const matchingAnswers = _selectAnswersMatchingCertificationChallenges(certificationAssessment.certificationAnswersByDate, matchingCertificationChallenges);

    const result = _getResult(matchingAnswers, matchingCertificationChallenges, testedCompetences, continueOnError);

    result.createdAt = certificationAssessment.createdAt;
    result.userId = certificationAssessment.userId;
    result.status = certificationAssessment.state;
    result.completedAt = certificationAssessment.completedAt;

    result.listChallengesAndAnswers = _getChallengeInformation(matchingAnswers, certificationAssessment.certificationChallenges, allPixCompetences);
    return result;
  },

  _computeAnswersSuccessRate,
};

