import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { filterByFullName } from '../../../../shared/infrastructure/utils/filter-utils.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { CampaignParticipationStatuses, CampaignTypes } from '../../../shared/domain/constants.js';
import { OrganizationLearner } from '../../domain/read-models/OrganizationLearner.js';

function _buildIsCertifiable(queryBuilder, organizationLearnerId) {
  queryBuilder
    .distinct('view-active-organization-learners.id')
    .select(
      'view-active-organization-learners.id as organizationLearnerId',
      knex.raw(
        'FIRST_VALUE("campaign-participations"."isCertifiable") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."sharedAt" DESC) AS "isCertifiableFromCampaign"',
      ),
      knex.raw(
        'FIRST_VALUE("campaign-participations"."sharedAt") OVER(PARTITION BY "view-active-organization-learners"."id" ORDER BY "campaign-participations"."sharedAt" DESC) AS "certifiableAtFromCampaign"',
      ),
    )
    .from('view-active-organization-learners')
    .join(
      'campaign-participations',
      'view-active-organization-learners.id',
      'campaign-participations.organizationLearnerId',
    )
    .join('campaigns', 'campaigns.id', 'campaign-participations.campaignId')
    .where('campaign-participations.status', CampaignParticipationStatuses.SHARED)
    .where('campaigns.type', CampaignTypes.PROFILES_COLLECTION)
    .where('view-active-organization-learners.id', organizationLearnerId)
    .where('campaign-participations.deletedAt', null);
}

async function get({ organizationLearnerId }) {
  const row = await knex
    .with('subquery', (qb) => _buildIsCertifiable(qb, organizationLearnerId))
    .select(
      'view-active-organization-learners.id',
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.lastName',
      'view-active-organization-learners.division',
      'view-active-organization-learners.group',
      'view-active-organization-learners.organizationId',
      'view-active-organization-learners.attributes',
      'view-active-organization-learners.isCertifiable as isCertifiableFromLearner',
      'view-active-organization-learners.certifiableAt as certifiableAtFromLearner',
      'subquery.isCertifiableFromCampaign',
      'subquery.certifiableAtFromCampaign',
      knex.raw('array_remove(ARRAY_AGG("identityProvider"), NULL) AS "authenticationMethods"'),
      knex.raw('array_remove(ARRAY_AGG(features.key), NULL) as features'),
      'users.email',
      'users.username',
    )
    .from('view-active-organization-learners')
    .where('view-active-organization-learners.id', organizationLearnerId)
    .leftJoin('subquery', 'subquery.organizationLearnerId', 'view-active-organization-learners.id')
    .leftJoin('authentication-methods', 'authentication-methods.userId', 'view-active-organization-learners.userId')
    .leftJoin('users', 'view-active-organization-learners.userId', 'users.id')
    .leftJoin(
      'organization-learner-features',
      'view-active-organization-learners.id',
      'organization-learner-features.organizationLearnerId',
    )
    .leftJoin('features', 'organization-learner-features.featureId', 'features.id')
    .groupBy(
      'view-active-organization-learners.id',
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.lastName',
      'view-active-organization-learners.division',
      'view-active-organization-learners.group',
      'view-active-organization-learners.organizationId',
      'view-active-organization-learners.attributes',
      'users.id',
      'subquery.isCertifiableFromCampaign',
      'subquery.certifiableAtFromCampaign',
      'view-active-organization-learners.isCertifiable',
      'view-active-organization-learners.certifiableAt',
    )
    .first();
  if (row) {
    return new OrganizationLearner(row);
  }
  throw new NotFoundError(`Student not found for ID ${organizationLearnerId}`);
}

async function findPaginatedLearners({ organizationId, page, filter }) {
  const query = knex
    .select('id', 'firstName', 'lastName', 'organizationId', 'attributes')
    .from('view-active-organization-learners')
    .where({ isDisabled: false, organizationId })
    .orderByRaw('LOWER("firstName") ASC')
    .orderByRaw('LOWER("lastName") ASC');

  if (filter) {
    const { name, ...attributesToFilter } = filter;
    Object.entries(attributesToFilter)
      .filter(([_, values]) => values !== undefined)
      .forEach(([name, values]) => {
        query.andWhere(function () {
          // eslint-disable-next-line knex/avoid-injections
          this.whereRaw(`attributes->>'${name}' in ( ${values.map((_) => '?').join(' , ')} )`, values);
        });
      });
    if (name) {
      filterByFullName(query, name, 'firstName', 'lastName');
    }
  }

  const { results, pagination } = await fetchPage(query, page);

  const learners = results.map((learner) => new OrganizationLearner(learner));

  return { learners, pagination };
}

async function findOrganizationLearnersByDivisions({ organizationId, divisions }) {
  const knexConnection = DomainTransaction.getConnection();
  const organizationLearners = await knexConnection
    .from('view-active-organization-learners')
    .where({ organizationId })
    .whereIn('division', divisions);
  return organizationLearners.map((organizationLearner) => new OrganizationLearner(organizationLearner));
}

async function getAttestationsForOrganizationLearnersAndKey({ attestationKey, organizationLearners, attestationsApi }) {
  const userIds = organizationLearners.map((learner) => learner.userId);
  return attestationsApi.generateAttestations({
    attestationKey,
    userIds,
  });
}

export {
  findOrganizationLearnersByDivisions,
  findPaginatedLearners,
  get,
  getAttestationsForOrganizationLearnersAndKey,
};
