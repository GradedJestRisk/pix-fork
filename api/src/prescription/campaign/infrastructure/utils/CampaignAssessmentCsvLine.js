import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);
dayjs.extend(timezone);

import _ from 'lodash';

const STATS_COLUMNS_COUNT = 3;

class CampaignAssessmentCsvLine {
  constructor({
    organization,
    campaign,
    campaignParticipationInfo,
    targetProfile,
    additionalHeaders,
    learningContent,
    stageCollection,
    participantKnowledgeElementsByCompetenceId,
    acquiredBadges,
    campaignParticipationService,
    translate,
  }) {
    this.organization = organization;
    this.additionalHeaders = additionalHeaders;
    this.campaign = campaign;
    this.campaignParticipationInfo = campaignParticipationInfo;
    this.targetProfile = targetProfile;
    this.learningContent = learningContent;
    this.stageCollection = stageCollection;
    this.targetedKnowledgeElementsCount = _.sum(
      _.map(participantKnowledgeElementsByCompetenceId, (knowledgeElements) => knowledgeElements.length),
    );
    this.targetedKnowledgeElementsByCompetence = participantKnowledgeElementsByCompetenceId;
    this.acquiredBadges = acquiredBadges;
    this.campaignParticipationService = campaignParticipationService;
    this.translate = translate;

    this.emptyContent = translate('campaign-export.common.not-available');

    // To have the good `this` in _getStatsForCompetence, it is necessary to bind it
    this._getStatsForCompetence = this._getStatsForCompetence.bind(this);
  }

  toCsvLine() {
    return [
      ...this._makeCommonColumns(),
      ...(this.campaignParticipationInfo.isShared ? this._makeSharedColumns() : this._makeNotSharedColumns()),
    ];
  }

  _makeSharedStatsColumns({ targetedSkillCount, validatedSkillCount }) {
    return [_.round(validatedSkillCount / targetedSkillCount, 2), targetedSkillCount, validatedSkillCount];
  }

  _makeEmptyColumns(times) {
    return _.times(times, () => this.emptyContent);
  }

  _getStatsForCompetence(competence) {
    return {
      targetedSkillCount: competence.skillCount,
      validatedSkillCount: this._countValidatedKnowledgeElementsForCompetence(competence.id),
    };
  }

  _makeCompetenceColumns() {
    return _.flatMap(this.learningContent.competences, (competence) =>
      this._makeSharedStatsColumns({
        id: competence.id,
        ...this._getStatsForCompetence(competence),
      }),
    );
  }

  _makeAreaColumns() {
    return _.flatMap(this.learningContent.areas, ({ id, competences }) => {
      const areaCompetenceStats = competences.map(this._getStatsForCompetence);

      const targetedSkillCount = _.sumBy(areaCompetenceStats, 'targetedSkillCount');
      const validatedSkillCount = _.sumBy(areaCompetenceStats, 'validatedSkillCount');

      return this._makeSharedStatsColumns({
        id,
        targetedSkillCount,
        validatedSkillCount,
      });
    });
  }

  _makeBadgesColumns() {
    return _.flatMap(this.targetProfile.badges, ({ title }) =>
      this._makeYesNoColumns(_.includes(this.acquiredBadges, title)),
    );
  }

