import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class ApplicationRoute extends Route {
  @service splash;
  @service session;
  @service intl;
  @service headData;
  @service featureToggles;
  @service oidcIdentityProviders;

  activate() {
    this.splash.hide();
  }

  async beforeModel(transition) {
    // Set the locale to en otherwise ember-intl will use en-us
    // There is no translation file en-us.json
    this.intl.setLocale('en');

    this.headData.description = this.intl.t('application.description');

    await this.featureToggles.load().catch();

    await this.oidcIdentityProviders.load().catch();

    await this.session.handleUserLanguageAndLocale(transition);
  }

  @action
  error(error) {
    const isUnauthorizedError = error?.errors?.some((err) => err.status === '401');
    return !isUnauthorizedError;
  }
}
