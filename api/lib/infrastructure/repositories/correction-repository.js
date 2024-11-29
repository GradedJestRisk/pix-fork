import _ from 'lodash';

import { Answer } from '../../../src/evaluation/domain/models/Answer.js';
import { Hint } from '../../../src/shared/domain/models/Hint.js';
import { Challenge } from '../../../src/shared/domain/models/index.js';
import { Correction } from '../../../src/shared/domain/models/index.js';
import { challengeDatasource } from '../../../src/shared/infrastructure/datasources/learning-content/index.js';
import * as skillRepository from '../../../src/shared/infrastructure/repositories/skill-repository.js';

const VALIDATED_HINT_STATUSES = ['Validé', 'pré-validé'];

const getByChallengeId = async function ({
  challengeId,
  answerValue,
  userId,
  locale,
  tutorialRepository,
  fromDatasourceObject,
  getCorrection,
} = {}) {
  const challenge = await challengeDatasource.get(challengeId);
  const skill = await _getSkill(challenge, locale);
  const hint = await _getHint(skill);
  const solution = fromDatasourceObject(challenge);
  let correctionDetails;

  const tutorials = await _getTutorials({
    userId,
    skill,
    tutorialIdsProperty: 'tutorialIds',
    locale,
    tutorialRepository,
  });
  const learningMoreTutorials = await _getTutorials({
    userId,
    skill,
    tutorialIdsProperty: 'learningMoreTutorialIds',
    locale,
    tutorialRepository,
  });

  if (challenge.type === Challenge.Type.QROCM_DEP && answerValue !== Answer.FAKE_VALUE_FOR_SKIPPED_QUESTIONS) {
    correctionDetails = getCorrection({ solution, answerValue });
  }

  return new Correction({
    id: challenge.id,
    solution: challenge.solution,
    solutionToDisplay: challenge.solutionToDisplay,
    hint,
    tutorials,
    learningMoreTutorials: learningMoreTutorials,
    answersEvaluation: correctionDetails?.answersEvaluation || [],
    solutionsWithoutGoodAnswers: correctionDetails?.solutionsWithoutGoodAnswers || [],
  });
};
export { getByChallengeId };

async function _getHint(skill) {
  if (_hasValidatedHint(skill) && skill.hint) {
    return new Hint({
      skillName: skill.name,
      value: skill.hint,
    });
  }
  return null;
}

function _getSkill(challengeDataObject, locale) {
  return skillRepository.get(challengeDataObject.skillId, { locale: locale?.slice(0, 2), useFallback: false });
}

function _hasValidatedHint(skill) {
  return VALIDATED_HINT_STATUSES.includes(skill.hintStatus);
}

async function _getTutorials({ userId, skill, tutorialIdsProperty, locale, tutorialRepository }) {
  const tutorialIds = skill[tutorialIdsProperty];
  if (!_.isEmpty(tutorialIds)) {
    const tutorials = await tutorialRepository.findByRecordIdsForCurrentUser({ ids: tutorialIds, userId, locale });
    tutorials.forEach((tutorial) => (tutorial.skillId = skill.id));
    return tutorials;
  }
  return [];
}