  _makeCommonColumns() {
    return [
      this.organization.name,
      this.campaign.id,
      this.campaign.code,
      this.campaign.name,
      this.targetProfile.name,
      this.campaignParticipationInfo.participantLastName,
      this.campaignParticipationInfo.participantFirstName,
      ...this.#makeAdditionalInfos(),
      ...this._division,
      ...this._group,
      ...this._studentNumber,
      ...(this.campaign.idPixLabel ? [this.campaignParticipationInfo.participantExternalId] : []),
      this.campaignParticipationService.progress(
        this.campaignParticipationInfo.isCompleted,
        this.targetedKnowledgeElementsCount,
        this.learningContent.skills.length,
      ),
      dayjs.utc(this.campaignParticipationInfo.createdAt).tz('Europe/Paris').format('DD/MM/YYYY HH:mm'),
      this._makeYesNoColumns(this.campaignParticipationInfo.isShared),
      this.campaignParticipationInfo.isShared
        ? dayjs.utc(this.campaignParticipationInfo.sharedAt).tz('Europe/Paris').format('DD/MM/YYYY HH:mm')
        : this.emptyContent,
      ...(this.stageCollection.hasStage ? [this._getReachedStage()] : []),
      ...(this.campaignParticipationInfo.isShared
        ? this._makeBadgesColumns()
        : this._makeEmptyColumns(this.targetProfile.badges.length)),
      this.campaignParticipationInfo.isShared ? this.campaignParticipationInfo.masteryRate : this.emptyContent,
    ];
  }

  #makeAdditionalInfos() {
    if (!this.additionalHeaders) return [];

    return this.additionalHeaders.map((header) => this.campaignParticipationInfo.additionalInfos[header.columnName]);
  }

  _makeSharedColumns() {
    return [
      ...this._makeCompetenceColumns(),
      ...this._makeAreaColumns(),
      ...(this.organization.showSkills
        ? _.map(this.learningContent.skills, (targetedSkill) => this._makeSkillColumn(targetedSkill))
        : []),
    ];
  }

  _makeYesNoColumns(isTrue) {
    return isTrue ? this.translate('campaign-export.common.yes') : this.translate('campaign-export.common.no');
  }

  _makeNotSharedColumns() {
    return [
      ...this._makeEmptyColumns(this.learningContent.competences.length * STATS_COLUMNS_COUNT),
      ...this._makeEmptyColumns(this.learningContent.areas.length * STATS_COLUMNS_COUNT),
      ...(this.organization.showSkills ? this._makeEmptyColumns(this.learningContent.skills.length) : []),
    ];
  }

  _makeSkillColumn(targetedSkill) {
    let knowledgeElementForSkill = null;
    const competenceId = this.learningContent.findCompetenceIdOfSkill(targetedSkill.id);
    if (competenceId in this.targetedKnowledgeElementsByCompetence) {
      knowledgeElementForSkill = _.find(
        this.targetedKnowledgeElementsByCompetence[competenceId],
        (knowledgeElement) => knowledgeElement.skillId === targetedSkill.id,
      );
    }

    return knowledgeElementForSkill
      ? knowledgeElementForSkill.isValidated
        ? this.translate('campaign-export.assessment.status.ok')
        : this.translate('campaign-export.assessment.status.ko')
      : this.translate('campaign-export.assessment.status.not-tested');
  }

  _countValidatedKnowledgeElementsForCompetence(competenceId) {
    return this.targetedKnowledgeElementsByCompetence[competenceId].filter(
      (knowledgeElement) => knowledgeElement.isValidated,
    ).length;
  }

  _getReachedStage() {
    if (!this.campaignParticipationInfo.isShared) {
      return this.emptyContent;
    }

    const masteryPercentage = this.campaignParticipationInfo.masteryRate * 100;
    const validatedSkillsCount = this.campaignParticipationInfo.validatedSkillsCount;

    return this.stageCollection.getReachedStage(validatedSkillsCount, masteryPercentage).reachedStage - 1;
  }

  get _studentNumber() {
    if (this.organization.isSup && this.organization.isManagingStudents) {
      return [this.campaignParticipationInfo.studentNumber || ''];
    }

    return [];
  }

  get _division() {
    if (this.organization.isSco && this.organization.isManagingStudents) {
      return [this.campaignParticipationInfo.division || ''];
    }

    return [];
  }

  get _group() {
    if (this.organization.isSup && this.organization.isManagingStudents) {
      return [this.campaignParticipationInfo.group || ''];
    }

    return [];
  }
}

export { CampaignAssessmentCsvLine };
