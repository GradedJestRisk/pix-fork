import { AssessmentResultFactory } from '../../../src/certification/scoring/domain/models/factories/AssessmentResultFactory.js';
import { AlgorithmEngineVersion } from '../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { V3_REPRODUCIBILITY_RATE } from '../../../src/shared/domain/constants.js';
import { CertificationComputeError } from '../../../src/shared/domain/errors.js';
import { CertificationResult } from '../../../src/shared/domain/models/CertificationResult.js';
import { CertificationCourseRejected } from './CertificationCourseRejected.js';
import { CertificationCourseUnrejected } from './CertificationCourseUnrejected.js';
import { CertificationJuryDone } from './CertificationJuryDone.js';
import CertificationRescoredByScript from './CertificationRescoredByScript.js';
import { CertificationRescoringCompleted } from './CertificationRescoringCompleted.js';
import { ChallengeDeneutralized } from './ChallengeDeneutralized.js';
import { ChallengeNeutralized } from './ChallengeNeutralized.js';
import { checkEventTypes } from './check-event-types.js';

const eventTypes = [
  ChallengeNeutralized,
  ChallengeDeneutralized,
  CertificationJuryDone,
  CertificationCourseRejected,
  CertificationCourseUnrejected,
  CertificationRescoredByScript,
];

async function handleCertificationRescoring({
  event,
  assessmentResultRepository,
  certificationAssessmentRepository,
  scoringCertificationService,
  certificationEvaluationServices,
  certificationCourseRepository,
}) {
  checkEventTypes(event, eventTypes);

  const certificationAssessment = await certificationAssessmentRepository.getByCertificationCourseId({
    certificationCourseId: event.certificationCourseId,
  });

  if (certificationAssessment.isScoringBlockedDueToComplementaryOnlyChallenges) {
    return;
  }

  if (AlgorithmEngineVersion.isV3(certificationAssessment.version)) {
    return _handleV3CertificationScoring({
      certificationAssessment,
      event,
      locale: event.locale,
      certificationCourseRepository,
      certificationEvaluationServices,
    });
  }

  return _handleV2CertificationScoring({
    scoringCertificationService,
    certificationAssessment,
    event,
    assessmentResultRepository,
    certificationCourseRepository,
    certificationEvaluationServices,
  });
}

async function _handleV2CertificationScoring({
  event,
  certificationAssessment,
  assessmentResultRepository,
  certificationCourseRepository,
  scoringCertificationService,
  certificationEvaluationServices,
}) {
  const emitter = _getEmitterFromEvent(event);

  try {
    const { certificationCourse, certificationAssessmentScore } =
      await certificationEvaluationServices.handleV2CertificationScoring({
        event,
        emitter,
        certificationAssessment,
      });

    await _cancelCertificationCourseIfNotTrustableOrLackOfAnswersForTechnicalReason({
      certificationCourse,
      hasEnoughNonNeutralizedChallengesToBeTrusted:
        certificationAssessmentScore.hasEnoughNonNeutralizedChallengesToBeTrusted,
      certificationCourseRepository,
      certificationAssessmentScore,
      scoringCertificationService,
    });

    return new CertificationRescoringCompleted({
      userId: certificationAssessment.userId,
      certificationCourseId: certificationAssessment.certificationCourseId,
      reproducibilityRate: certificationAssessmentScore.percentageCorrectAnswers,
    });
  } catch (error) {
    if (!(error instanceof CertificationComputeError)) {
      throw error;
    }
    await _saveResultAfterCertificationComputeError({
      certificationAssessment,
      assessmentResultRepository,
      certificationCourseRepository,
      certificationComputeError: error,
      juryId: event.juryId,
      emitter,
    });
  }
}

async function _handleV3CertificationScoring({
  certificationAssessment,
  event,
  locale,
  certificationCourseRepository,
  certificationEvaluationServices,
}) {
  const emitter = _getEmitterFromEvent(event);
  const certificationCourse = await certificationEvaluationServices.handleV3CertificationScoring({
    event,
    emitter,
    certificationAssessment,
    locale,
  });

  if (certificationCourse.isCancelled()) {
    await certificationCourseRepository.update({ certificationCourse });
  }

  return new CertificationRescoringCompleted({
    userId: certificationAssessment.userId,
    certificationCourseId: certificationAssessment.certificationCourseId,
    reproducibilityRate: V3_REPRODUCIBILITY_RATE,
  });
}

async function _cancelCertificationCourseIfNotTrustableOrLackOfAnswersForTechnicalReason({
  certificationCourse,
  hasEnoughNonNeutralizedChallengesToBeTrusted,
  certificationCourseRepository,
  certificationAssessmentScore,
  scoringCertificationService,
}) {
  const lackOfAnswersForTechnicalReason = await scoringCertificationService.isLackOfAnswersForTechnicalReason({
    certificationCourse,
    certificationAssessmentScore,
  });

  if (!hasEnoughNonNeutralizedChallengesToBeTrusted || lackOfAnswersForTechnicalReason) {
    certificationCourse.cancel();
  } else {
    certificationCourse.uncancel();
  }

  return certificationCourseRepository.update({ certificationCourse });
}

async function _saveResultAfterCertificationComputeError({
  certificationAssessment,
  assessmentResultRepository,
  certificationComputeError,
  juryId,
  emitter,
}) {
  const assessmentResult = AssessmentResultFactory.buildAlgoErrorResult({
    error: certificationComputeError,
    assessmentId: certificationAssessment.id,
    juryId,
    emitter,
  });
  await assessmentResultRepository.save({
    certificationCourseId: certificationAssessment.certificationCourseId,
    assessmentResult,
  });
}

function _getEmitterFromEvent(event) {
  let emitter;

  if (event instanceof ChallengeNeutralized || event instanceof ChallengeDeneutralized) {
    emitter = CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION;
  }

  if (event instanceof CertificationJuryDone || event instanceof CertificationRescoredByScript) {
    emitter = CertificationResult.emitters.PIX_ALGO_AUTO_JURY;
  }

  if (event instanceof CertificationCourseRejected || event instanceof CertificationCourseUnrejected) {
    emitter = CertificationResult.emitters.PIX_ALGO_FRAUD_REJECTION;
  }

  return emitter;
}

handleCertificationRescoring.eventTypes = eventTypes;
export { handleCertificationRescoring };
