import { attachOrganizationsToTargetProfile } from '../../../../../../src/prescription/target-profile/domain/usecases/attach-organizations-to-target-profile.js';
import * as organizationsToAttachToTargetProfileRepository from '../../../../../../src/prescription/target-profile/infrastructure/repositories/organizations-to-attach-to-target-profile-repository.js';
import { databaseBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | UseCase | attach-organizations-to-target-profile', function () {
  describe('#attachOrganizationsToTargetProfile', function () {
    it('attaches organization to target profile', async function () {
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const organization1 = databaseBuilder.factory.buildOrganization();
      const organization2 = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();

      const organizationIds = [organization1.id, organization2.id];

      await attachOrganizationsToTargetProfile({
        targetProfileId: targetProfile.id,
        organizationIds,
        organizationsToAttachToTargetProfileRepository,
      });

      const rows = await knex('target-profile-shares')
        .select('organizationId')
        .where({ targetProfileId: targetProfile.id });
      const organizationIdsWithTargetProfile = rows.map(({ organizationId }) => organizationId);

      expect(organizationIdsWithTargetProfile).to.exactlyContain(organizationIds);
    });
  });
});
