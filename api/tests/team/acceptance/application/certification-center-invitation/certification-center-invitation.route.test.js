import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
} from '../../../../test-helper.js';

const CERTIFICATION_CENTER_INVITATIONS_TABLE_NAME = 'certification-center-invitations';

describe('Acceptance | Team | Application | Route | Certification Center Invitation', function () {
  let server, request;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/certification-centers/{id}/invitations', function () {
    let certificationCenterId, userId;
    const CERTIFICATION_CENTER_INVITATIONS_TABLE_NAME = 'certification-center-invitations';

    beforeEach(async function () {
      certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();
    });

    context('When user is not admin of the certification center', function () {
      it('returns an 403 HTTP error code', async function () {
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId, role: 'MEMBER' });

        await databaseBuilder.commit();

        request = {
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          method: 'POST',
          url: `/api/certification-centers/${certificationCenterId}/invitations`,
          payload: {},
        };

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('When user is admin of the certification center', function () {
      it('returns 204 HTTP status code', async function () {
        const emails = ['dev@example.net', 'com@example.net'];
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId, role: 'ADMIN' });

        await databaseBuilder.commit();

        request = {
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
          method: 'POST',
          url: `/api/certification-centers/${certificationCenterId}/invitations`,
          payload: {
            data: {
              attributes: {
                emails,
              },
            },
          },
        };

        // when
        const response = await server.inject(request);

        // then
        const certificationCenterInvitations = await knex(CERTIFICATION_CENTER_INVITATIONS_TABLE_NAME)
          .where({ certificationCenterId })
          .whereIn('email', emails);
        expect(response.statusCode).to.equal(204);
        expect(certificationCenterInvitations.length).to.equal(2);
      });
    });
  });

  describe('DELETE /api/certification-center-invitations/{id}', function () {
    context('when user is an admin of the certification center', function () {
      let adminUser, certificationCenter;

      beforeEach(async function () {
        adminUser = databaseBuilder.factory.buildUser();
        certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        databaseBuilder.factory.buildCertificationCenterMembership({
          userId: adminUser.id,
          certificationCenterId: certificationCenter.id,
          role: 'ADMIN',
        });

        await databaseBuilder.commit();
      });

      it('cancels the certification center invitation and returns a 204 HTTP status code', async function () {
        // given
        const certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
          certificationCenterId: certificationCenter.id,
        });
        const request = {
          headers: {
            authorization: generateValidRequestAuthorizationHeader(adminUser.id),
          },
          method: 'DELETE',
          url: `/api/certification-center-invitations/${certificationCenterInvitation.id}`,
        };

        await databaseBuilder.commit();

        // when
        const { statusCode } = await server.inject(request);

        // then
        const cancelledCertificationCenterInvitation = await knex(CERTIFICATION_CENTER_INVITATIONS_TABLE_NAME)
          .where({ id: certificationCenterInvitation.id })
          .first();
        expect(cancelledCertificationCenterInvitation.status).to.equal('cancelled');
        expect(statusCode).to.equal(204);
      });
    });
  });
});
