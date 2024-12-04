import { monitorPreHandlers } from '../../../../src/identity-access-management/application/monitor-pre-handlers.js';
import { generateHash } from '../../../../src/identity-access-management/infrastructure/utils/crypto.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Identity Access Management | Application | monitor-pre-handlers', function () {
  describe('#monitorApiTokenRoute', function () {
    it('logs authentication attempt with grant type password', function () {
      // given
      const username = 'test@email.com';
      const grant_type = 'password';
      const scope = 'pix-app';
      const hash = generateHash(username);
      const logger = { warn: sinon.stub() };
      const request = { payload: { grant_type, username, scope } };

      // when
      monitorPreHandlers.monitorApiTokenRoute(request, hFake, { logger });

      // then
      expect(logger.warn).to.have.been.calledWith({ hash, grant_type, scope }, 'Authentication attempt');
    });

    it('logs authentication attempt with grant type refresh token', async function () {
      // given
      const refresh_token = '123';
      const grant_type = 'refresh_token';
      const scope = 'pix-app';
      const hash = generateHash(refresh_token);
      const logger = { warn: sinon.stub() };
      const request = { payload: { grant_type, refresh_token, scope } };

      // when
      monitorPreHandlers.monitorApiTokenRoute(request, hFake, { logger });

      // then
      expect(logger.warn).to.have.been.calledWith({ hash, grant_type, scope }, 'Authentication attempt');
    });

    it('logs authentication attempt with grant type unknown', async function () {
      // given
      const grant_type = 'unknown';
      const logger = { warn: sinon.stub() };
      const request = { payload: { foo: 'bar', grant_type } };

      // when
      monitorPreHandlers.monitorApiTokenRoute(request, hFake, { logger });

      // then
      expect(logger.warn).to.have.been.calledWith(request.payload, 'Authentication attempt with unknown method');
    });
  });
});
