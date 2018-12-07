const _ = require('lodash');

// This file implements methods useful for a CAT algorithm
// https://en.wikipedia.org/wiki/Computerized_adaptive_testing
// https://en.wikipedia.org/wiki/Item_response_theory

module.exports = {
  findMaxRewardingChallenges: findMaxRewardingChallenge,
  getPredictedLevel: getPredictedLevel,
  hasReachedStabilityPoint: hasReachedStabilityPoint
};

function findMaxRewardingChallenge({ availableChallenges, predictedLevel, courseTubes, knowledgeElements }) {

  const challengesAndRewards = _.map(availableChallenges, (challenge) => {
    return {
      challenge: challenge,
      reward: computeReward({ challenge, predictedLevel, courseTubes, knowledgeElements })
    };
  });

  const challengeWithMaxReward = _.maxBy(challengesAndRewards, 'reward');
  const maxReward = challengeWithMaxReward.reward;

  const maxRewardingChallenges = challengesAndRewards
    .filter((challengeAndReward) => challengeAndReward.reward === maxReward)
    .map((challengeAndReward) => challengeAndReward.challenge);

  return { maxRewardingChallenges, maxReward };

}

function computeReward({ challenge, predictedLevel, courseTubes, knowledgeElements }) {
  const proba = _probaOfCorrectAnswer(predictedLevel, challenge.hardestSkill.difficulty);
  const nbExtraSkillsIfSolved = _getNewSkillsInfoIfChallengeSolved(challenge, courseTubes, knowledgeElements).length;
  const nbFailedSkillsIfUnsolved = _getNewSkillsInfoIfChallengeUnsolved(challenge, courseTubes, knowledgeElements).length;

  return proba * nbExtraSkillsIfSolved + (1 - proba) * nbFailedSkillsIfUnsolved;
}

function getPredictedLevel(knowledgeElements, skills) {
  let maxLikelihood = -Infinity;
  let level = 0.5;
  let predictedLevel = 0.5;

  while (level < 8) {
    const likelihood = _computeProbabilityOfCorrectLevelPredicted(level, knowledgeElements, skills);
    if (likelihood > maxLikelihood) {
      maxLikelihood = likelihood;
      predictedLevel = level;
    }
    level += 0.5;
  }
  return predictedLevel;
}

function _computeProbabilityOfCorrectLevelPredicted(level, knowledgeElements, skills) {

  const directKnowledgeElements = _.filter(knowledgeElements, (ke)=> ke.source === 'direct');
  const extraAnswers = directKnowledgeElements.map((ke)=> {
    const skill = skills.find((skill) => skill.id === ke.skillId);
    const maxDifficulty = skill.difficulty || 2;
    const binaryOutcome = (ke.status === 'validated') ? 1 : 0;
    return { binaryOutcome, maxDifficulty };
  });

  const answerThatAnyoneCanSolve = { maxDifficulty: 0, binaryOutcome: 1 };
  const answerThatNobodyCanSolve = { maxDifficulty: 7, binaryOutcome: 0 };
  extraAnswers.push(answerThatAnyoneCanSolve, answerThatNobodyCanSolve);

  const diffBetweenResultAndProbaToResolve = extraAnswers.map((answer) =>
    answer.binaryOutcome - _probaOfCorrectAnswer(level, answer.maxDifficulty));

  return -Math.abs(diffBetweenResultAndProbaToResolve.reduce((a, b) => a + b));
}

function _getNewSkillsInfoIfChallengeSolved(challenge, courseTubes, knowledgeElements) {
  return challenge.skills.reduce((extraValidatedSkills, skill) => {
    _findTubeByName(courseTubes, skill.tubeName).getEasierThan(skill).forEach((skill) => {
      if (_skillNotTestedYet(skill, knowledgeElements)) {
        extraValidatedSkills.push(skill);
      }
    });
    return extraValidatedSkills;
  }, []);
}

function _getNewSkillsInfoIfChallengeUnsolved(challenge, courseTubes, knowledgeElements) {
  return _findTubeByName(courseTubes, challenge.hardestSkill.tubeName).getHarderThan(challenge.hardestSkill)
    .reduce((extraFailedSkills, skill) => {
      if (_skillNotTestedYet(skill, knowledgeElements)) {
        extraFailedSkills.push(skill);
      }
      return extraFailedSkills;
    }, []);
}

function _findTubeByName(courseTubes, tubeName) {
  return courseTubes.find((tube) => tube.name === tubeName);
}

function _skillNotTestedYet(skill, knowledgesElements) {
  const skillsAlreadyTested = _.map(knowledgesElements, 'skillId');
  return !skillsAlreadyTested.includes(skill.id);
}

// The probability P(gap) of giving the correct answer is given by the "logistic function"
// https://en.wikipedia.org/wiki/Logistic_function
function _probaOfCorrectAnswer(userEstimatedLevel, challengeDifficulty) {
  return 1 / (1 + Math.exp(-(userEstimatedLevel - challengeDifficulty)));
}

function hasReachedStabilityPoint(maxReward) {
  return _.isNumber(maxReward) && maxReward === 0;
}
