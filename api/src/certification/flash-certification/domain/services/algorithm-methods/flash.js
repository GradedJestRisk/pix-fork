import lodash from 'lodash';

import { logger } from '../../../../../shared/infrastructure/utils/logger.js';

const { orderBy, range, sortBy, sortedUniqBy } = lodash;

const DEFAULT_CAPACITY = 0;
const START_OF_SAMPLES = -9;
const STEP_OF_SAMPLES = 18 / 80;
const END_OF_SAMPLES = 9 + STEP_OF_SAMPLES;
const samples = range(START_OF_SAMPLES, END_OF_SAMPLES, STEP_OF_SAMPLES);
const DEFAULT_PROBABILITY_TO_ANSWER = 1;
const DEFAULT_ERROR_RATE = 5;
const ERROR_RATE_CLASS_INTERVAL = 9 / 80;

const MAX_NUMBER_OF_RETURNED_CHALLENGES = 5;

export {
  calculateTotalPixScoreAndScoreByCompetence,
  getCapacityAndErrorRate,
  getCapacityAndErrorRateHistory,
  getChallengesForNonAnsweredSkills,
  getPossibleNextChallenges,
  getReward,
};

function getPossibleNextChallenges({
  availableChallenges,
  capacity = DEFAULT_CAPACITY,
  options: { minimalSuccessRate = 0 } = {},
} = {}) {
  const challengesWithReward = availableChallenges.map((challenge) => {
    return {
      challenge,
      reward: getReward({
        capacity,
        discriminant: challenge.discriminant,
        difficulty: challenge.difficulty,
      }),
    };
  });

  return _findBestPossibleChallenges(challengesWithReward, minimalSuccessRate, capacity);
}

function getCapacityAndErrorRate({
  allAnswers,
  challenges,
  capacity = DEFAULT_CAPACITY,
  doubleMeasuresUntil = 0,
  variationPercent,
  variationPercentUntil,
}) {
  if (allAnswers.length === 0) {
    return { capacity, errorRate: DEFAULT_ERROR_RATE };
  }

  const capacityHistory = getCapacityAndErrorRateHistory({
    allAnswers,
    challenges,
    capacity,
    doubleMeasuresUntil,
    variationPercent,
    variationPercentUntil,
  });

  return capacityHistory.at(-1);
}

function getCapacityAndErrorRateHistory({
  allAnswers,
  challenges,
  capacity = DEFAULT_CAPACITY,
  doubleMeasuresUntil = 0,
  variationPercent,
  variationPercentUntil,
}) {
  let latestCapacity = capacity;

  let likelihood = samples.map(() => DEFAULT_PROBABILITY_TO_ANSWER);
  let normalizedPosteriori;
  let answerIndex = 0;
  let answer;

  const capacityHistory = [];

  while (answerIndex < allAnswers.length) {
    answer = allAnswers[answerIndex];
    const variationPercentForCurrentAnswer = _defineVariationPercentForCurrentAnswer(
      variationPercent,
      variationPercentUntil,
      answerIndex,
    );

    if (!_shouldUseDoubleMeasure({ doubleMeasuresUntil, answerIndex, answersLength: allAnswers.length })) {
      ({ latestCapacity, likelihood, normalizedPosteriori } = _singleMeasure({
        challenges,
        answer,
        latestCapacity,
        likelihood,
        normalizedPosteriori,
        variationPercent: variationPercentForCurrentAnswer,
      }));

      answerIndex++;
    } else {
      answer = allAnswers[answerIndex];
      const answer2 = allAnswers[answerIndex + 1];
      ({ latestCapacity, likelihood, normalizedPosteriori } = _doubleMeasure({
        challenges,
        answers: [answer, answer2],
        latestCapacity,
        likelihood,
        normalizedPosteriori,
        variationPercent: variationPercentForCurrentAnswer,
      }));

      answerIndex += 2;
    }

    capacityHistory.push({
      answerId: answer.id,
      capacity: latestCapacity,
      errorRate: _computeCorrectedErrorRate(latestCapacity, normalizedPosteriori),
    });
  }

  return capacityHistory;
}

function _defineVariationPercentForCurrentAnswer(variationPercent, variationPercentUntil, answerIndex) {
  if (!variationPercentUntil) {
    return variationPercent;
  }

  return variationPercentUntil >= answerIndex ? variationPercent : undefined;
}

function _shouldUseDoubleMeasure({ doubleMeasuresUntil, answerIndex, answersLength }) {
  const isLastAnswer = answersLength === answerIndex + 1;
  return doubleMeasuresUntil > answerIndex && !isLastAnswer;
}

