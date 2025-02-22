import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import ENV from 'pix-certif/config/environment';

const NO_INTERNET_MESSAGE = 'Failed to fetch';
export default class SessionSupervisingRoute extends Route {
  @service store;
  @service router;
  @service pixToast;
  @service intl;

  async model(params) {
    return this.store.queryRecord('session-for-supervising', {
      sessionId: params.session_id,
    });
  }

  afterModel(model) {
    this.poller = setInterval(async () => {
      try {
        await this.store.queryRecord('session-for-supervising', { sessionId: model.id });
      } catch (response) {
        this.#stopPolling();
        if (response?.errors?.[0]?.status === '401') {
          this.router.replaceWith('login-session-supervisor');
        }

        if (response.message === NO_INTERNET_MESSAGE) {
          this.pixToast.sendErrorNotification({
            message: this.intl.t('pages.session-supervising-error.no-internet-error'),
          });
        }
      }
    }, ENV.APP.sessionSupervisingPollingRate);
  }

  deactivate() {
    this.#stopPolling();
  }

  @action
  error() {
    this.#stopPolling();
    return true;
  }

  #stopPolling() {
    if (this.poller) {
      clearInterval(this.poller);
      this.poller = null;
    }
  }
}
