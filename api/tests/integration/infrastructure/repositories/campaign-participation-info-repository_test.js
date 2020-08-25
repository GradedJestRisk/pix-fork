const { expect, databaseBuilder } = require('../../../test-helper');
const Campaign = require('../../../../lib/domain/models/Campaign');
const campaignParticipationInfoRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-info-repository');

describe('Integration | Repository | Campaign Participation Info', () => {

  describe('#findByCampaignId', () => {

    let campaign1;
    let campaign2;
    let campaignParticipation1;
    let userId;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser({
        firstName: 'First',
        lastName: 'Last',
      }).id;
      campaign1 = databaseBuilder.factory.buildCampaign({ type: Campaign.types.ASSESSMENT });
      campaign2 = databaseBuilder.factory.buildCampaign({ type: Campaign.types.ASSESSMENT });

      campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1.id,
        userId,
        isShared: true,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2.id,
        isShared: true,
      });
      await databaseBuilder.commit();
    });

    it('should return all the campaign-participation links to the given campaign', async () => {
      // given
      const campaignId = campaign1.id;

      // when
      const campaignParticipationInfos = await campaignParticipationInfoRepository.findByCampaignId(campaignId);

      // then
      expect(campaignParticipationInfos).to.deep.equal([
        {
          sharedAt: campaignParticipation1.sharedAt,
          createdAt: campaignParticipation1.createdAt,
          participantExternalId: campaignParticipation1.participantExternalId,
          userId: campaignParticipation1.userId,
          isCompleted: false,
          participantFirstName: 'First',
          participantLastName: 'Last',
        }
      ]);
      expect(campaignParticipationInfos[0].isShared).to.be.true;
    });

    context('When last assessment is completed', () => {
      beforeEach(async () => {
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation1.id,
          createdAt: new Date('2020-01-02'),
          state: 'completed',

        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation1.id,
          createdAt: new Date('2020-01-01'),
          state: 'started',
        });
        await databaseBuilder.commit();
      });

      it('Should return True for isCompleted', async () => {
        // given
        const campaignId = campaign1.id;

        // when
        const campaignParticipationInfos = await campaignParticipationInfoRepository.findByCampaignId(campaignId);

        // then
        expect(campaignParticipationInfos).to.deep.equal([
          {
            sharedAt: campaignParticipation1.sharedAt,
            createdAt: campaignParticipation1.createdAt,
            participantExternalId: campaignParticipation1.participantExternalId,
            userId: campaignParticipation1.userId,
            isCompleted: true,
            participantFirstName: 'First',
            participantLastName: 'Last',
          }
        ]);
        expect(campaignParticipationInfos[0].isShared).to.be.true;
      });
    });

    context('When the last assessment is not completed', () => {
      beforeEach(async () => {
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation1.id,
          createdAt: new Date('2020-01-01'),
          state: 'completed',
        });
        databaseBuilder.factory.buildAssessment({
          campaignParticipationId: campaignParticipation1.id,
          createdAt: new Date('2020-01-02'),
          state: 'started',
        });
        await databaseBuilder.commit();
      });

      it('Should return false for isCompleted', async () => {
        // given
        const campaignId = campaign1.id;

        // when
        const campaignParticipationInfos = await campaignParticipationInfoRepository.findByCampaignId(campaignId);

        // then
        expect(campaignParticipationInfos).to.deep.equal([
          {
            sharedAt: campaignParticipation1.sharedAt,
            createdAt: campaignParticipation1.createdAt,
            participantExternalId: campaignParticipation1.participantExternalId,
            userId: campaignParticipation1.userId,
            isCompleted: false,
            participantFirstName: 'First',
            participantLastName: 'Last',
          }
        ]);
        expect(campaignParticipationInfos[0].isShared).to.be.true;
      });
    });

    context('When the share at is null', () => {
      it('Should return null as shared date', async () => {
        // given
        const campaign = databaseBuilder.factory.buildCampaign({ sharedAt: null });
        databaseBuilder.factory.buildCampaignParticipation({
          campaignId: campaign.id,
          userId,
          isShared: false,
          sharedAt: null
        });

        await databaseBuilder.commit();

        // when
        const campaignParticipationInfos = await campaignParticipationInfoRepository.findByCampaignId(campaign.id);

        // then
        expect(campaignParticipationInfos[0].isShared).to.be.false;
        expect(campaignParticipationInfos[0].sharedAt).to.equal(null);
      });
    });
  });

});
