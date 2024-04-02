import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { Assessment } from '../../../shared/domain/models/Assessment.js';
import { MissionAssessment } from '../models/mission-assessment.js';

const save = async function ({ missionAssessment, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConnection = domainTransaction.knexTransaction || knex;
  await knexConnection('mission-assessments').insert({ ...missionAssessment });
};

const getByAssessmentId = async function (assessmentId, domainTransaction = DomainTransaction.emptyTransaction()) {
  const knexConnection = domainTransaction.knexTransaction || knex;
  const rawAssessmentMission = await knexConnection('mission-assessments')
    .where({ assessmentId: assessmentId })
    .returning('*')
    .first();
  return new MissionAssessment({ ...rawAssessmentMission });
};

const getCurrent = async function (missionId, organizationLearnerId) {
  const rawAssessmentMission = await knex('mission-assessments')
    .join('assessments', 'assessments.id', 'mission-assessments.assessmentId')
    .where({ missionId, organizationLearnerId, state: Assessment.states.STARTED })
    .first();

  if (!rawAssessmentMission) {
    return null;
  }

  return new MissionAssessment({ ...rawAssessmentMission });
};

const getAllCompletedMissionIds = async function (organizationLearnerId) {
  const raw = await knex('mission-assessments')
    .select('mission-assessments.missionId')
    .join('assessments', 'assessments.id', 'mission-assessments.assessmentId')
    .where({ organizationLearnerId })
    .andWhere({ state: Assessment.states.COMPLETED });

  return raw.map((element) => element.missionId);
};

export { getAllCompletedMissionIds, getByAssessmentId, getCurrent, save };
