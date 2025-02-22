import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Team | Domain | UseCase | find-certification-center-memberships-by-certification-center', function () {
  it('returns certification-center-memberships by certification center id', async function () {
    // given
    const certificationCenterId = 1;
    const certificationCenterMemberships = [domainBuilder.buildCertificationCenterMembership()];
    const certificationCenterMembershipRepository = { findActiveByCertificationCenterIdSortedByRole: sinon.stub() };
    certificationCenterMembershipRepository.findActiveByCertificationCenterIdSortedByRole.resolves(
      certificationCenterMemberships,
    );

    // when
    const foundCertificationCenterMemberships = await usecases.findCertificationCenterMembershipsByCertificationCenter({
      certificationCenterId,
      certificationCenterMembershipRepository,
    });

    // then
    expect(
      certificationCenterMembershipRepository.findActiveByCertificationCenterIdSortedByRole,
    ).to.have.been.calledWithExactly({ certificationCenterId });
    expect(foundCertificationCenterMemberships).to.deep.equal(certificationCenterMemberships);
  });
});
