import { CertificationCenterInvitation } from '../../../../../src/team/domain/models/CertificationCenterInvitation.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  sinon,
} from '../../../../test-helper.js';
describe('Acceptance | Team | Application | Route | Admin | Certification Center Invitation', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/certification-centers/{certificationCenterId}/invitations', function () {
    let clock;
    const now = new Date('2021-05-01');

    beforeEach(async function () {
      clock = sinon.useFakeTimers({
        now,
        toFake: ['Date'],
      });
    });

    afterEach(async function () {
      clock.restore();
    });

    it('returns 201 HTTP status code with created invitation', async function () {
      // given
      const adminMember = await insertUserWithRoleSuperAdmin();
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      await databaseBuilder.commit();

      // when
      const { result, statusCode } = await server.inject({
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminMember.id),
        },
        method: 'POST',
        payload: {
          data: {
            attributes: {
              email: 'some.user@example.net',
              lang: 'fr-fr',
              role: CertificationCenterInvitation.Roles.ADMIN,
            },
          },
        },
        url: `/api/admin/certification-centers/${certificationCenterId}/invitations`,
      });

      // then
      expect(statusCode).to.equal(201);
      expect(result.data.type).to.equal('certification-center-invitations');
      expect(result.data).to.have.property('id');
      expect(result.data.attributes).to.deep.equal({
        'updated-at': now,
        email: 'some.user@example.net',
        role: 'ADMIN',
      });
    });
  });

  describe('DELETE /api/admin/certification-centers/{id}/invitations/{certificationCenterInvitationId}', function () {
    it('should return 204 HTTP status code', async function () {
      // given
      const adminMember = await insertUserWithRoleSuperAdmin();
      const certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: databaseBuilder.factory.buildCertificationCenter().id,
        status: CertificationCenterInvitation.StatusType.PENDING,
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'DELETE',
        url: `/api/admin/certification-center-invitations/${certificationCenterInvitation.id}`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(adminMember.id),
        },
      });

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
