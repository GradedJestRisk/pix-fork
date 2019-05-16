async function fetchForCampaigns({
  assessment,
  answerRepository,
  targetProfileRepository,
  challengeRepository,
  knowledgeElementRepository,
}) {
  return Promise.all([
    answerRepository.findByAssessment(assessment.id),
    ...(await targetProfileRepository.get(assessment.campaignParticipation.getTargetProfileId())
      .then((targetProfile) => Promise.all([targetProfile, challengeRepository.findBySkills(targetProfile.skills)]))),
    knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId }),
  ]);
}

async function fetchForCompetenceEvaluations({
  assessment,
  answerRepository,
  challengeRepository,
  knowledgeElementRepository,
  competenceEvaluationRepository,
  skillRepository,
}) {
  const competenceEvaluation = await competenceEvaluationRepository.getByAssessmentId(assessment.id);
  return Promise.all([
    answerRepository.findByAssessment(assessment.id),
    skillRepository.findByCompetenceId(competenceEvaluation.competenceId),
    challengeRepository.findByCompetenceId(competenceEvaluation.competenceId),
    knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId })]
  );
}

module.exports = {
  fetchForCampaigns,
  fetchForCompetenceEvaluations,
};
