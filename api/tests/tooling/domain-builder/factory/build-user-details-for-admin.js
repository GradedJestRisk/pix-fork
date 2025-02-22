import { UserDetailsForAdmin } from '../../../../src/identity-access-management/domain/models/UserDetailsForAdmin.js';

const buildUserDetailsForAdmin = function ({
  id = 123,
  firstName = 'Louis',
  lastName = 'Philippe',
  email = 'louis.philippe@example.net',
  username = 'jean.bono1234',
  cgu = true,
  pixCertifTermsOfServiceAccepted = false,
  pixOrgaTermsOfServiceAccepted = false,
  isAuthenticatedFromGAR = false,
  createdAt,
  updatedAt,
  lang = 'fr',
  locale,
  lastTermsOfServiceValidatedAt,
  lastPixOrgaTermsOfServiceValidatedAt,
  lastPixCertifTermsOfServiceValidatedAt,
  lastLoggedAt,
  emailConfirmedAt,
  organizationLearners = [],
  authenticationMethods = [],
  userLogin = [],
  hasBeenAnonymised = false,
  hasBeenAnonymisedBy = null,
  isPixAgent = false,
} = {}) {
  return new UserDetailsForAdmin({
    id,
    firstName,
    lastName,
    email,
    username,
    cgu,
    pixOrgaTermsOfServiceAccepted,
    pixCertifTermsOfServiceAccepted,
    createdAt,
    updatedAt,
    lang,
    locale,
    lastTermsOfServiceValidatedAt,
    lastPixOrgaTermsOfServiceValidatedAt,
    lastPixCertifTermsOfServiceValidatedAt,
    lastLoggedAt,
    emailConfirmedAt,
    isAuthenticatedFromGAR,
    organizationLearners,
    authenticationMethods,
    userLogin,
    hasBeenAnonymised,
    hasBeenAnonymisedBy,
    isPixAgent,
  });
};

export { buildUserDetailsForAdmin };
