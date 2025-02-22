import Object from '@ember/object';
import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | feature-toggles', function (hooks) {
  setupTest(hooks);

  module('feature toggles are loaded', function (hooks) {
    const featureToggles = Object.create({
      isTextToSpeechButtonEnabled: false,
      isNewAuthenticationDesignEnabled: false,
      isPixCompanionEnabled: false,
      showNewCampaignPresentationPage: false,
    });

    let storeStub;

    hooks.beforeEach(function () {
      storeStub = Service.create({
        queryRecord: sinon.stub().resolves(featureToggles),
      });
    });

    test('should load the feature toggles', async function (assert) {
      // given
      const featureToggleService = this.owner.lookup('service:featureToggles');
      featureToggleService.set('store', storeStub);

      // when
      await featureToggleService.load();

      // then
      assert.deepEqual(featureToggleService.featureToggles, featureToggles);
    });

    test('it should initialize the feature toggle isTextToSpeechButtonEnabled to false', async function (assert) {
      // given
      const featureToggleService = this.owner.lookup('service:featureToggles');
      featureToggleService.set('store', storeStub);

      // when
      await featureToggleService.load();

      // then
      assert.false(featureToggleService.featureToggles.isTextToSpeechButtonEnabled);
    });

    test('it initializes the feature toggle isNewAuthenticationDesignEnabled to false', async function (assert) {
      // given
      const featureToggleService = this.owner.lookup('service:featureToggles');
      featureToggleService.set('store', storeStub);

      // when
      await featureToggleService.load();

      // then
      assert.false(featureToggleService.featureToggles.isNewAuthenticationDesignEnabled);
    });

    test('it initializes the feature toggle isPixCompanionEnabled to false', async function (assert) {
      // given
      const featureToggleService = this.owner.lookup('service:featureToggles');
      featureToggleService.set('store', storeStub);

      // when
      await featureToggleService.load();

      // then
      assert.false(featureToggleService.featureToggles.isPixCompanionEnabled);
    });

    test('it initializes the feature toggle showNewCampaignPresentationPage to false', async function (assert) {
      // given
      const featureToggleService = this.owner.lookup('service:featureToggles');
      featureToggleService.set('store', storeStub);

      // when
      await featureToggleService.load();

      // then
      assert.false(featureToggleService.featureToggles.showNewCampaignPresentationPage);
    });
  });
});
