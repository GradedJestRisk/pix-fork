import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class JoinRoute extends Route {
  @service store;

  queryParams = {
    code: { replace: true },
    invitationId: { replace: true },
  };

  model(params) {
    return this.store.queryRecord('certification-center-invitation', {
      invitationId: params.invitationId,
      code: params.code,
    });
  }
}
