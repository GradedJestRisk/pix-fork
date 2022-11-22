const { BadRequestError } = require('../http-errors');
const _ = require('../../infrastructure/utils/lodash-utils');
const serializer = require('../../infrastructure/serializers/jsonapi/feedback-serializer');

module.exports = {
  async save(request, h) {
    const feedback = await serializer.deserialize(request.payload, request.headers['user-agent']);

    if (_.isBlank(feedback.get('content'))) {
      throw new BadRequestError('Feedback content must not be blank');
    }

    const persistedFeedback = await feedback.save();

    return h.response(serializer.serialize(persistedFeedback.toJSON())).created();
  },
};
