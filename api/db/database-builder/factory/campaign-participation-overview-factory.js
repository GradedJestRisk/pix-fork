const buildAssessment = require('./build-assessment');
const buildCampaign = require('./build-campaign');
const buildCampaignParticipation = require('./build-campaign-participation');
const buildCampaignSkill = require('./build-campaign-skill');
const buildUser = require('./build-user');
const Assessment = require('../../../lib/domain/models/Assessment');
const CampaignParticipationStatuses = require('../../../lib/domain/models/CampaignParticipationStatuses');

const { STARTED, SHARED, TO_SHARE } = CampaignParticipationStatuses;

module.exports = {
  build({
    userId,
    createdAt,
    sharedAt,
    assessmentCreatedAt,
    assessmentState,
    campaignId,
    deletedAt,
    deletedBy,
    id,
  } = {}) {
    const status = assessmentState === Assessment.states.COMPLETED ? TO_SHARE : STARTED;

    const campaignParticipation = buildCampaignParticipation({
      userId,
      campaignId,
      createdAt: createdAt,
      sharedAt: sharedAt,
      status: sharedAt ? SHARED : status,
      deletedAt,
      deletedBy,
    });

    buildAssessment({
      id,
      userId,
      campaignParticipationId: campaignParticipation.id,
      state: assessmentState,
      createdAt: assessmentCreatedAt,
    });

    return campaignParticipation;
  },

  buildOnGoing({ userId, createdAt, assessmentCreatedAt, campaignSkills } = {}) {
    const campaign = buildCampaign();
    campaignSkills.forEach((skill) => buildCampaignSkill({ campaignId: campaign.id, skillId: skill }));

    const campaignParticipation = buildCampaignParticipation({
      userId,
      createdAt: createdAt,
      sharedAt: null,
      status: STARTED,
      campaignId: campaign.id,
    });

    buildAssessment({
      userId,
      campaignParticipationId: campaignParticipation.id,
      state: Assessment.states.STARTED,
      createdAt: assessmentCreatedAt,
    });

    return campaignParticipation;
  },

  buildToShare({ userId, createdAt, assessmentCreatedAt, campaignSkills } = {}) {
    const campaign = buildCampaign();
    campaignSkills.forEach((skill) => buildCampaignSkill({ campaignId: campaign.id, skillId: skill }));

    const campaignParticipation = buildCampaignParticipation({
      userId,
      createdAt: createdAt,
      sharedAt: null,
      status: TO_SHARE,
      campaignId: campaign.id,
    });

    buildAssessment({
      userId,
      campaignParticipationId: campaignParticipation.id,
      state: Assessment.states.COMPLETED,
      createdAt: assessmentCreatedAt,
    });

    return campaignParticipation;
  },

  buildEnded({ userId, createdAt, sharedAt, assessmentCreatedAt, campaignSkills } = {}) {
    const campaign = buildCampaign();
    campaignSkills.forEach((skill) => buildCampaignSkill({ campaignId: campaign.id, skillId: skill }));

    const campaignParticipation = buildCampaignParticipation({
      userId,
      createdAt: createdAt,
      sharedAt: sharedAt || createdAt,
      campaignId: campaign.id,
    });

    buildAssessment({
      userId,
      campaignParticipationId: campaignParticipation.id,
      state: Assessment.states.COMPLETED,
      createdAt: assessmentCreatedAt,
    });

    return campaignParticipation;
  },

  buildArchived({
    userId,
    createdAt,
    sharedAt,
    assessmentCreatedAt,
    campaignArchivedAt = new Date('1998-07-01'),
    campaignSkills,
  } = {}) {
    const campaign = buildCampaign({ archivedAt: campaignArchivedAt });
    campaignSkills.forEach((skill) => buildCampaignSkill({ campaignId: campaign.id, skillId: skill }));

    const campaignParticipation = buildCampaignParticipation({
      userId,
      campaignId: campaign.id,
      createdAt: createdAt,
      sharedAt: sharedAt || createdAt,
      status: STARTED,
    });

    buildAssessment({
      userId,
      campaignParticipationId: campaignParticipation.id,
      createdAt: assessmentCreatedAt,
    });

    return campaignParticipation;
  },

  buildDeleted({
    userId,
    createdAt,
    sharedAt,
    assessmentCreatedAt,
    deletedAt = new Date('1998-07-01'),
    deletedBy = buildUser().id,
    campaignSkills,
  } = {}) {
    const campaign = buildCampaign();
    campaignSkills.forEach((skill) => buildCampaignSkill({ campaignId: campaign.id, skillId: skill }));

    const campaignParticipation = buildCampaignParticipation({
      userId,
      campaignId: campaign.id,
      createdAt: createdAt,
      sharedAt: sharedAt || createdAt,
      deletedAt,
      deletedBy,
      status: STARTED,
    });

    buildAssessment({
      userId,
      campaignParticipationId: campaignParticipation.id,
      createdAt: assessmentCreatedAt,
    });

    return campaignParticipation;
  },
};
