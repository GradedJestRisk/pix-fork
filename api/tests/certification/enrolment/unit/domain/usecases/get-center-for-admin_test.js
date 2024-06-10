import { getCenterForAdmin } from '../../../../../../src/certification/enrolment/domain/usecases/get-center-for-admin.js';
import { CenterForAdmin } from '../../../../../../src/certification/session-management/domain/models/CenterForAdmin.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | get-center-for-admin', function () {
  let certificationCenterForAdmin;
  let dataProtectionOfficer;
  let centerRepository;
  let dataProtectionOfficerRepository;
  const certificationCenterId = 1234;

  beforeEach(function () {
    certificationCenterForAdmin = domainBuilder.buildCenterForAdmin({
      center: { id: certificationCenterId, name: 'Center for admin' },
    });
    dataProtectionOfficer =
      domainBuilder.buildDataProtectionOfficer.buildDataProtectionOfficerWithCertificationCenterId({
        certificationCenterId,
      });
    centerRepository = {
      getById: sinon.stub(),
    };
    dataProtectionOfficerRepository = {
      get: sinon.stub(),
    };
  });

  it('should get the certification center for admin', async function () {
    // given
    centerRepository.getById.withArgs({ id: certificationCenterId }).resolves({ ...certificationCenterForAdmin });
    dataProtectionOfficerRepository.get.withArgs({ certificationCenterId }).resolves({ ...dataProtectionOfficer });

    // when
    const actualCertificationCourse = await getCenterForAdmin({
      id: 1234,
      centerRepository,
      dataProtectionOfficerRepository,
    });

    // then
    expect(actualCertificationCourse).to.be.instanceOf(CenterForAdmin);
    expect(actualCertificationCourse.id).to.equal(certificationCenterId);
    expect(actualCertificationCourse.name).to.equal(certificationCenterForAdmin.name);
    expect(actualCertificationCourse.dataProtectionOfficerFirstName).to.equal(dataProtectionOfficer.firstName);
    expect(actualCertificationCourse.dataProtectionOfficerLastName).to.equal(dataProtectionOfficer.lastName);
    expect(actualCertificationCourse.dataProtectionOfficerEmail).to.equal(dataProtectionOfficer.email);
  });
});
