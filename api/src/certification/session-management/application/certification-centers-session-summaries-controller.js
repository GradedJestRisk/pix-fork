import * as sessionSummarySerializer from '../../../../lib/infrastructure/serializers/jsonapi/session-summary-serializer.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';

const findPaginatedSessionSummaries = async function (request) {
  const certificationCenterId = request.params.id;
  const userId = request.auth.credentials.userId;
  const options = request.query;

  const { models: sessionSummaries, meta } = await usecases.findPaginatedCertificationCenterSessionSummaries({
    userId,
    certificationCenterId,
    page: options.page,
  });

  return sessionSummarySerializer.serialize(sessionSummaries, meta);
};

const certificationCenterController = {
  findPaginatedSessionSummaries
};

export { certificationCenterController };
