import { organizationController } from '../../../../../src/certification/results/application/organization-controller.js';
import { usecases } from '../../../../../src/certification/results/domain/usecases/index.js';
import { getI18n } from '../../../../../src/shared/infrastructure/i18n/i18n.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Course | Unit | Application | Organizations | organization-controller', function () {
  describe('#downloadCertificationResults', function () {
    const now = new Date('2019-01-01T05:06:07Z');
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('should return a response with CSV results', async function () {
      // given
      const request = {
        i18n: getI18n(),
        params: {
          organizationId: 1,
        },
        query: {
          division: '3èmeA',
        },
      };

      const certificationResults = [
        domainBuilder.buildCertificationResult({ isPublished: true }),
        domainBuilder.buildCertificationResult({ isPublished: true }),
        domainBuilder.buildCertificationResult({ isPublished: true }),
      ];

      sinon
        .stub(usecases, 'getScoCertificationResultsByDivision')
        .withArgs({ organizationId: 1, division: '3èmeA' })
        .resolves(certificationResults);

      const dependencies = { getDivisionCertificationResultsCsv: sinon.stub() };
      dependencies.getDivisionCertificationResultsCsv
        .withArgs({ division: '3èmeA', certificationResults, i18n: request.i18n })
        .resolves({ content: 'csv-string', filename: '20190101_resultats_3èmeA.csv' });

      // when
      const response = await organizationController.downloadCertificationResults(request, hFake, dependencies);

      // then
      expect(response.source).to.equal('csv-string');
      expect(response.headers['Content-Type']).to.equal('text/csv;charset=utf-8');
      expect(response.headers['Content-Disposition']).to.equal('attachment; filename="20190101_resultats_3èmeA.csv"');
    });
  });
});
