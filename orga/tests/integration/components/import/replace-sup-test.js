import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Import::ReplaceSup', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('upload button', function () {
    test('should be disable', async function (assert) {
      // given
      this.supportedFormats = ['.csv'];
      // when
      const screen = await render(
        hbs`<Import::ReplaceSup @disabled={{true}} @supportedFormats={{this.supportedFormats}} />`,
      );

      // then
      const button = screen.getByRole('button', {
        name: t('pages.organization-participants-import.actions.replace.label'),
      });
      assert.ok(button.hasAttribute('disabled'));
    });

    test('should be enable', async function (assert) {
      // given
      this.supportedFormats = ['.csv'];

      // when
      const screen = await render(
        hbs`<Import::ReplaceSup @disabled={{false}} @supportedFormats={{this.supportedFormats}} />`,
      );

      // then
      const button = screen.getByRole('button', {
        name: t('pages.organization-participants-import.actions.replace.label'),
      });
      assert.notOk(button.hasAttribute('disabled'));
    });
  });
});
