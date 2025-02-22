import { lcmsController } from '../../../../../src/shared/application/lcms/lcms-controller.js';
import { sharedUsecases as usecases } from '../../../../../src/shared/domain/usecases/index.js';
import * as learningContentDatasources from '../../../../../src/shared/infrastructure/datasources/learning-content/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | lcms-controller', function () {
  describe('#createRelease', function () {
    it('should call the createRelease', async function () {
      // given
      sinon.stub(usecases, 'createLcmsRelease').resolves();
      const request = {};

      // when
      await lcmsController.createRelease(request, hFake);

      // then
      expect(usecases.createLcmsRelease).to.have.been.called;
    });
  });

  describe('#refreshCacheEntry', function () {
    const request = {
      params: {
        model: 'challenges',
        id: 'recId',
      },
      payload: {
        property: 'updatedValue',
      },
    };

    for (const entity of [
      'area',
      'challenge',
      'competence',
      'course',
      'framework',
      'skill',
      'thematic',
      'tube',
      'tutorial',
    ]) {
      it(`should reply 204 when patching ${entity}`, async function () {
        // given

        // eslint-disable-next-line import/namespace
        sinon.stub(learningContentDatasources[`${entity}Datasource`], 'refreshLearningContentCacheRecord').resolves();
        const request = {
          params: {
            model: `${entity}s`,
            id: 'recId',
          },
          payload: {
            property: 'updatedValue',
          },
        };

        // when
        const response = await lcmsController.refreshCacheEntry(request, hFake);

        // then
        expect(response.statusCode).to.equal(204);
      });
    }

    it('should reply with null when the cache key exists', async function () {
      // given
      sinon.stub(learningContentDatasources.challengeDatasource, 'refreshLearningContentCacheRecord').resolves();

      // when
      const response = await lcmsController.refreshCacheEntry(request, hFake);

      // then
      expect(
        learningContentDatasources.challengeDatasource.refreshLearningContentCacheRecord,
      ).to.have.been.calledWithExactly('recId', { property: 'updatedValue' });
      expect(response.statusCode).to.equal(204);
    });

    it('should reply with null when the cache key does not exist', async function () {
      // given
      sinon.stub(learningContentDatasources.challengeDatasource, 'refreshLearningContentCacheRecord').resolves();

      // when
      const response = await lcmsController.refreshCacheEntry(request, hFake);

      // Then
      expect(
        learningContentDatasources.challengeDatasource.refreshLearningContentCacheRecord,
      ).to.have.been.calledWithExactly('recId', { property: 'updatedValue' });
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('#refreshCacheEntries', function () {
    context('nominal case', function () {
      it('should reply with http status 202', async function () {
        // given
        sinon.stub(usecases, 'refreshLearningContentCache').resolves();

        // when
        const response = await lcmsController.refreshCacheEntries(
          {
            auth: {
              credentials: {
                userId: 123,
              },
            },
          },
          hFake,
        );

        // then
        expect(usecases.refreshLearningContentCache).to.have.been.calledOnce;
        expect(usecases.refreshLearningContentCache).to.have.been.calledWithExactly({ userId: 123 });
        expect(response.statusCode).to.equal(202);
      });
    });
  });
});