function _singleMeasure({ challenges, answer, latestCapacity, likelihood, normalizedPosteriori, variationPercent }) {
  const answeredChallenge = _findChallengeForAnswer(challenges, answer);

  const normalizedPrior = _computeNormalizedPrior(latestCapacity);

  likelihood = _computeLikelihood(answeredChallenge, answer, likelihood);

  normalizedPosteriori = _computeNormalizedPosteriori(likelihood, normalizedPrior);

  latestCapacity = _computeCapacity(latestCapacity, variationPercent, normalizedPosteriori);
  return { latestCapacity, likelihood, normalizedPosteriori };
}

function _doubleMeasure({ challenges, answers, latestCapacity, likelihood, normalizedPosteriori, variationPercent }) {
  const answeredChallenge1 = _findChallengeForAnswer(challenges, answers[0]);
  const answeredChallenge2 = _findChallengeForAnswer(challenges, answers[1]);

  const normalizedPrior = _computeNormalizedPrior(latestCapacity);

  likelihood = _computeDoubleMeasureLikelihood([answeredChallenge1, answeredChallenge2], answers, likelihood);

  normalizedPosteriori = _computeNormalizedPosteriori(likelihood, normalizedPrior);

  latestCapacity = _computeCapacity(latestCapacity, variationPercent, normalizedPosteriori);
  return { latestCapacity, likelihood, normalizedPosteriori };
}

function _computeNormalizedPrior(gaussianMean) {
  return _normalizeDistribution(
    samples.map((sample) =>
      _getGaussianValue({
        gaussianMean: gaussianMean,
        value: sample,
      }),
    ),
  );
}

function _computeLikelihood(answeredChallenge, answer, previousLikelihood) {
  return samples.map((sample, index) => {
    let probability = _getProbability(sample, answeredChallenge.discriminant, answeredChallenge.difficulty);
    probability = answer.isOk() ? probability : 1 - probability;
    return previousLikelihood[index] * probability;
  });
}

function _computeDoubleMeasureLikelihood(answeredChallenges, answers, previousLikelihood) {
  return samples.map((sample, index) => {
    let probability1 = _getProbability(sample, answeredChallenges[0].discriminant, answeredChallenges[0].difficulty);
    let probability2 = _getProbability(sample, answeredChallenges[1].discriminant, answeredChallenges[1].difficulty);
    probability1 = answers[0].isOk() ? probability1 : 1 - probability1;
    probability2 = answers[1].isOk() ? probability2 : 1 - probability2;
    return (previousLikelihood[index] * (probability1 + probability2)) / 2;
  });
}

function _computeNormalizedPosteriori(likelihood, normalizedGaussian) {
  const posteriori = samples.map((_, index) => likelihood[index] * normalizedGaussian[index]);

  return _normalizeDistribution(posteriori);
}

function _computeCapacity(previousCapacity, variationPercent, normalizedPosteriori) {
  const rawNextCapacity = lodash.sum(samples.map((sample, index) => sample * normalizedPosteriori[index]));

  return variationPercent
    ? _limitCapacityVariation(previousCapacity, rawNextCapacity, variationPercent)
    : rawNextCapacity;
}

function _computeCorrectedErrorRate(latestCapacity, normalizedPosteriori) {
  const rawErrorRate = lodash.sum(
    samples.map((sample, index) => normalizedPosteriori[index] * (sample - latestCapacity) ** 2),
  );

  return Math.sqrt(rawErrorRate - (ERROR_RATE_CLASS_INTERVAL ** 2) / 12.0); // prettier-ignore
}

function getChallengesForNonAnsweredSkills({ allAnswers, challenges }) {
  const alreadyAnsweredSkillsIds = allAnswers
    .map((answer) => _findChallengeForAnswer(challenges, answer))
    .map((challenge) => challenge.skill.id);

  const isNonAnsweredSkill = (skill) => !alreadyAnsweredSkillsIds.includes(skill.id);
  const challengesForNonAnsweredSkills = challenges.filter((challenge) => isNonAnsweredSkill(challenge.skill));

  return challengesForNonAnsweredSkills;
}

function calculateTotalPixScoreAndScoreByCompetence({ allAnswers, challenges, capacity }) {
  const succeededChallenges = _getDirectSucceededChallenges({ allAnswers, challenges });

  const inferredChallenges = _getInferredChallenges({
    challenges: getChallengesForNonAnsweredSkills({ allAnswers, challenges }),
    capacity,
  });

  return _sumPixScoreAndScoreByCompetence([...succeededChallenges, ...inferredChallenges]);
}

