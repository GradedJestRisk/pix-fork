const settings = require('../../../config');
const constants = require('../../constants');
const OidcAuthenticationService = require('./oidc-authentication-service');
const DomainTransaction = require('../../../infrastructure/DomainTransaction');
const AuthenticationMethod = require('../../models/AuthenticationMethod');
const moment = require('moment');
const logoutUrlTemporaryStorage = require('../../../infrastructure/temporary-storage').withPrefix('logout-url:');

class PoleEmploiOidcAuthenticationService extends OidcAuthenticationService {
  constructor() {
    const source = 'pole_emploi_connect';
    const identityProvider = constants.IDENTITY_PROVIDER.POLE_EMPLOI;
    const expirationDelaySeconds = settings.poleEmploi.accessTokenLifespanMs / 1000;
    const jwtOptions = { expiresIn: expirationDelaySeconds };
    const clientSecret = settings.poleEmploi.clientSecret;
    const clientId = settings.poleEmploi.clientId;
    const tokenUrl = settings.poleEmploi.tokenUrl;
    const authenticationUrl = settings.poleEmploi.authenticationUrl;
    const authenticationUrlParameters = [
      { key: 'realm', value: '/individu' },
      {
        key: 'scope',
        value: `application_${clientId} api_peconnect-individuv1 openid profile`,
      },
    ];

    super({
      source,
      identityProvider,
      jwtOptions,
      clientSecret,
      clientId,
      tokenUrl,
      authenticationUrl,
      authenticationUrlParameters,
    });

    this.logoutUrl = settings.poleEmploi.logoutUrl;
    this.afterLogoutUrl = settings.poleEmploi.afterLogoutUrl;
  }

  // Overrided because we need idToken to send results after a campaign
  // Sending campaign results is specific for Pole Emploi
  async createUserAccount({
    user,
    sessionContent,
    externalIdentityId,
    userToCreateRepository,
    authenticationMethodRepository,
  }) {
    let createdUserId;
    await DomainTransaction.execute(async (domainTransaction) => {
      createdUserId = (await userToCreateRepository.create({ user, domainTransaction })).id;

      const authenticationMethod = new AuthenticationMethod({
        identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
        userId: createdUserId,
        externalIdentifier: externalIdentityId,
        authenticationComplement: new AuthenticationMethod.PoleEmploiAuthenticationComplement({
          accessToken: sessionContent.accessToken,
          refreshToken: sessionContent.refreshToken,
          expiredDate: moment().add(sessionContent.expiresIn, 's').toDate(),
        }),
      });
      await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
    });

    return {
      userId: createdUserId,
      idToken: sessionContent.idToken,
    };
  }

  async getRedirectLogoutUrl({ userId, logoutUrlUUID }) {
    const redirectTarget = new URL(this.logoutUrl);
    const key = `${userId}:${logoutUrlUUID}`;
    const idToken = await logoutUrlTemporaryStorage.get(key);
    const params = [
      { key: 'id_token_hint', value: idToken },
      { key: 'redirect_uri', value: this.afterLogoutUrl },
    ];

    params.forEach(({ key, value }) => redirectTarget.searchParams.append(key, value));

    await logoutUrlTemporaryStorage.delete(key);

    return redirectTarget.toString();
  }
}

module.exports = PoleEmploiOidcAuthenticationService;
