import { clickByName, visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { module, test } from 'qunit';

module('Acceptance | Trainings | Triggers edit', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'fr');

  let trainingId;

  hooks.beforeEach(async function () {
    trainingId = 2;

    server.create(
      'training',
      {
        id: 2,
        title: 'Devenir tailleur de citrouille',
        link: 'http://www.example2.net',
        type: 'autoformation',
        duration: '10:00:00',
        locale: 'fr-fr',
        editorName: "Ministère de l'éducation nationale et de la jeunesse. Liberté égalité fraternité",
        editorLogoUrl: 'https://mon-logo.svg',
        prerequisiteThreshold: null,
        goalThreshold: null,
      },
      'withFramework',
    );
  });

  module('When admin member is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit(`/trainings/1/triggers/edit`);

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When admin member is logged in', function () {
    test('it should be accessible by an authenticated user : prerequisite edit', async function (assert) {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      // when
      const screen = await visit(`/trainings/${trainingId}/`);
      await click(
        screen.getByRole('link', {
          name: t('pages.trainings.training.triggers.prerequisite.alternative-title'),
        }),
      );

      // then
      assert.strictEqual(currentURL(), `/trainings/${trainingId}/triggers/edit?type=prerequisite`);
    });

    test('it should be accessible by an authenticated user : goal edit', async function (assert) {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      // when
      const screen = await visit(`/trainings/${trainingId}/`);
      await click(screen.getByRole('link', { name: t('pages.trainings.training.triggers.goal.alternative-title') }));

      // then
      assert.strictEqual(currentURL(), `/trainings/${trainingId}/triggers/edit?type=goal`);
    });

    test('it should be able to cancel the edit form', async function (assert) {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      // when
      const screen = await visit(`/trainings/${trainingId}/triggers/edit?type=prerequisite`);
      await click(screen.getByRole('button', { name: 'Annuler' }));

      // then
      assert.strictEqual(currentURL(), `/trainings/${trainingId}/triggers`);
    });

    test('it should be able to save a new trigger', async function (assert) {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      // when
      const screen = await visit(`/trainings/${trainingId}/`);
      await click(
        screen.getByRole('link', {
          name: t('pages.trainings.training.triggers.prerequisite.alternative-title'),
        }),
      );

      const thresholdInputs = screen.getByLabelText('Seuil en % :');
      await fillIn(thresholdInputs, 20);

      await click(await screen.findByText('area_f1_a1 code', { exact: false }));
      await click(await screen.findByText('competence_f1_a1_c1 index', { exact: false }));
      await click(await screen.findByText('thematic_f1_a1_c1_th1 name', { exact: false }));
      assert.dom(await screen.findByText('2/5 sujet(s) sélectionné(s)')).exists();

      await clickByName('Enregistrer le déclencheur');

      // then
      assert.strictEqual(currentURL(), `/trainings/${trainingId}/triggers`);
      assert.dom(await screen.findByText('Seuil : 20%', { exact: false })).exists();
      assert.dom(await screen.findByText('2 sujets', { exact: false })).exists();
    });

    module('when admin member is "SUPPORT"', function () {
      test('it should not edit a trigger', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSupport: true })(server);

        // when
        const screen = await visit(`/trainings/${trainingId}/`);

        // then
        assert
          .dom(
            screen.queryByRole('link', {
              name: t('pages.trainings.training.triggers.prerequisite.alternative-title'),
            }),
          )
          .doesNotExist();
      });
    });
  });
});
