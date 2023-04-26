const OrganizationForAdmin = require('../../../../lib/domain/models/organizations-administration/Organization');

function buildOrganizationForAdmin({
  id = 123,
  name = 'Lycée Luke Skywalker',
  type = 'SCO',
  logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  externalId = 'OrganizationIdLinksToExternalSource',
  provinceCode = '2A',
  isManagingStudents = false,
  credit = 500,
  email = 'jesuistonpere@example.net',
  createdAt = new Date('2018-01-12T01:02:03Z'),
  targetProfileShares = [],
  tags = [],
  createdBy,
  documentationUrl = 'https://pix.fr',
  showNPS = false,
  formNPSUrl = 'https://pix.fr',
  showSkills = false,
  archivedAt = null,
  archivistFirstName = null,
  archivistLastName = null,
  dataProtectionOfficerFirstName = null,
  dataProtectionOfficerLastName = null,
  dataProtectionOfficerEmail = null,
  identityProviderForCampaigns = null,
} = {}) {
  return new OrganizationForAdmin({
    id,
    name,
    type,
    logoUrl,
    externalId,
    provinceCode,
    isManagingStudents,
    credit,
    email,
    createdAt,
    targetProfileShares,
    tags,
    createdBy,
    documentationUrl,
    showNPS,
    formNPSUrl,
    showSkills,
    archivedAt,
    archivistFirstName,
    archivistLastName,
    dataProtectionOfficerFirstName,
    dataProtectionOfficerLastName,
    dataProtectionOfficerEmail,
    identityProviderForCampaigns,
  });
}

module.exports = buildOrganizationForAdmin;
