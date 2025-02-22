import { NoCampaignParticipationForUserAndCampaign, NotFoundError } from '../../../../shared/domain/errors.js';
import { CampaignParticipationStatuses } from '../../../../shared/domain/models/index.js';

const getUserCampaignAssessmentResult = async function ({
  userId,
  campaignId,
  locale,
  badgeRepository,
  knowledgeElementRepository,
  badgeForCalculationRepository,
  participantResultRepository,
  stageRepository,
  stageAcquisitionRepository,
  compareStagesAndAcquiredStages,
}) {
  const { SHARED, TO_SHARE } = CampaignParticipationStatuses;
  const campaignParticipationStatus = await participantResultRepository.getCampaignParticipationStatus({
    userId,
    campaignId,
  });

  if (![TO_SHARE, SHARED].includes(campaignParticipationStatus)) {
    throw new NoCampaignParticipationForUserAndCampaign();
  }
  try {
    const [badges, knowledgeElements] = await Promise.all([
      badgeRepository.findByCampaignId(campaignId),
      knowledgeElementRepository.findUniqByUserId({ userId }),
    ]);
    const stillValidBadgeIds = await _checkStillValidBadges(
      campaignId,
      knowledgeElements,
      badgeForCalculationRepository,
    );
    const badgeWithAcquisitionPercentage = await _getBadgeAcquisitionPercentage(
      campaignId,
      knowledgeElements,
      badgeForCalculationRepository,
    );

    const badgesWithValidity = badges.map((badge) => ({
      ...badge,
      isValid: stillValidBadgeIds.includes(badge.id),
      acquisitionPercentage: badgeWithAcquisitionPercentage.find(
        (badgeForCalculation) => badgeForCalculation.id === badge.id,
      ).acquisitionPercentage,
    }));

    const [stages, acquiredStages] = await Promise.all([
      stageRepository.getByCampaignId(campaignId),
      stageAcquisitionRepository.getByCampaignIdAndUserId(campaignId, userId),
    ]);

    const stagesAndAcquiredStagesComparison = compareStagesAndAcquiredStages.compare(stages, acquiredStages);

    return await participantResultRepository.getByUserIdAndCampaignId({
      userId,
      campaignId,
      locale,
      badges: badgesWithValidity,
      stages,
      reachedStage: {
        ...stagesAndAcquiredStagesComparison.reachedStage,
        totalStage: stagesAndAcquiredStagesComparison.totalNumberOfStages,
        reachedStage: stagesAndAcquiredStagesComparison.reachedStageNumber,
      },
    });
  } catch (error) {
    if (error instanceof NotFoundError) throw new NoCampaignParticipationForUserAndCampaign();
    throw error;
  }
};

export { getUserCampaignAssessmentResult };

async function _checkStillValidBadges(campaignId, knowledgeElements, badgeForCalculationRepository) {
  const badgesForCalculation = await badgeForCalculationRepository.findByCampaignId({ campaignId });
  return badgesForCalculation.filter((badge) => badge.shouldBeObtained(knowledgeElements)).map(({ id }) => id);
}

async function _getBadgeAcquisitionPercentage(campaignId, knowledgeElements, badgeForCalculationRepository) {
  const badgesForCalculation = await badgeForCalculationRepository.findByCampaignId({ campaignId });
  return badgesForCalculation.map((badge) => ({
    id: badge.id,
    acquisitionPercentage: badge.getAcquisitionPercentage(knowledgeElements),
  }));
}