function _limitCapacityVariation(previousCapacity, nextCapacity, variationPercent) {
  const hasSmallCapacity = -variationPercent < previousCapacity && previousCapacity < variationPercent;

  const gap = hasSmallCapacity ? variationPercent : Math.abs(previousCapacity * variationPercent);

  return nextCapacity > previousCapacity
    ? Math.min(nextCapacity, previousCapacity + gap)
    : Math.max(nextCapacity, previousCapacity - gap);
}

function _findBestPossibleChallenges(challengesWithReward, minimumSuccessRate, capacity) {
  const hasMinimumSuccessRate = ({ challenge }) => {
    const successProbability = _getProbability(capacity, challenge.discriminant, challenge.difficulty);

    return successProbability >= minimumSuccessRate;
  };

  const orderedChallengesWithReward = orderBy(
    challengesWithReward,
    [hasMinimumSuccessRate, 'reward'],
    ['desc', 'desc'],
  );

  const possibleChallengesWithReward = orderedChallengesWithReward.slice(0, MAX_NUMBER_OF_RETURNED_CHALLENGES);

  return possibleChallengesWithReward.map(({ challenge }) => challenge);
}

function _getDirectSucceededChallenges({ allAnswers, challenges }) {
  const correctAnswers = allAnswers.filter((answer) => answer.isOk());
  return correctAnswers.map((answer) => _findChallengeForAnswer(challenges, answer));
}

function _getInferredChallenges({ challenges, capacity }) {
  const challengesForInferrence = _findChallengesForInferrence(challenges);
  return challengesForInferrence.filter((challenge) => capacity >= challenge.minimumCapability);
}

/**
 * Returns a list of challenges containing for each skill
 * the challenge with the lowest minimum capability,
 * prioritizing validated challenges over archived ones.
 *
 * @param {import('../../../../../shared/domain/models/Challenge.js')[]} challenges
 * @returns A list of challenges for scoring inferrence
 */
function _findChallengesForInferrence(challenges) {
  return sortedUniqBy(
    orderBy(challenges, ['skill.id', getChallengePriorityForInferrence, 'minimumCapability']),
    'skill.id',
  );
}

const challengeStatusPriorityForInferrence = ['validé', 'archivé'];

function getChallengePriorityForInferrence(challenge) {
  const priority = challengeStatusPriorityForInferrence.indexOf(challenge.status);
  return priority === -1 ? 100 : priority;
}

function _findChallengeForAnswer(challenges, answer) {
  const challengeAssociatedToAnswer = challenges.find((challenge) => challenge.id === answer.challengeId);
  if (!challengeAssociatedToAnswer) {
    logger.warn({ answer }, 'Cannot find a challenge associated to answer.challengeId');
  }
  return challengeAssociatedToAnswer;
}

function _sumPixScoreAndScoreByCompetence(challenges) {
  const scoreBySkillId = {};
  const scoreByCompetenceId = {};

  for (const challenge of challenges) {
    const { id: skillId, competenceId, pixValue } = challenge.skill;

    if (scoreBySkillId[skillId]) continue;

    scoreBySkillId[skillId] = pixValue;

    const previousCompetenceScore = scoreByCompetenceId[competenceId] ?? 0;

    scoreByCompetenceId[competenceId] = pixValue + previousCompetenceScore;
  }

  const pixScore = Object.values(scoreBySkillId).reduce((sum, pixValue) => sum + pixValue, 0);
  const pixScoreByCompetence = sortBy(
    Object.entries(scoreByCompetenceId).map(([competenceId, pixScore]) => ({
      competenceId,
      pixScore,
    })),
    'competenceId',
  );

  return { pixScore, pixScoreByCompetence };
}

function getReward({ capacity, discriminant, difficulty }) {
  const probability = _getProbability(capacity, discriminant, difficulty);
  return probability * (1 - probability) * Math.pow(discriminant, 2);
}

// Parameters are not wrapped inside an object for performance reasons
// It avoids creating an object before each call which will trigger lots of
// garbage collection, especially when running simulators
function _getProbability(capacity, discriminant, difficulty) {
  return 1 / (1 + Math.exp(discriminant * (difficulty - capacity)));
}

function _getGaussianValue({ gaussianMean, value }) {
  const variance = 1.5;
  return Math.exp(Math.pow(value - gaussianMean, 2) / (-2 * variance)) / (Math.sqrt(variance) * Math.sqrt(2 * Math.PI));
}

function _normalizeDistribution(data) {
  const sum = lodash.sum(data);
  return data.map((value) => value / sum);
}
