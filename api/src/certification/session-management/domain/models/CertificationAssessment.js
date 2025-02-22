import JoiDate from '@joi/date';
import BaseJoi from 'joi';
const Joi = BaseJoi.extend(JoiDate);
import _ from 'lodash';

import { AnswerStatus } from '../../../../shared/domain/models/AnswerStatus.js';
import { validateEntity } from '../../../../shared/domain/validators/entity-validator.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { ChallengeToBeDeneutralizedNotFoundError, ChallengeToBeNeutralizedNotFoundError } from '../errors.js';
import { CertificationAnswerStatusChangeAttempt } from './CertificationAnswerStatusChangeAttempt.js';
import { NeutralizationAttempt } from './NeutralizationAttempt.js';

const states = {
  COMPLETED: 'completed',
  STARTED: 'started',
  ENDED_BY_SUPERVISOR: 'endedBySupervisor',
  ENDED_DUE_TO_FINALIZATION: 'endedDueToFinalization',
};

const certificationAssessmentSchema = Joi.object({
  id: Joi.number().integer().required(),
  userId: Joi.number().integer().required(),
  certificationCourseId: Joi.number().integer().required(),
  createdAt: Joi.date().required(),
  completedAt: Joi.date().allow(null),
  endedAt: Joi.date().allow(null),
  state: Joi.string()
    .valid(states.COMPLETED, states.STARTED, states.ENDED_BY_SUPERVISOR, states.ENDED_DUE_TO_FINALIZATION)
    .required(),
  version: Joi.number()
    .integer()
    .valid(...Object.values(AlgorithmEngineVersion))
    .required(),
  certificationChallenges: Joi.array().min(1).required(),
  certificationAnswersByDate: Joi.array().min(0).required(),
});

class CertificationAssessment {
  constructor({
    id,
    userId,
    certificationCourseId,
    createdAt,
    completedAt,
    state,
    version,
    certificationChallenges,
    certificationAnswersByDate,
    endedAt,
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.certificationCourseId = certificationCourseId;
    this.createdAt = createdAt;
    this.completedAt = completedAt;
    this.endedAt = endedAt;
    this.state = state;
    this.version = version;
    this.certificationChallenges = certificationChallenges;
    this.certificationAnswersByDate = certificationAnswersByDate;

    validateEntity(certificationAssessmentSchema, this);
  }

  getCertificationChallenge(challengeId) {
    return _.find(this.certificationChallenges, { challengeId }) || null;
  }

  getAnswerByQuestionNumber(questionNumber) {
    return this.certificationAnswersByDate[questionNumber - 1];
  }

  neutralizeChallengeByRecId(recId) {
    const challengeToBeNeutralized = _.find(this.certificationChallenges, { challengeId: recId });
    if (challengeToBeNeutralized) {
      challengeToBeNeutralized.neutralize();
    } else {
      throw new ChallengeToBeNeutralizedNotFoundError();
    }
  }

  endDueToFinalization() {
    if (this.state === states.STARTED) {
      this.state = states.ENDED_DUE_TO_FINALIZATION;
      this.endedAt = this._getLastChallenge().createdAt;
    }
  }

  endBySupervisor({ now }) {
    this.state = states.ENDED_BY_SUPERVISOR;
    this.endedAt = now;
  }

  neutralizeChallengeByNumberIfKoOrSkipped(questionNumber) {
    const toBeNeutralizedChallengeAnswer = this.getAnswerByQuestionNumber(questionNumber);
    if (!toBeNeutralizedChallengeAnswer) {
      return NeutralizationAttempt.failure(questionNumber);
    }

    if (_isAnswerKoOrSkipped(toBeNeutralizedChallengeAnswer.result.status)) {
      const challengeToBeNeutralized = _.find(this.certificationChallenges, {
        challengeId: toBeNeutralizedChallengeAnswer.challengeId,
      });
      challengeToBeNeutralized.neutralize();
      return NeutralizationAttempt.neutralized(questionNumber);
    }

    return NeutralizationAttempt.skipped(questionNumber);
  }

  deneutralizeChallengeByRecId(recId) {
    const challengeToBeDeneutralized = _.find(this.certificationChallenges, { challengeId: recId });
    if (challengeToBeDeneutralized) {
      challengeToBeDeneutralized.deneutralize();
    } else {
      throw new ChallengeToBeDeneutralizedNotFoundError();
    }
  }

  validateAnswerByNumberIfFocusedOut(questionNumber) {
    const challengeAnswer = this.getAnswerByQuestionNumber(questionNumber);
    if (!challengeAnswer) {
      return CertificationAnswerStatusChangeAttempt.failed(questionNumber);
    }

    if (challengeAnswer.result.isFOCUSEDOUT()) {
      challengeAnswer.result = AnswerStatus.OK;
      return CertificationAnswerStatusChangeAttempt.changed(questionNumber);
    }

    return CertificationAnswerStatusChangeAttempt.skipped(questionNumber);
  }

  findAnswersAndChallengesForCertifiableBadgeKey(certifiableBadgeKey) {
    const certificationChallengesForBadge = _.filter(this.certificationChallenges, { certifiableBadgeKey });
    const challengeIds = _.map(certificationChallengesForBadge, 'challengeId');
    const answersForBadge = _.filter(this.certificationAnswersByDate, ({ challengeId }) =>
      _.includes(challengeIds, challengeId),
    );
    return {
      certificationChallenges: certificationChallengesForBadge,
      certificationAnswers: answersForBadge,
    };
  }

  isCompleted() {
    return this.state === states.COMPLETED;
  }

  getChallengeRecIdByQuestionNumber(questionNumber) {
    return this.getAnswerByQuestionNumber(questionNumber)?.challengeId;
  }

  skipUnansweredChallenges() {
    this.certificationChallenges.forEach((certificationChallenge) => {
      if (
        !this.certificationAnswersByDate.some(
          (certificationAnswer) => certificationChallenge.challengeId === certificationAnswer.challengeId,
        )
      ) {
        certificationChallenge.skipAutomatically();
      }
    });
  }

  neutralizeUnansweredChallenges() {
    this.certificationChallenges.map((certificationChallenge) => {
      if (
        !this.certificationAnswersByDate.some(
          (certificationAnswer) => certificationChallenge.challengeId === certificationAnswer.challengeId,
        )
      ) {
        certificationChallenge.neutralize();
      }
    });
  }

  static get uncompletedAssessmentStates() {
    return [states.STARTED, states.ENDED_BY_SUPERVISOR, states.ENDED_DUE_TO_FINALIZATION];
  }

  get isComplementaryOnly() {
    return this.certificationChallenges.every(
      (certificationChallenge) => certificationChallenge.certifiableBadgeKey !== null,
    );
  }

  get isScoringBlockedDueToComplementaryOnlyChallenges() {
    return this.isComplementaryOnly;
  }

  _getLastChallenge() {
    return _.orderBy(this.certificationChallenges, 'createdAt', 'desc')[0];
  }
}

function _isAnswerKoOrSkipped(answerStatus) {
  const isKo = AnswerStatus.isKO(answerStatus);
  const isSkipped = AnswerStatus.isSKIPPED(answerStatus);
  return isKo || isSkipped;
}

CertificationAssessment.states = states;

export { CertificationAssessment, states };
