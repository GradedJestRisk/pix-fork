import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | SupOrganizationParticipant::HeaderActions', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Title', () => {
    test('it should show only title when participant count = 0', async function (assert) {
      //given
      this.set('participantCount', 0);

      // when
      const screen = await render(
        hbs`<SupOrganizationParticipant::HeaderActions @participantCount={{this.participantCount}} />`,
      );

      // then
      assert.ok(screen.getByText(t('pages.sup-organization-participants.title', { count: 0 })));
    });

    test('it should show title with participant count when count > 0', async function (assert) {
      //given
      this.set('participantCount', 5);

      // when
      const screen = await render(
        hbs`<SupOrganizationParticipant::HeaderActions @participantCount={{this.participantCount}} />`,
      );

      // then
      assert.ok(screen.getByText(t('pages.sup-organization-participants.title', { count: 5 })));
    });
  });

  module('when user is admin', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: '1' });
        isAdminInOrganization = true;
        prescriber = {
          lang: 'fr',
        };
      }
      this.owner.register('service:current-user', CurrentUserStub);
    });

    test('it displays the import button', async function (assert) {
      // when
      const screen = await render(hbs`<SupOrganizationParticipant::HeaderActions />`);

      // then
      assert.ok(screen.getByText(t('components.organization-participants-header.import-button')));
    });
  });

  module('when user is only member', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
      }
      this.owner.register('service:current-user', CurrentUserStub);
    });

    test('it should not display download template button', async function (assert) {
      // when
      const screen = await render(hbs`<SupOrganizationParticipant::HeaderActions />`);

      // then
      assert.notOk(screen.queryByText(t('pages.sup-organization-participants.actions.download-template')));
    });

    test('it should not display import button', async function (assert) {
      // when
      const screen = await render(hbs`<SupOrganizationParticipant::HeaderActions />`);

      // then
      assert.notOk(screen.queryByText('Importer (.csv)'));
      assert.notOk(screen.queryByText(`${t('components.organization-participants-header.import-button')} (.csv)`));
    });
  });
});
