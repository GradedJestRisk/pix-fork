import { Issuer } from 'openid-client';

import { expect, sinon, catchErr } from '../../../../test-helper.js';

import { config as settings } from '../../../../../lib/config.js';
import { OidcAuthenticationService } from '../../../../../lib/domain/services/authentication/oidc-authentication-service.js';
import jsonwebtoken from 'jsonwebtoken';
import { httpAgent } from '../../../../../lib/infrastructure/http/http-agent.js';

import { AuthenticationSessionContent } from '../../../../../lib/domain/models/AuthenticationSessionContent.js';

import {
  InvalidExternalAPIResponseError,
  OidcMissingFieldsError,
  OidcUserInfoFormatError,
} from '../../../../../lib/domain/errors.js';
import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { UserToCreate } from '../../../../../lib/domain/models/UserToCreate.js';
import { AuthenticationMethod } from '../../../../../lib/domain/models/AuthenticationMethod.js';
import * as OidcIdentityProviders from '../../../../../lib/domain/constants/oidc-identity-providers.js';
import { logger } from '../../../../../lib/infrastructure/logger.js';
import { monitoringTools } from '../../../../../lib/infrastructure/monitoring-tools.js';
import { OIDC_ERRORS } from '../../../../../lib/domain/constants.js';

describe('Unit | Domain | Services | oidc-authentication-service', function () {
  describe('constructor', function () {
    context('when no parameter provided', function () {
      it('creates an instance with default values', function () {
        // given
        const args = {};

        // when
        const oidcAuthenticationService = new OidcAuthenticationService(args);

        // then
        expect(oidcAuthenticationService.hasLogoutUrl).to.be.false;
        expect(oidcAuthenticationService.scope).to.equal('openid profile');
      });
    });

    context('when claimsToStore is undefined', function () {
      it('does not set claimsToStore', async function () {
        // given
        const args = {};

        // when
        const oidcAuthenticationService = new OidcAuthenticationService(args);

        // then
        expect(oidcAuthenticationService.claimsToStore).not.to.exist;
      });
    });

    context('when claimsToStore is null', function () {
      it('does not set claimsToStore', async function () {
        // given
        const args = { claimsToStore: null };

        // when
        const oidcAuthenticationService = new OidcAuthenticationService(args);

        // then
        expect(oidcAuthenticationService.claimsToStore).not.to.exist;
      });
    });

    context('when claimsToStore is an empty array', function () {
      it('does not set claimsToStore', async function () {
        // given
        const args = { claimsToStore: [] };

        // when
        const oidcAuthenticationService = new OidcAuthenticationService(args);

        // then
        expect(oidcAuthenticationService.claimsToStore).not.to.exist;
      });
    });

    context('when claimsToStore is not empty', function () {
      it('sets claimsToStore', async function () {
        // given
        const args = { claimsToStore: ['employeeNumber', 'studentGroup'] };

        // when
        const oidcAuthenticationService = new OidcAuthenticationService(args);

        // then
        expect(oidcAuthenticationService.claimsToStore).to.exist;
      });
    });
  });

  describe('#isReady', function () {
    describe('when configKey is set', function () {
      describe('when enabled in config', function () {
        describe('when config is valid', function () {
          it('returns true', function () {
            // given
            settings.someOidcProviderService = {
              isEnabled: true,
              clientId: 'anId',
              clientSecret: 'aSecret',
              authenticationUrl: 'https://example.net',
              userInfoUrl: 'https://example.net',
              tokenUrl: 'https://example.net',
              aProperty: 'aValue',
            };
            const oidcAuthenticationService = new OidcAuthenticationService({
              configKey: 'someOidcProviderService',
              additionalRequiredProperties: ['aProperty'],
            });

            // when
            const result = oidcAuthenticationService.isReady;

            // then
            expect(result).to.be.true;
          });
        });

        describe('when config is invalid', function () {
          it('returns false', function () {
            // given
            sinon.stub(logger, 'error');

            settings.someOidcProviderService = {
              isEnabled: true,
            };
            const oidcAuthenticationService = new OidcAuthenticationService({
              configKey: 'someOidcProviderService',
              identityProvider: 'Example OP code',
              additionalRequiredProperties: ['exampleProperty'],
            });

            // when
            const result = oidcAuthenticationService.isReady;

            // then
            expect(logger.error).to.have.been.calledWithExactly(
              'OIDC Provider "Example OP code" has been DISABLED because of INVALID config. The following required properties are missing: clientId, clientSecret, authenticationUrl, userInfoUrl, tokenUrl, exampleProperty',
            );
            expect(result).to.be.false;
          });
        });
      });

      describe('when not enabled in config', function () {
        it('returns false', function () {
          // given
          settings.someOidcProviderService = {
            isEnabled: false,
          };
          const oidcAuthenticationService = new OidcAuthenticationService({
            configKey: 'someOidcProviderService',
          });

          // when
          const result = oidcAuthenticationService.isReady;

          // then
          expect(result).to.be.false;
        });
      });
    });

    describe('when configKey is not set', function () {
      it('returns false', function () {
        // given
        settings.someOidcProviderService = {
          isEnabled: true,
        };
        const oidcAuthenticationService = new OidcAuthenticationService({});

        // when
        const result = oidcAuthenticationService.isReady;

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#createAccessToken', function () {
    it('should create access token with user id', function () {
      // given
      const userId = 42;
      const accessToken = Symbol('valid access token');
      settings.authentication.secret = 'a secret';
      const payload = { user_id: userId };
      const secret = 'a secret';
      const jwtOptions = { expiresIn: 1 };
      sinon.stub(jsonwebtoken, 'sign').withArgs(payload, secret, jwtOptions).returns(accessToken);

      const oidcAuthenticationService = new OidcAuthenticationService({ jwtOptions });

      // when
      const result = oidcAuthenticationService.createAccessToken(userId);

      // then
      expect(result).to.equal(accessToken);
    });
  });

  describe('#createAuthenticationComplement', function () {
    context('when claimsToStore is empty', function () {
      it('returns undefined', function () {
        // given
        const userInfo = {};
        const identityProvider = OidcIdentityProviders.PAYSDELALOIRE.code;
        const oidcAuthenticationService = new OidcAuthenticationService({ identityProvider });

        // when
        const result = oidcAuthenticationService.createAuthenticationComplement({ userInfo });

        // then
        expect(result).to.be.undefined;
      });
    });

    context('when claimsToStore is not empty', function () {
      it('returns an OidcAuthenticationComplement', function () {
        // given
        const family_name = 'TITEGOUTTE';
        const given_name = 'Mélusine';
        const claimsToStore = ['family_name', 'given_name'];
        const claimsToStoreWithValues = { family_name, given_name };
        const userInfo = { ...claimsToStoreWithValues };
        const identityProvider = OidcIdentityProviders.FWB.code;
        const oidcAuthenticationService = new OidcAuthenticationService({ identityProvider, claimsToStore });

        // when
        const result = oidcAuthenticationService.createAuthenticationComplement({ userInfo });

        // then
        expect(result).to.be.instanceOf(AuthenticationMethod.OidcAuthenticationComplement);
      });
    });
  });

  describe('#saveIdToken', function () {
    it('should return null', async function () {
      // given
      const oidcAuthenticationService = new OidcAuthenticationService({});

      // when
      const result = await oidcAuthenticationService.saveIdToken();

      // then
      expect(result).to.be.null;
    });
  });

  describe('#getRedirectLogoutUrl', function () {
    context('when there is no endSessionEndpoint', function () {
      it('returns null', async function () {
        // given
        const oidcAuthenticationService = new OidcAuthenticationService({});

        // when
        const result = await oidcAuthenticationService.getRedirectLogoutUrl();

        // then
        expect(result).to.be.null;
      });
    });

    context('when there is an endSessionEndpoint', function () {
      it('returns a redirect URL for the user browser', async function () {
        // given
        const idToken = 'some_dummy_id_token';
        const userId = 'some_dummy_user_id';
        const logoutUrlUUID = 'some_dummy_logout_url_uuid';
        const sessionTemporaryStorage = {
          get: sinon.stub().resolves(idToken),
          delete: sinon.stub().resolves(),
        };
        settings.someOidcProviderService = {
          isEnabled: true,
          clientId: 'anId',
          clientSecret: 'aSecret',
          authenticationUrl: 'https://example.net/authorize',
          tokenUrl: 'https://example.net/token',
          userInfoUrl: 'https://example.net/userinfo',
        };
        const oidcAuthenticationService = new OidcAuthenticationService(
          {
            configKey: 'someOidcProviderService',
            endSessionUrl: 'https://example.net/logout',
            postLogoutRedirectUri: 'https://app.pix.fr/connexion',
          },
          { sessionTemporaryStorage },
        );

        // when
        const result = await oidcAuthenticationService.getRedirectLogoutUrl({ userId, logoutUrlUUID });

        // then
        expect(result).to.equal(
          'https://example.net/logout?post_logout_redirect_uri=https%3A%2F%2Fapp.pix.fr%2Fconnexion&id_token_hint=some_dummy_id_token',
        );
      });
    });
  });

  describe('#exchangeCodeForTokens', function () {
    it('returns an AuthenticationSessionContent instance', async function () {
      // given
      const clientId = 'OIDC_CLIENT_ID';
      const tokenUrl = 'http://oidc.net/api/token';
      const clientSecret = 'OIDC_CLIENT_SECRET';
      const accessToken = Symbol('access token');
      const expiresIn = Symbol(60);
      const idToken = Symbol('idToken');
      const refreshToken = Symbol('refreshToken');
      const code = Symbol('AUTHORIZATION_CODE');
      const state = Symbol('STATE');
      const nonce = Symbol('NONCE');
      const oidcAuthenticationSessionContent = new AuthenticationSessionContent({
        idToken,
        accessToken,
        expiresIn,
        refreshToken,
      });
      const tokenSet = {
        access_token: accessToken,
        expires_in: expiresIn,
        id_token: idToken,
        refresh_token: refreshToken,
      };
      const clientInstance = { callback: sinon.stub().resolves(tokenSet) };
      const Client = sinon.stub().returns(clientInstance);

      sinon.stub(Issuer, 'discover').resolves({ Client });

      const oidcAuthenticationService = new OidcAuthenticationService({ clientSecret, clientId, tokenUrl });
      await oidcAuthenticationService.createClient();

      // when
      const result = await oidcAuthenticationService.exchangeCodeForTokens({
        code,
        nonce,
        state,
      });

      // then
      expect(result).to.be.an.instanceOf(AuthenticationSessionContent);
      expect(result).to.deep.equal(oidcAuthenticationSessionContent);
    });
  });

  describe('#getAuthenticationUrl', function () {
    it('returns oidc provider authentication url', async function () {
      // given
      const authenticationUrl = 'http://authenticationurl.net';
      const clientId = 'OIDC_CLIENT_ID';
      const clientSecret = 'OIDC_CLIENT_SECRET';
      const extraAuthorizationUrlParameters = { realm: '/individu' };
      const redirectUri = 'https://example.org/please-redirect-to-me';

      const oidcAuthenticationService = new OidcAuthenticationService({
        authenticationUrl,
        clientId,
        clientSecret,
        extraAuthorizationUrlParameters,
        redirectUri,
      });

      const clientInstance = { authorizationUrl: sinon.stub().returns('') };
      const Client = sinon.stub().returns(clientInstance);

      sinon.stub(Issuer, 'discover').resolves({ Client });
      await oidcAuthenticationService.createClient();

      // when
      const { nonce, state } = oidcAuthenticationService.getAuthenticationUrl();

      // then
      const uuidV4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
      expect(nonce).to.match(uuidV4Regex);
      expect(state).to.match(uuidV4Regex);

      expect(clientInstance.authorizationUrl).to.have.been.calledWithExactly({
        nonce,
        redirect_uri: 'https://example.org/please-redirect-to-me',
        scope: 'openid profile',
        state,
        realm: '/individu',
      });
    });
  });

  describe('#getUserInfo', function () {
    it('should return nonce, firstName, lastName and external identity id', async function () {
      // given
      function generateIdToken(payload) {
        return jsonwebtoken.sign(
          {
            ...payload,
          },
          'secret',
        );
      }

      const idToken = generateIdToken({
        given_name: 'givenName',
        family_name: 'familyName',
        nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
        sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
      });

      const oidcAuthenticationService = new OidcAuthenticationService({});

      // when
      const result = await oidcAuthenticationService.getUserInfo({
        idToken,
        accessToken: 'accessToken',
      });

      // then
      expect(result).to.deep.equal({
        firstName: 'givenName',
        lastName: 'familyName',
        nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
        externalIdentityId: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
      });
    });

    describe('when required properties are not returned in id token', function () {
      it('should call userInfo endpoint', async function () {
        // given
        function generateIdToken(payload) {
          return jsonwebtoken.sign(
            {
              ...payload,
            },
            'secret',
          );
        }

        const userInfoUrl = 'infoUrl';
        const idToken = generateIdToken({
          nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
          sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
        });

        const oidcAuthenticationService = new OidcAuthenticationService({ userInfoUrl });
        sinon.stub(oidcAuthenticationService, '_getUserInfoFromEndpoint').resolves({});

        // when
        await oidcAuthenticationService.getUserInfo({
          idToken,
          accessToken: 'accessToken',
        });

        // then
        expect(oidcAuthenticationService._getUserInfoFromEndpoint).to.have.been.calledOnceWithExactly({
          accessToken: 'accessToken',
        });
      });
    });
  });

  describe('#_getUserInfoFromEndpoint', function () {
    // given
    const userInfoUrl = 'userInfoUrl';
    const accessToken = 'accessToken';

    it('should return nonce, firstName, lastName and external identity id', async function () {
      // given
      sinon
        .stub(httpAgent, 'get')
        .withArgs({
          url: userInfoUrl,
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: settings.partner.fetchTimeOut,
        })
        .resolves({
          isSuccessful: true,
          data: {
            given_name: 'givenName',
            family_name: 'familyName',
            nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
            sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
          },
        });

      const oidcAuthenticationService = new OidcAuthenticationService({
        userInfoUrl,
        accessToken,
      });

      // when
      const result = await oidcAuthenticationService._getUserInfoFromEndpoint({
        accessToken: 'accessToken',
        userInfoUrl: 'userInfoUrl',
      });

      // then
      expect(result).to.deep.equal({
        given_name: 'givenName',
        family_name: 'familyName',
        sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
        nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
      });
    });

    describe('when call to external API fails with no data details', function () {
      it('should throw error', async function () {
        // given
        sinon.stub(monitoringTools, 'logErrorWithCorrelationIds');
        const axiosError = {
          response: {
            data: '',
            status: 400,
          },
        };
        sinon
          .stub(httpAgent, 'get')
          .withArgs({
            url: userInfoUrl,
            headers: { Authorization: `Bearer ${accessToken}` },
            timeout: settings.partner.fetchTimeOut,
          })
          .resolves({ isSuccessful: false, code: axiosError.response.status, data: axiosError.response.data });
        // See api/lib/infrastructure/http/http-agent.js to understand, axios can throw an error but httpAgent.get map it into an http response
        const oidcAuthenticationService = new OidcAuthenticationService({ userInfoUrl, accessToken });

        // when
        let errorResponse;
        try {
          await oidcAuthenticationService._getUserInfoFromEndpoint({
            accessToken: 'accessToken',
            userInfoUrl: 'userInfoUrl',
          });
        } catch (error) {
          errorResponse = error;
        }

        // then
        expect(errorResponse).to.be.instanceOf(InvalidExternalAPIResponseError);
        expect(errorResponse.message).to.be.equal(
          'Une erreur est survenue en récupérant les informations des utilisateurs.',
        );
        expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWithExactly({
          message: {
            customMessage: 'Une erreur est survenue en récupérant les informations des utilisateurs.',
            errorDetails: 'Pas de détails disponibles',
          },
        });
      });
    });

    describe('when returned value by external API is not a json object', function () {
      it('should throw error', async function () {
        // given
        sinon.stub(monitoringTools, 'logErrorWithCorrelationIds');
        sinon
          .stub(httpAgent, 'get')
          .withArgs({
            url: userInfoUrl,
            headers: { Authorization: `Bearer ${accessToken}` },
            timeout: settings.partner.fetchTimeOut,
          })
          .resolves({
            isSuccessful: true,
            data: '',
          });
        const organizationName = 'Organization Name';
        const oidcAuthenticationService = new OidcAuthenticationService({
          userInfoUrl: 'userInfoUrl',
          organizationName,
        });

        // when
        const error = await catchErr(
          oidcAuthenticationService._getUserInfoFromEndpoint,
          oidcAuthenticationService,
        )({
          accessToken,
          userInfoUrl,
        });

        // then
        expect(error).to.be.instanceOf(OidcUserInfoFormatError);
        expect(error.message).to.be.equal(
          `Les informations utilisateur renvoyées par votre fournisseur d'identité ${organizationName} ne sont pas au format attendu.`,
        );
        expect(error.code).to.be.equal(OIDC_ERRORS.USER_INFO.badResponseFormat.code);
        expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWithExactly({
          message: {
            message: `Les informations utilisateur renvoyées par votre fournisseur d'identité ${organizationName} ne sont pas au format attendu.`,
            typeOfUserInfo: 'string',
            userInfo: '',
          },
        });
      });
    });

    describe('when required properties are not returned by external API', function () {
      it('should throw error', async function () {
        // given
        sinon.stub(monitoringTools, 'logErrorWithCorrelationIds');
        sinon
          .stub(httpAgent, 'get')
          .withArgs({
            url: userInfoUrl,
            headers: { Authorization: `Bearer ${accessToken}` },
            timeout: settings.partner.fetchTimeOut,
          })
          .resolves({
            isSuccessful: true,
            data: {
              given_name: 'givenName',
              family_name: undefined,
              nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
              sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
            },
          });
        const organizationName = 'Organization Name';
        const oidcAuthenticationService = new OidcAuthenticationService({ userInfoUrl, accessToken, organizationName });
        const errorMessage = `Un ou des champs obligatoires (family_name) n'ont pas été renvoyés par votre fournisseur d'identité ${organizationName}.`;

        // when
        const error = await catchErr(
          oidcAuthenticationService._getUserInfoFromEndpoint,
          oidcAuthenticationService,
        )({
          accessToken: 'accessToken',
          userInfoUrl: 'userInfoUrl',
        });

        // then
        expect(error).to.be.instanceOf(OidcMissingFieldsError);
        expect(error.message).to.be.equal(errorMessage);
        expect(error.code).to.be.equal(OIDC_ERRORS.USER_INFO.missingFields.code);
        expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWithExactly({
          message: errorMessage,
          missingFields: 'family_name',
          userInfo: {
            given_name: 'givenName',
            family_name: undefined,
            nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
            sub: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
          },
        });
      });
    });
  });

  describe('#createUserAccount', function () {
    let userToCreateRepository, authenticationMethodRepository;
    let domainTransaction;

    beforeEach(function () {
      domainTransaction = Symbol();
      DomainTransaction.execute = (lambda) => {
        return lambda(domainTransaction);
      };

      userToCreateRepository = {
        create: sinon.stub(),
      };
      authenticationMethodRepository = {
        create: sinon.stub(),
      };
    });

    it('returns created user id', async function () {
      // given
      const externalIdentityId = '1233BBBC';
      const user = new UserToCreate({
        firstName: 'Adam',
        lastName: 'Troisjours',
      });
      const userInfo = {};
      const userId = 1;
      userToCreateRepository.create.withArgs({ user, domainTransaction }).resolves({ id: userId });

      const identityProvider = OidcIdentityProviders.CNAV.code;
      const expectedAuthenticationMethod = new AuthenticationMethod({
        identityProvider,
        externalIdentifier: externalIdentityId,
        userId,
      });
      const oidcAuthenticationService = new OidcAuthenticationService({ identityProvider });

      // when
      const result = await oidcAuthenticationService.createUserAccount({
        externalIdentityId,
        user,
        userInfo,
        authenticationMethodRepository,
        userToCreateRepository,
      });

      // then
      expect(authenticationMethodRepository.create).to.have.been.calledWithExactly({
        authenticationMethod: expectedAuthenticationMethod,
        domainTransaction,
      });
      expect(result).to.equal(userId);
    });

    context('when claimsToStore is empty', function () {
      it('does not store claimsToStore', async function () {
        // given
        const externalIdentityId = '1233BBBC';
        const user = new UserToCreate({
          firstName: 'Adam',
          lastName: 'Troisjours',
        });
        const userInfo = {};
        const userId = 1;
        userToCreateRepository.create.withArgs({ user, domainTransaction }).resolves({ id: userId });

        const identityProvider = OidcIdentityProviders.CNAV.code;
        const expectedAuthenticationMethod = new AuthenticationMethod({
          identityProvider,
          externalIdentifier: externalIdentityId,
          userId,
        });
        const oidcAuthenticationService = new OidcAuthenticationService({ identityProvider });

        // when
        await oidcAuthenticationService.createUserAccount({
          externalIdentityId,
          user,
          userInfo,
          authenticationMethodRepository,
          userToCreateRepository,
        });

        // then
        expect(authenticationMethodRepository.create).to.have.been.calledWithExactly({
          authenticationMethod: expectedAuthenticationMethod,
          domainTransaction,
        });
      });
    });

    context('when claimsToStore is not empty', function () {
      it('stores claimsToStore', async function () {
        // given
        const externalIdentityId = '1233BBBC';
        const user = new UserToCreate({
          firstName: 'Adam',
          lastName: 'Troisjours',
        });
        const claimsToStore = ['employeeNumber', 'studentGroup'];
        const claimsToStoreWithValues = { employeeNumber: 'some-opaque-value', studentGroup: 'another-opaque-value' };
        const userInfo = { ...claimsToStoreWithValues };
        const userId = 1;
        userToCreateRepository.create.withArgs({ user, domainTransaction }).resolves({ id: userId });

        const identityProvider = OidcIdentityProviders.FWB.code;
        const expectedAuthenticationMethod = new AuthenticationMethod({
          identityProvider,
          authenticationComplement: new AuthenticationMethod.OidcAuthenticationComplement(claimsToStoreWithValues),
          externalIdentifier: externalIdentityId,
          userId,
        });
        const oidcAuthenticationService = new OidcAuthenticationService({ identityProvider, claimsToStore });

        // when
        await oidcAuthenticationService.createUserAccount({
          externalIdentityId,
          user,
          userInfo,
          authenticationMethodRepository,
          userToCreateRepository,
        });

        // then
        expect(authenticationMethodRepository.create).to.have.been.calledWithExactly({
          authenticationMethod: expectedAuthenticationMethod,
          domainTransaction,
        });
      });
    });
  });

  describe('#createClient', function () {
    it('creates an openid client', async function () {
      // given
      const clientId = Symbol('clientId');
      const clientSecret = Symbol('clientSecret');
      const configKey = 'identityProviderConfigKey';
      const identityProvider = Symbol('identityProvider');
      const redirectUri = Symbol('redirectUri');
      const openidConfigurationUrl = Symbol('openidConfigurationUrl');
      const Client = sinon.spy();

      sinon.stub(Issuer, 'discover').resolves({ Client });
      sinon.stub(settings, 'identityProviderConfigKey').value({});

      const oidcAuthenticationService = new OidcAuthenticationService({
        clientId,
        clientSecret,
        configKey,
        identityProvider,
        redirectUri,
        openidConfigurationUrl,
      });

      // when
      await oidcAuthenticationService.createClient();

      // then
      expect(Issuer.discover).to.have.been.calledWithExactly(openidConfigurationUrl);
      expect(Client).to.have.been.calledWithNew;
      expect(Client).to.have.been.calledWithExactly({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uris: [redirectUri],
      });
    });
  });
});
