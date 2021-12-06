import Route from '@ember/routing/route';
import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';

export default class StartRoute extends Route.extend(SecuredRouteMixin) {
  model(params) {
    return { sessionId: params.session_id };
  }
}
