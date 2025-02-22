import NotificationContainer from '@1024pix/ember-cli-notifications/components/notification-container';
import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ScoWhitelistConfiguration from 'pix-admin/components/administration/certification/sco-whitelist-configuration';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

const accessToken = 'An access token';
const fileContent = 'foo';
const file = new Blob([fileContent], { type: `valid-file` });

module('Integration | Component | administration/certification/sco-whitelist-configuration', function (hooks) {
  setupIntlRenderingTest(hooks);

  let fetchStub;

  hooks.beforeEach(function () {
    class SessionService extends Service {
      data = { authenticated: { access_token: accessToken } };
    }
    this.owner.register('service:session', SessionService);

    fetchStub = sinon.stub(window, 'fetch');
  });

  hooks.afterEach(function () {
    window.fetch.restore();
  });

  module('when import succeeds', function (hooks) {
    hooks.beforeEach(function () {
      fetchStub
        .withArgs(`${ENV.APP.API_HOST}/api/admin/sco-whitelist`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'text/csv',
            Accept: 'application/json',
          },
          method: 'POST',
          body: file,
        })
        .resolves(fetchResponse({ status: 201 }));
    });

    test('it displays a success notification', async function (assert) {
      // when
      const screen = await render(<template><ScoWhitelistConfiguration /><NotificationContainer /></template>);
      const input = await screen.getByLabelText(t('pages.administration.certification.sco-whitelist.import.button'));
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(await screen.findByText(t('pages.administration.certification.sco-whitelist.import.success')));
    });
  });

  module('when import fails', function () {
    test('it displays an error notification', async function (assert) {
      // given
      fetchStub
        .withArgs(`${ENV.APP.API_HOST}/api/admin/sco-whitelist`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'text/csv',
            Accept: 'application/json',
          },
          method: 'POST',
          body: file,
        })
        .rejects();
      // when
      const screen = await render(<template><ScoWhitelistConfiguration /><NotificationContainer /></template>);
      const input = await screen.findByLabelText(t('pages.administration.certification.sco-whitelist.import.button'));
      await triggerEvent(input, 'change', { files: [file] });

      // then
      assert.ok(await screen.findByText(t('pages.administration.certification.sco-whitelist.import.error')));
    });
  });
});

function fetchResponse({ body, status }) {
  const mockResponse = new window.Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-type': 'application/json',
    },
  });

  return mockResponse;
}
