import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupTest } from '../../helpers/tests';

module('Unit | Route | AssessmentChallengeRoute', function (hooks) {
  setupTest(hooks);

  module('#model', function () {
    module('When the assessment type is PREVIEW', function () {
      test('should call the assessment challenge route', async function (assert) {
        const store = this.owner.lookup('service:store');
        const route = this.owner.lookup('route:assessment.challenge');
        const assessment = { id: 2, type: 'PREVIEW' };
        const challenge = { id: 2 };
        const transition = { to: { queryParams: { challengeId: challenge.id } } };
        sinon.stub(route.router, 'replaceWith');
        sinon.stub(route, 'modelFor').returns(assessment);
        sinon.stub(store, 'findRecord').returns(challenge);

        const result = await route.model({}, transition);

        assert.deepEqual(result, { assessment, challenge });
      });
    });

    module('When there is an other challenge', function () {
      test('should call the assessment challenge route', async function (assert) {
        const store = this.owner.lookup('service:store');
        const route = this.owner.lookup('route:assessment.challenge');
        const currentLearner = this.owner.lookup('service:currentLearner');
        sinon.stub(currentLearner, 'learner').value({ id: 156 });
        const assessment = { id: 2, type: 'PIX1D_MISSION' };
        const challenge = { id: 2 };
        const activity = { id: 2 };
        const organizationLearner = store.createRecord('organization-learner', { features: ['ORALIZATION'] });
        sinon.stub(route.router, 'replaceWith');
        sinon.stub(route, 'modelFor').returns(assessment);
        sinon.stub(store, 'queryRecord').returns(challenge);
        sinon.stub(store, 'findRecord').returns(organizationLearner);

        const result = await route.model();

        assert.deepEqual(result, { assessment, challenge, activity, oralization: true });
      });
    });

    module('When there is no more challenges', function () {
      test('should redirect to assessment resume route', async function (assert) {
        const store = this.owner.lookup('service:store');
        const route = this.owner.lookup('route:assessment.challenge');
        const assessment = { id: 2 };
        sinon.stub(route.router, 'replaceWith');
        sinon.stub(route, 'modelFor').returns(assessment);
        sinon.stub(store, 'queryRecord').returns(null);

        await route.model();

        assert.ok(
          route.router.replaceWith.calledWith('assessment.resume', assessment.id, {
            queryParams: { assessmentHasNoMoreQuestions: true },
          }),
        );
      });
    });
  });
});
