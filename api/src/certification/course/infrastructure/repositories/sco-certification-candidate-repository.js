import { knex } from '../../../../../db/knex-database-connection.js';

/**
 * @returns {Array<number>} certification candidates ids
 */
const findIdsByOrganizationIdAndDivision = async function ({ organizationId, division }) {
  const uniqLastCandidatesByOrganizationLearners = knex
    .select(
      'certification-candidates.id',
      knex.raw(
        'row_number() OVER (PARTITION BY "certification-candidates"."organizationLearnerId" ORDER BY "sessions"."publishedAt" DESC NULLS LAST) as session_number',
      ),
    )
    .from('view-active-organization-learners as learners')
    .innerJoin('certification-candidates', 'learners.id', 'certification-candidates.organizationLearnerId')
    .innerJoin('sessions', 'certification-candidates.sessionId', 'sessions.id')
    .where({
      'learners.organizationId': organizationId,
      'learners.isDisabled': false,
    })
    .whereRaw('LOWER(learners.division) = ?', division.toLowerCase())
    .orderBy('certification-candidates.lastName', 'ASC')
    .orderBy('certification-candidates.firstName', 'ASC')
    .as('uniqLastCandidatesByOrganizationLearners');

  return knex
    .pluck('id')
    .from(uniqLastCandidatesByOrganizationLearners)
    .where('uniqLastCandidatesByOrganizationLearners.session_number', 1);
};

export { findIdsByOrganizationIdAndDivision };
