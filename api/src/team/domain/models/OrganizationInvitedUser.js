import { AlreadyExistingMembershipError, NotFoundError } from '../../../shared/domain/errors.js';
import { roles } from '../../../shared/domain/models/Membership.js';
import { AlreadyAcceptedOrCancelledInvitationError } from '../errors.js';
import { OrganizationInvitation } from './OrganizationInvitation.js';

class OrganizationInvitedUser {
  constructor({ userId, invitation, currentRole, organizationHasMemberships, currentMembershipId, status } = {}) {
    this.userId = userId;
    this.invitation = invitation;
    this.currentRole = currentRole;
    this.organizationHasMemberships = organizationHasMemberships;
    this.currentMembershipId = currentMembershipId;
    this.status = status;
  }

  acceptInvitation({ code }) {
    if (code !== this.invitation.code) {
      throw new NotFoundError(`Not found organization-invitation for ID ${this.invitation.id} and code ${code}`);
    }

    if (this.status !== 'pending') {
      throw new AlreadyAcceptedOrCancelledInvitationError();
    }

    if (this.currentRole && !this.invitation.role) {
      throw new AlreadyExistingMembershipError(
        `User is already member of organisation ${this.invitation.organizationId}`,
      );
    }

    this.currentRole = this.invitation.role || this._pickDefaultRole();

    this.status = OrganizationInvitation.StatusType.ACCEPTED;
  }

  _pickDefaultRole() {
    return this.organizationHasMemberships ? roles.MEMBER : roles.ADMIN;
  }

  get isAlreadyMemberOfOrganization() {
    return Boolean(this.currentMembershipId);
  }
}

export { OrganizationInvitedUser };
