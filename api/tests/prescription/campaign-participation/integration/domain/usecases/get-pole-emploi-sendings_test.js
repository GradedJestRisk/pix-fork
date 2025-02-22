import * as poleEmploiService from '../../../../../../src/prescription/campaign-participation/domain/services/pole-emploi-service.js';
import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import * as poleEmploiSendingRepository from '../../../../../../src/prescription/campaign-participation/infrastructure/repositories/pole-emploi-sending-repository.js';
import { config as settings } from '../../../../../../src/shared/config.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';
const poleEmploiSendingFactory = databaseBuilder.factory.poleEmploiSendingFactory;

describe('Integration | UseCase | get-campaign-participations-counts-by-stage', function () {
  let originalEnv;
  let sending1;
  let sending2;

  beforeEach(async function () {
    originalEnv = settings.apiManager.url;
    settings.apiManager.url = 'https://fake-url.fr';

    sending1 = poleEmploiSendingFactory.buildWithUser({ createdAt: new Date('2021-03-01'), isSuccessful: true });
    sending2 = poleEmploiSendingFactory.buildWithUser({ createdAt: new Date('2021-04-01'), isSuccessful: false });

    await databaseBuilder.commit();
  });

  afterEach(function () {
    settings.apiManager.url = originalEnv;
  });

  context('when there is no cursor', function () {
    it('should return the most recent sendings', async function () {
      //given
      const cursor = null;

      //when
      const expectedLink = poleEmploiService.generateLink({ idEnvoi: sending1.id, dateEnvoi: sending1.createdAt });

      const response = await usecases.getPoleEmploiSendings({ cursor, poleEmploiSendingRepository });
      //then
      expect(response.sendings.map((sending) => sending.idEnvoi)).to.deep.equal([sending2.id, sending1.id]);
      expect(response.link).to.equal(expectedLink);
    });
  });

  context('when there is a cursor', function () {
    it('should return a sending with a link', async function () {
      //given
      const cursorCorrespondingToSending2 = poleEmploiService.generateCursor({
        idEnvoi: sending2.id,
        dateEnvoi: sending2.createdAt,
      });
      const expectedLink = poleEmploiService.generateLink({ idEnvoi: sending1.id, dateEnvoi: sending1.createdAt });
      const cursorData = poleEmploiService.decodeCursor(cursorCorrespondingToSending2);
      //when
      const response = await usecases.getPoleEmploiSendings({
        cursorData,
        poleEmploiSendingRepository,
      });
      //then
      expect(response.sendings.map((sending) => sending.idEnvoi)).to.deep.equal([sending1.id]);
      expect(response.link).to.equal(expectedLink);
    });

    it('should return a sending with a link with filters', async function () {
      //given
      const filters = { isSuccessful: true };
      const cursorCorrespondingToSending2 = poleEmploiService.generateCursor({
        idEnvoi: sending2.id,
        dateEnvoi: sending2.createdAt,
      });
      const expectedLink = poleEmploiService.generateLink(
        { idEnvoi: sending1.id, dateEnvoi: sending1.createdAt },
        filters,
      );

      //when
      const response = await usecases.getPoleEmploiSendings({
        cursor: cursorCorrespondingToSending2,
        filters,
        poleEmploiSendingRepository,
      });
      //then
      expect(response.sendings.map((sending) => sending.idEnvoi)).to.deep.equal([sending1.id]);
      expect(response.link).to.equal(expectedLink);
    });
  });

  context('when there is a cursor but there is no more sending', function () {
    it('should return neither a sending nor a link', async function () {
      //given
      const cursorCorrespondingToSending1 = poleEmploiService.generateCursor({
        idEnvoi: sending1.id,
        dateEnvoi: sending1.createdAt,
      });
      const cursorData = poleEmploiService.decodeCursor(cursorCorrespondingToSending1);

      //when
      const response = await usecases.getPoleEmploiSendings({
        cursorData,
        poleEmploiSendingRepository,
      });

      //then
      expect(response.sendings).to.deep.equal([]);
      expect(response.link).to.equal(null);
    });
  });

  it('returns sendings which match the filters', async function () {
    //when
    const { sendings } = await usecases.getPoleEmploiSendings({
      cursor: null,
      poleEmploiSendingRepository,
      filters: { isSuccessful: false },
    });

    //then
    expect(sendings.map(({ idEnvoi }) => idEnvoi)).to.exactlyContain([sending2.id]);
  });
});
