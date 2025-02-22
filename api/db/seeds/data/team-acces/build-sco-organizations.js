import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { Membership } from '../../../../src/shared/domain/models/Membership.js';
import { PIX_PUBLIC_TARGET_PROFILE_ID, REAL_PIX_SUPER_ADMIN_ID } from '../common/constants.js';
import { PIX_ORGA_ADMIN_LEAVING_ID, PIX_ORGA_ALL_ORGA_ID } from './build-organization-users.js';
import {
  ACCESS_SCO_BAUDELAIRE_EXTERNAL_ID,
  ACCESS_SCO_NO_GAR_EXTERNAL_ID,
  SCO_NO_GAR_ORGANIZATION_ID,
  SCO_ORGANIZATION_ID,
} from './constants.js';

export function buildScoOrganizations(databaseBuilder) {
  _buildCollegeHouseOfTheDragonOrganization(databaseBuilder);
  _buildJosephineBaker(databaseBuilder);
  _buildScoManagingStudentsNoGarOrganization(databaseBuilder);
}

function _buildCollegeHouseOfTheDragonOrganization(databaseBuilder) {
  const organization = databaseBuilder.factory.buildOrganization({
    id: SCO_ORGANIZATION_ID,
    type: 'SCO',
    name: 'Collège House of The Dragon',
    isManagingStudents: true,
    email: 'dragon.house@example.net',
    externalId: 'ACCESS_SCO',
    documentationUrl: 'https://pix.fr/',
    provinceCode: '12',
    identityProviderForCampaigns: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
  });
  databaseBuilder.factory.buildOrganization({
    type: 'SCO',
    name: 'Child of "Collège House of The Dragon"',
    isManagingStudents: true,
    email: 'dragon.house.child@example.net',
    externalId: 'ACCESS_SCO',
    documentationUrl: 'https://pix.fr/',
    provinceCode: '12',
    identityProviderForCampaigns: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
    parentOrganizationId: SCO_ORGANIZATION_ID,
  });

  [
    {
      userId: PIX_ORGA_ALL_ORGA_ID,
      organizationId: organization.id,
      organizationRole: Membership.roles.ADMIN,
    },
    {
      userId: PIX_ORGA_ADMIN_LEAVING_ID,
      organizationId: organization.id,
      organizationRole: Membership.roles.ADMIN,
    },
  ].forEach(_buildAdminMembership(databaseBuilder));

  databaseBuilder.factory.buildCampaign({
    name: 'ACCES Sco - Collège - Campagne d’évaluation Badges',
    code: 'SCOBADGE1',
    type: 'ASSESSMENT',
    organizationId: organization.id,
    creatorId: PIX_ORGA_ALL_ORGA_ID,
    ownerId: PIX_ORGA_ALL_ORGA_ID,
    targetProfileId: PIX_PUBLIC_TARGET_PROFILE_ID,
    assessmentMethod: 'SMART_RANDOM',
    title: null,
    customLandingPageText: null,
    idPixLabel: null,
    createdAt: new Date('2023-07-27'),
  });
}

function _buildJosephineBaker(databaseBuilder) {
  const organization = databaseBuilder.factory.buildOrganization({
    type: 'SCO',
    name: 'Lycée Joséphine Baker',
    isManagingStudents: true,
    email: 'josephine.baker@example.net',
    externalId: ACCESS_SCO_BAUDELAIRE_EXTERNAL_ID,
    documentationUrl: 'https://pix.fr/',
    provinceCode: '13',
    identityProviderForCampaigns: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
  });

  [
    {
      userId: PIX_ORGA_ALL_ORGA_ID,
      organizationId: organization.id,
      organizationRole: Membership.roles.ADMIN,
    },
  ].forEach(_buildAdminMembership(databaseBuilder));
}

function _buildScoManagingStudentsNoGarOrganization(databaseBuilder) {
  const organization = databaseBuilder.factory.buildOrganization({
    id: SCO_NO_GAR_ORGANIZATION_ID,
    type: 'SCO',
    name: 'Lycée pas-GAR',
    isManagingStudents: true,
    email: 'pas.gar@example.net',
    externalId: ACCESS_SCO_NO_GAR_EXTERNAL_ID,
    documentationUrl: 'https://pix.fr/',
    provinceCode: '13',
    createdBy: REAL_PIX_SUPER_ADMIN_ID,
  });

  [
    {
      userId: PIX_ORGA_ALL_ORGA_ID,
      organizationId: organization.id,
      organizationRole: Membership.roles.ADMIN,
    },
  ].forEach(_buildAdminMembership(databaseBuilder));
}

function _buildAdminMembership(databaseBuilder) {
  return function ({ userId, organizationId, organizationRole }) {
    databaseBuilder.factory.buildMembership({
      userId,
      organizationId,
      organizationRole,
    });
  };
}
