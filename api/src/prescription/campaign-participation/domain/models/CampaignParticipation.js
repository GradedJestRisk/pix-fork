import _ from 'lodash';

import {
  AlreadySharedCampaignParticipationError,
  AssessmentNotCompletedError,
  CantImproveCampaignParticipationError,
} from '../../../../../src/shared/domain/errors.js';
import { ArchivedCampaignError } from '../../../campaign/domain/errors.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';
import { CampaignParticiationInvalidStatus, CampaignParticipationDeletedError } from '../errors.js';

class CampaignParticipation {
  constructor({
    id,
    createdAt,
    participantExternalId,
    status,
    sharedAt,
    deletedAt,
    deletedBy,
    assessments,
    campaign,
    userId,
    validatedSkillsCount,
    pixScore,
    organizationLearnerId,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.status = status;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.deletedAt = deletedAt;
    this.deletedBy = deletedBy;
    this.campaign = campaign;
    this.assessments = assessments;
    this.userId = userId;
    this.status = status;
    this.validatedSkillsCount = validatedSkillsCount || null;
    this.pixScore = pixScore || null;
    this.organizationLearnerId = organizationLearnerId;
  }

  static start(campaignParticipation) {
    const { organizationLearnerId = null } = campaignParticipation;
    const { isAssessment } = campaignParticipation.campaign;
    const { STARTED, TO_SHARE } = CampaignParticipationStatuses;

    const status = isAssessment ? STARTED : TO_SHARE;

    return new CampaignParticipation({
      ...campaignParticipation,
      status,
      organizationLearnerId,
    });
  }

  get isShared() {
    return this.status === CampaignParticipationStatuses.SHARED;
  }

  get isDeleted() {
    return Boolean(this.deletedAt);
  }

  get lastAssessment() {
    return _.maxBy(this.assessments, 'createdAt');
  }

  getTargetProfileId() {
    return _.get(this, 'campaign.targetProfileId', null);
  }

  get campaignId() {
    return _.get(this, 'campaign.id', null);
  }

  share() {
    this._canBeShared();
    this.sharedAt = new Date();
    this.status = CampaignParticipationStatuses.SHARED;
  }

  improve() {
    this._canBeImproved();
    this.status = CampaignParticipationStatuses.STARTED;
  }

  delete(userId) {
    this.deletedAt = new Date();
    this.deletedBy = userId;
  }

  _canBeImproved() {
    if (this.status !== CampaignParticipationStatuses.TO_SHARE) {
      throw new CampaignParticiationInvalidStatus(this.id, CampaignParticipationStatuses.TO_SHARE);
    }

    if (this.campaign.isProfilesCollection()) {
      throw new CantImproveCampaignParticipationError();
    }
  }

  _canBeShared() {
    if (this.status === CampaignParticipationStatuses.STARTED) {
      throw new CampaignParticiationInvalidStatus(this.id, CampaignParticipationStatuses.STARTED);
    }

    if (this.isShared) {
      throw new AlreadySharedCampaignParticipationError();
    }
    if (!this.campaign.isAccessible()) {
      throw new ArchivedCampaignError('Cannot share results on an archived campaign.');
    }
    if (this.isDeleted) {
      throw new CampaignParticipationDeletedError('Cannot share results on a deleted participation.');
    }
    if (this.campaign.isAssessment() && lastAssessmentNotCompleted(this)) {
      throw new AssessmentNotCompletedError();
    }
  }
}

function lastAssessmentNotCompleted(campaignParticipation) {
  return !campaignParticipation.lastAssessment || !campaignParticipation.lastAssessment.isCompleted();
}

export { CampaignParticipation };
