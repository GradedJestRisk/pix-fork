const { expect, databaseBuilder } = require('../../../test-helper');
const { featureToggles } = require('../../../../lib/config');
const createServer = require('../../../../server');

describe('Acceptance | Application | Account-Recovery | Routes', () => {

  describe('GET /api/account-recovery/{temporaryKey}', () => {

    it('should return 200 http status code when account recovery demand found', async () => {
      // given
      const temporaryKey = 'FfgpFXgyuO062nPUPwcb8Wy3KcgkqR2p2GyEuGVaNI4=';
      const userId = 1234;
      const newEmail = 'newEmail@example.net';
      const firstName = 'Gertrude';
      databaseBuilder.factory.buildUser.withRawPassword({ id: userId });
      const { id: schoolingRegistrationId } = databaseBuilder.factory.buildSchoolingRegistration({ userId, firstName });
      const { id } = databaseBuilder.factory.buildAccountRecoveryDemand({
        userId,
        schoolingRegistrationId,
        temporaryKey,
        newEmail,
        used: false,
      });
      await databaseBuilder.commit();
      const server = await createServer();
      featureToggles.isScoAccountRecoveryEnabled = true;

      const options = {
        method: 'GET',
        url: '/api/account-recovery/' + temporaryKey,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.attributes.email).to.equal(newEmail.toLowerCase());
      expect(response.result.data.attributes['first-name']).to.equal(firstName);
      expect(response.result.data.id).to.equal(id.toString());
    });

    it('should return 404 http status code when the feature disabled', async () => {
      // given
      const temporaryKey = 'FfgpFXgyuO062nPUPwcb8Wy3KcgkqR2p2GyEuGVaNI4=';
      const server = await createServer();

      const options = {
        method: 'GET',
        url: '/api/account-recovery/' + temporaryKey,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
    });

  });
});
