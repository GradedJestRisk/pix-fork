import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  finalize(model, { examinerComment }) {
    const url = this.buildURL('session', model.id) + '/finalization';

    return this.ajax(url, 'PUT', { 
      data: {
        data: {
          attributes: {
            'examiner-comment': examinerComment,
          },
        },
      },
    });
  }
});
