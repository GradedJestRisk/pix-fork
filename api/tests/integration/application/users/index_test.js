import * as moduleUnderTest from '../../../../lib/application/users/index.js';
import { userController } from '../../../../lib/application/users/user-controller.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Integration | Application | Users | Routes', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
    sinon
      .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
      .callsFake((request, h) => h.response(true));

    sinon.stub(userController, 'resetScorecard').returns('ok');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/users/{userId}/competences/{competenceId}/reset', function () {
    it('should return OK (200) when params are valid', async function () {
      // given
      securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => h.response(true));
      const url = '/api/users/123/competences/abcdefghijklmnop/reset';

      // when
      const response = await httpTestServer.request('POST', url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return BAD_REQUEST (400) when competenceId parameter is invalid', async function () {
      // given
      const invalidCompetenceId = 'A'.repeat(256);
      securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => h.response(true));
      const url = `/api/users/123/competences/${invalidCompetenceId}/reset`;

      // when
      const response = await httpTestServer.request('POST', url);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
