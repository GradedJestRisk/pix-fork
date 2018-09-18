import EmberObject from '@ember/object';
import { A } from '@ember/array';
import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | campaigns/start-or-resume', function() {

  setupTest('route:campaigns/start-or-resume', {
    needs: ['service:current-routed-modal']
  });

  let storeStub;
  let createRecordStub;
  let queryRecordStub;
  let queryStub;

  beforeEach(function() {
    queryStub = sinon.stub();
    createRecordStub = sinon.stub();
    queryRecordStub = sinon.stub();
    storeStub = Service.extend({ queryRecord: queryRecordStub, query: queryStub, createRecord: createRecordStub });
    this.register('service:store', storeStub);
    this.inject.service('store', { as: 'store' });

    this.register('service:session', Service.extend({
      isAuthenticated: true,
      data: {
        authenticated: {
          userId: 1435
        }
      }
    }));
    this.inject.service('session', { as: 'session' });
  });

  describe('#modelNew', function() {

    it('should create new campaign-participation for current user', function() {
      // given
      const route = this.subject();
      const params = {
        campaign_code: 'AQST765'
      };
      const currentUserId = 1435;
      const currentCampaign = EmberObject.create({ id: 1234 });
      const campaigns = A([currentCampaign]);
      const newCampaignParticipation = EmberObject.create({ });

      queryStub.resolves(campaigns);
      createRecordStub.returns(newCampaignParticipation);

      // when
      const promise = route.modelNew(params);

      // then
      return promise.then((campaignParticipation) => {
        sinon.assert.calledWith(createRecordStub, 'campaign-participation', { userId: currentUserId, campaignId: currentCampaign.get('id') });
        expect(campaignParticipation).to.deep.equal(newCampaignParticipation);
      });
    });
  });

  describe('#model', function() {

    const params = {
      campaign_code: 'CODECAMPAIGN'
    };

    it('should fetch all user assessments with type "SMART_PLACEMENT"', function() {
      // given
      const assessments = A([]);
      queryStub.resolves(assessments);
      const assessment = EmberObject.create({ save: () => true });
      createRecordStub.returns(assessment);
      const route = this.subject();

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(queryStub, 'assessment', { filter: { type: 'SMART_PLACEMENT', codeCampaign: 'CODECAMPAIGN' } });
      });
    });

    it('should resolve with assessment corresponding of campaignCode if found', function() {
      // given
      const assessments = A([EmberObject.create({ id: 1234, codeCampaign: 'CODECAMPAIGN' })]);
      queryStub.resolves(assessments);
      const route = this.subject();

      // when
      const promise = route.model(params);

      // then
      return promise.then((model) => {
        expect(model.get('id')).to.equal(1234);
      });
    });

    it('should resolve with freshly created one if no one has been found', function() {
      // given
      const assessments = A([]);
      queryStub.resolves(assessments);
      createRecordStub.returns({
        save() {
        }
      });

      const route = this.subject();

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(createRecordStub, 'assessment', { type: 'SMART_PLACEMENT', codeCampaign: params.campaign_code });
      });
    });
  });

  describe('#afterModel', function() {

    let route;
    let assessment;

    beforeEach(function() {
      route = this.subject();
      route.transitionTo = sinon.stub();
      assessment = EmberObject.create({ reload: sinon.stub().resolves() });
    });

    it('should force assessment reload in order to pre-fetch its answers', function() {// when
      const promise = route.afterModel(assessment);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(assessment.reload);
      });
    });

    it('should redirect to next challenge if one was found', function() {
      // given
      queryRecordStub.resolves();

      // when
      const promise = route.afterModel(assessment);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(route.transitionTo, 'assessments.challenge');
      });
    });

    it('should redirect to assessment rating if no next challenge was found', function() {
      // given
      queryRecordStub.rejects();

      // when
      const promise = route.afterModel(assessment);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(route.transitionTo, 'assessments.rating');
      });
    });
  });
});
