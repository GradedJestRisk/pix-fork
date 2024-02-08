import jsonwebtoken from 'jsonwebtoken';
import querystring from 'querystring';

import { createServer, expect, databaseBuilder, nock, sinon } from '../../../../test-helper.js';

import { config as settings } from '../../../../../lib/config.js';
import { AuthenticationSessionContent } from '../../../../../lib/domain/models/AuthenticationSessionContent.js';
import * as authenticationSessionService from '../../../../../lib/domain/services/authentication/authentication-session-service.js';
import { oidcAuthenticationServiceRegistry } from '../../../../../lib/domain/services/authentication/authentication-service-registry.js';

const uuidPattern = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);

describe('Acceptance | Route | oidc | token', function () {
  describe('POST /api/oidc/token', function () {
    let server, clock, payload, cookies, oidcExampleNetProvider;

    beforeEach(async function () {
      server = await createServer();
      clock = sinon.useFakeTimers({
        now: Date.now(),
        toFake: ['Date'],
      });

      const query = querystring.stringify({
        identity_provider: 'OIDC_EXAMPLE_NET',
        redirect_uri: 'https://app.dev.pix.org/connexion/oidc-example-net',
      });
      const authUrlResponse = await server.inject({
        method: 'GET',
        url: `/api/oidc/authentication-url?${query}`,
      });
      cookies = authUrlResponse.headers['set-cookie'];

      const redirectTarget = new URL(authUrlResponse.result.redirectTarget);

      payload = {
        data: {
          attributes: {
            identity_provider: 'OIDC_EXAMPLE_NET',
            code: 'code',
            redirect_uri: 'redirect_uri',
            state: redirectTarget.searchParams.get('state'),
          },
        },
      };

      oidcExampleNetProvider = oidcAuthenticationServiceRegistry.getOidcProviderServiceByCode('OIDC_EXAMPLE_NET');
      sinon.stub(oidcExampleNetProvider.client, 'callback');
    });

    afterEach(async function () {
      clock.restore();
    });

    context('When user does not have an account', function () {
      it('should return status code 401 with authentication key matching session content and error code to validate cgu', async function () {
        // given
        const idToken = jsonwebtoken.sign(
          {
            sub: 'sub',
            given_name: 'John',
            family_name: 'Doe',
          },
          'secret',
        );

        const getAccessTokenResponse = {
          access_token: 'access_token',
          id_token: idToken,
          expires_in: 60,
          refresh_token: 'refresh_token',
        };

        //nock('https://oidc.example.net').post('/ea5ac20c-5076-4806-860a-b0aeb01645d4/oauth2/v2.0/token').reply(200, getAccessTokenResponse);
        oidcExampleNetProvider.client.callback.resolves(getAccessTokenResponse);

        const sessionContentAndUserInfo = {
          sessionContent: new AuthenticationSessionContent({
            accessToken: 'access_token',
            idToken,
            expiresIn: 60,
            refreshToken: 'refresh_token',
          }),
          userInfo: {
            externalIdentityId: 'sub',
            firstName: 'John',
            lastName: 'Doe',
          },
        };

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/oidc/token',
          headers: { cookie: cookies[0] },
          payload,
        });

        // then
        const [error] = response.result.errors;
        expect(response.statusCode).to.equal(401);
        expect(error.code).to.exist;
        expect(error.code).to.equal('SHOULD_VALIDATE_CGU');

        const authenticationKey = error.meta.authenticationKey;
        expect(authenticationKey).to.exist;
        const result = await authenticationSessionService.getByKey(authenticationKey);
        expect(result).to.deep.equal(sessionContentAndUserInfo);
      });
    });

    context('When user has an account', function () {
      it('returns 200 with access_token and logout_url_uuid', async function () {
        // given
        const firstName = 'John';
        const lastName = 'Doe';
        const externalIdentifier = 'sub';

        const userId = databaseBuilder.factory.buildUser({
          firstName,
          lastName,
        }).id;

        databaseBuilder.factory.buildAuthenticationMethod.withIdentityProvider({
          identityProvider: 'OIDC_EXAMPLE_NET',
          externalIdentifier,
          accessToken: 'access_token',
          refreshToken: 'refresh_token',
          expiresIn: 1000,
          userId,
        });
        await databaseBuilder.commit();

        const idToken = jsonwebtoken.sign(
          {
            given_name: firstName,
            family_name: lastName,
            nonce: 'nonce',
            sub: externalIdentifier,
          },
          'secret',
        );
        const getAccessTokenResponse = {
          access_token: 'access_token',
          id_token: idToken,
          expires_in: 60,
          refresh_token: 'refresh_token',
        };
        // const getAccessTokenRequest = nock(settings.poleEmploi.tokenUrl).post('/').reply(200, getAccessTokenResponse);

        oidcExampleNetProvider.client.callback.resolves(getAccessTokenResponse);

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/oidc/token',
          headers: { cookie: cookies[0] },
          payload,
        });

        // then
        // expect(getAccessTokenRequest.isDone()).to.be.true;
        expect(oidcExampleNetProvider.client.callback).to.have.been.calledOnce;
        expect(response.statusCode).to.equal(200);
        expect(response.result['access_token']).to.exist;
        expect(response.result['logout_url_uuid']).to.match(uuidPattern);
      });
    });

    // eslint-disable-next-line mocha/no-skipped-tests
    context.skip('when the identity provider token route API does not respond within timeout', function () {
      it('should return 422', async function () {
        // given
        const firstName = 'John';
        const lastName = 'Doe';
        const externalIdentifier = 'sub';

        const userId = databaseBuilder.factory.buildUser({
          firstName,
          lastName,
        }).id;

        databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
          externalIdentifier,
          accessToken: 'access_token',
          refreshToken: 'refresh_token',
          expiresIn: 1000,
          userId,
        });
        await databaseBuilder.commit();

        const idToken = jsonwebtoken.sign(
          {
            given_name: firstName,
            family_name: lastName,
            nonce: 'nonce',
            sub: externalIdentifier,
          },
          'secret',
        );
        const getAccessTokenResponse = {
          access_token: 'access_token',
          id_token: idToken,
          expires_in: 60,
          refresh_token: 'refresh_token',
        };
        const TIMEOUT_MILLISECONDS = 10;
        const getAccessTokenRequest = nock('https://oidc.example.net')
          .post('/ea5ac20c-5076-4806-860a-b0aeb01645d4/oauth2/v2.0/token')
          .delay(TIMEOUT_MILLISECONDS)
          .reply(200, getAccessTokenResponse);

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/api/oidc/token',
          headers: { cookie: cookies[0] },
          payload,
        });

        // then
        expect(response.statusCode).to.equal(422);
        expect(getAccessTokenRequest.isDone()).to.be.true;
        expect(response.payload).to.equal(
          '{"errors":[{"status":"422","title":"Unprocessable entity","detail":"Erreur lors de la récupération des tokens du partenaire."}]}',
        );
      });
    });

    // eslint-disable-next-line mocha/no-skipped-tests
    context.skip('When ID Token does not contain all the required claims', function () {
      context('When identity provider userinfo does not respond within timeout or fails', function () {
        it('should return 503', async function () {
          // given
          const firstName = 'John';
          const lastName = 'Doe';
          const externalIdentifier = 'sub';

          const userId = databaseBuilder.factory.buildUser({
            firstName,
            lastName,
          }).id;

          databaseBuilder.factory.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({
            externalIdentifier,
            accessToken: 'access_token',
            refreshToken: 'refresh_token',
            expiresIn: 1000,
            userId,
          });
          await databaseBuilder.commit();

          const invalidIdToken = jsonwebtoken.sign(
            {
              nonce: 'nonce',
              sub: externalIdentifier,
            },
            'secret',
          );

          const getAccessTokenResponse = {
            access_token: 'access_token',
            id_token: invalidIdToken,
            expires_in: 60,
            refresh_token: 'refresh_token',
          };

          const getAccessTokenRequest = nock(settings.poleEmploi.tokenUrl).post('/').reply(200, getAccessTokenResponse);
          const TIMEOUT_MILLISECONDS = 10;
          const getUserInfoRequest = nock(settings.poleEmploi.userInfoUrl)
            .get('/')
            .delay(TIMEOUT_MILLISECONDS)
            .reply(200, {});

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/api/oidc/token',
            headers: { cookie: cookies[0] },
            payload,
          });

          // then
          expect(response.statusCode).to.equal(503);
          expect(getAccessTokenRequest.isDone()).to.be.true;
          expect(getUserInfoRequest.isDone()).to.be.true;
          expect(response.payload).to.equal(
            '{"errors":[{"status":"503","title":"ServiceUnavailable","detail":"Une erreur est survenue en récupérant les informations des utilisateurs."}]}',
          );
        });
      });
    });
  });
});
