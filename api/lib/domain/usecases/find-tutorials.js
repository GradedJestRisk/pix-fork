const { UserNotAuthorizedToAccessEntity } = require('../errors');
const Scorecard = require('../models/Scorecard');
const KnowledgeElement = require('../models/KnowledgeElement');
const _ = require('lodash');

module.exports = async function findTutorials({
  authenticatedUserId,
  scorecardId,
  knowledgeElementRepository,
  skillRepository,
  tubeRepository,
  tutorialRepository,
}) {

  const { userId, competenceId } = Scorecard.parseId(scorecardId);

  if (parseInt(authenticatedUserId) !== parseInt(userId)) {
    throw new UserNotAuthorizedToAccessEntity();
  }

  const knowledgeElements = await knowledgeElementRepository.findUniqByUserIdAndCompetenceId({ userId, competenceId });
  const invalidatedDirectKnowledgeElements = _getInvalidatedDirectKnowledgeElements(knowledgeElements);

  if (invalidatedDirectKnowledgeElements.length === 0) {
    return [];
  }
  const skills = await skillRepository.findByCompetenceId(competenceId);
  const failedSkills = _getFailedSkills(skills, invalidatedDirectKnowledgeElements);

  const skillsGroupedByTube = _getSkillsGroupedByTube(failedSkills);
  const easiestSkills = _getEasiestSkills(skillsGroupedByTube);

  const tubeNamesForTutorials = _.keys(skillsGroupedByTube);
  const tubes = await tubeRepository.findByNames(tubeNamesForTutorials);

  const tutorialsWithTubesList = await _getTutorialsWithTubesList(easiestSkills, tubes, tutorialRepository);
  return _.orderBy(_.flatten(tutorialsWithTubesList), 'tubeName');
};

async function _getTutorialsWithTubesList(easiestSkills, tubes, tutorialRepository) {
  return await Promise.all(_.map(easiestSkills, async (skill) => {
    const tube = _.find(tubes, { name: skill.tubeNameWithAt });
    const tutorials = await tutorialRepository.findByRecordIds(skill.tutorialIds);
    const enhancedTutorials = _.map(tutorials, (tutorial) => {
      tutorial.tubeName = tube.name;
      tutorial.tubePracticalTitle = tube.practicalTitle;
      tutorial.tubePracticalDescription = tube.practicalDescription;
      return tutorial;
    });
    return enhancedTutorials;
  }));
}

function _getEasiestSkills(skillsGroupByTube) {
  return _.map(skillsGroupByTube, _.head);
}

function _getSkillsGroupedByTube(failedSkills) {
  return _.groupBy(_(_.orderBy(failedSkills, 'difficulty')).uniq().value(), 'tubeNameWithAt');
}

function _getFailedSkills(skills, invalidatedDirectKnowledgeElements) {
  return _.filter(skills, (skill) => _.includes(_.map(invalidatedDirectKnowledgeElements, 'skillId'), skill.id));
}

function _getInvalidatedDirectKnowledgeElements(knowledgeElements) {
  return _.filter(knowledgeElements, (knowledgeElement) => (
    knowledgeElement.isInvalidated && (knowledgeElement.source === KnowledgeElement.SourceType.DIRECT)
  ));
}
