import * as certificationCenterInvitationRepository from '../../../team/infrastructure/repositories/certification-center-invitation-repository.js';
import { certificationCenterMembershipRepository } from '../../../team/infrastructure/repositories/certification-center-membership.repository.js';

async function execute({
  certificationCenterInvitationId,
  userId,
  dependencies = { certificationCenterInvitationRepository, certificationCenterMembershipRepository },
}) {
  const certificationCenterInvitation = await dependencies.certificationCenterInvitationRepository.get(
    certificationCenterInvitationId,
  );

  if (!certificationCenterInvitation) return false;

  return await dependencies.certificationCenterMembershipRepository.isAdminOfCertificationCenter({
    certificationCenterId: certificationCenterInvitation.certificationCenterId,
    userId,
  });
}

export { execute };
