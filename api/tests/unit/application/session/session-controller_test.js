import { sessionController } from '../../../../lib/application/sessions/session-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { SessionPublicationBatchError } from '../../../../src/shared/application/http-errors.js';
import { SessionPublicationBatchResult } from '../../../../src/shared/domain/models/index.js';
import { getI18n } from '../../../../src/shared/infrastructure/i18n/i18n.js';
import { logger } from '../../../../src/shared/infrastructure/utils/logger.js';
import { catchErr, expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Controller | sessionController', function () {
  let request;
  const userId = 274939274;

  describe('#getJuryCertificationSummaries ', function () {
    it('should return jury certification summaries', async function () {
      // given
      const sessionId = 1;
      const juryCertificationSummaries = { juryCertificationSummaries: 'tactac', pagination: {} };
      const juryCertificationSummariesJSONAPI = 'someSummariesJSONApi';
      const page = { number: 3, size: 30 };
      const pagination = Symbol('pagination');

      const request = {
        params: { id: sessionId },
        query: { page: { size: 30, number: 3 } },
        auth: {
          credentials: {
            userId,
          },
        },
      };
      const juryCertificationSummaryRepository = {
        findBySessionIdPaginated: sinon.stub(),
      };
      juryCertificationSummaryRepository.findBySessionIdPaginated
        .withArgs({ sessionId, page })
        .resolves({ juryCertificationSummaries, pagination });
      const juryCertificationSummarySerializer = {
        serialize: sinon.stub(),
      };
      juryCertificationSummarySerializer.serialize
        .withArgs(juryCertificationSummaries)
        .returns(juryCertificationSummariesJSONAPI);

      // when
      const response = await sessionController.getJuryCertificationSummaries(request, hFake, {
        juryCertificationSummaryRepository,
        juryCertificationSummarySerializer,
      });

      // then
      expect(response).to.deep.equal(juryCertificationSummariesJSONAPI);
    });
  });

  describe('#publish / #unpublish', function () {
    context('when publishing', function () {
      it('should return the serialized session', async function () {
        // given
        const sessionId = 123;
        const session = Symbol('session');
        const serializedSession = Symbol('serializedSession');
        const i18n = getI18n();
        const sessionManagementSerializer = { serialize: sinon.stub() };
        sinon
          .stub(usecases, 'publishSession')
          .withArgs({
            sessionId,
            i18n,
          })
          .resolves(session);
        sessionManagementSerializer.serialize.withArgs({ session }).resolves(serializedSession);

        // when
        const response = await sessionController.publish(
          {
            i18n,
            params: {
              id: sessionId,
            },
            payload: {
              data: { attributes: { toPublish: true } },
            },
          },
          hFake,
          { sessionManagementSerializer },
        );

        // then
        expect(response).to.equal(serializedSession);
      });
    });

    context('when unpublishing', function () {
      it('should return the serialized session', async function () {
        // given
        const sessionId = 123;
        const session = Symbol('session');
        const serializedSession = Symbol('serializedSession');
        const sessionManagementSerializer = { serialize: sinon.stub() };

        sinon
          .stub(usecases, 'unpublishSession')
          .withArgs({
            sessionId,
          })
          .resolves(session);
        sessionManagementSerializer.serialize.withArgs({ session }).resolves(serializedSession);

        // when
        const response = await sessionController.unpublish(
          {
            params: {
              id: sessionId,
            },
            payload: {
              data: { attributes: { toPublish: false } },
            },
          },
          hFake,
          { sessionManagementSerializer },
        );

        // then
        expect(response).to.equal(serializedSession);
      });
    });
  });

  describe('#publishInBatch', function () {
    it('returns 204 when no error occurred', async function () {
      // given
      const i18n = getI18n();

      const request = {
        i18n,
        payload: {
          data: {
            attributes: {
              ids: ['sessionId1', 'sessionId2'],
            },
          },
        },
      };
      sinon
        .stub(usecases, 'publishSessionsInBatch')
        .withArgs({
          sessionIds: ['sessionId1', 'sessionId2'],
          i18n,
        })
        .resolves(new SessionPublicationBatchResult('batchId'));

      // when
      const response = await sessionController.publishInBatch(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('logs errors when errors occur', async function () {
      // given
      const i18n = getI18n();
      const result = new SessionPublicationBatchResult('batchId');
      result.addPublicationError('sessionId1', new Error('an error'));
      result.addPublicationError('sessionId2', new Error('another error'));

      const request = {
        i18n,
        payload: {
          data: {
            attributes: {
              ids: ['sessionId1', 'sessionId2'],
            },
          },
        },
      };
      sinon.stub(usecases, 'publishSessionsInBatch').resolves(result);
      sinon.stub(logger, 'warn');

      // when
      await catchErr(sessionController.publishInBatch)(request, hFake);

      // then
      expect(logger.warn).to.have.been.calledWithExactly(
        'One or more error occurred when publishing session in batch batchId',
      );

      expect(logger.warn).to.have.been.calledWithExactly(
        {
          batchId: 'batchId',
          sessionId: 'sessionId1',
        },
        'an error',
      );

      expect(logger.warn).to.have.been.calledWithExactly(
        {
          batchId: 'batchId',
          sessionId: 'sessionId2',
        },
        'another error',
      );
    });

    it('returns the serialized batch id', async function () {
      // given
      const i18n = getI18n();
      const result = new SessionPublicationBatchResult('batchId');
      result.addPublicationError('sessionId1', new Error('an error'));

      const request = {
        i18n,
        payload: {
          data: {
            attributes: {
              ids: ['sessionId1', 'sessionId2'],
            },
          },
        },
      };
      sinon.stub(usecases, 'publishSessionsInBatch').resolves(result);
      sinon.stub(logger, 'warn');

      // when
      const error = await catchErr(sessionController.publishInBatch)(request, hFake);

      // then
      expect(error).to.be.an.instanceof(SessionPublicationBatchError);
    });
  });

  describe('#flagResultsAsSentToPrescriber', function () {
    let sessionId;
    let session;
    let serializedSession;

    beforeEach(function () {
      sessionId = 123;
      session = Symbol('session');
      serializedSession = Symbol('serializedSession');
      request = {
        params: {
          id: sessionId,
        },
      };
    });

    context('when the session results were already flagged as sent', function () {
      beforeEach(function () {
        const usecaseResult = { resultsFlaggedAsSent: false, session };
        sinon.stub(usecases, 'flagSessionResultsAsSentToPrescriber').withArgs({ sessionId }).resolves(usecaseResult);
      });

      it('should return the serialized session', async function () {
        // given
        const sessionManagementSerializer = {
          serialize: sinon.stub(),
        };
        sessionManagementSerializer.serialize.withArgs({ session }).resolves(serializedSession);

        // when
        const response = await sessionController.flagResultsAsSentToPrescriber(request, hFake, {
          sessionManagementSerializer,
        });

        // then
        expect(response).to.equal(serializedSession);
      });
    });

    context('when the session results were not flagged as sent', function () {
      beforeEach(function () {
        const usecaseResult = { resultsFlaggedAsSent: true, session };
        sinon.stub(usecases, 'flagSessionResultsAsSentToPrescriber').withArgs({ sessionId }).resolves(usecaseResult);
      });

      it('should return the serialized session with code 201', async function () {
        // given
        const sessionManagementSerializer = { serialize: sinon.stub() };
        sessionManagementSerializer.serialize.withArgs({ session }).resolves(serializedSession);

        // when
        const response = await sessionController.flagResultsAsSentToPrescriber(request, hFake, {
          sessionManagementSerializer,
        });

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.source).to.equal(serializedSession);
      });
    });
  });
});
