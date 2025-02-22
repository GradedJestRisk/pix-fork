import { render, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Participant::Assessment::Header', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.setupRouter();
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.organization = {};
  });

  test('it should display user information', async function (assert) {
    // given
    this.participation = {
      firstName: 'Jean',
      lastName: 'La fripouille',
    };
    this.campaign = {};

    // when
    const screen = await render(
      hbs`<Participant::Assessment::Header @participation={{this.participation}} @campaign={{this.campaign}} />`,
    );

    // then
    assert.ok(screen.getByText('Jean La fripouille'));
  });

  module('participation selector', function () {
    module('for campaign not multipleSending', function () {
      test('it should not be displayed', async function (assert) {
        this.participation = {
          firstName: 'Jean',
          lastName: 'La fripouille',
          id: 12345,
        };
        this.campaign = { multipleSendings: false };
        this.allParticipations = [this.participation];

        const screen = await render(
          hbs`<Participant::Assessment::Header
  @participation={{this.participation}}
  @campaign={{this.campaign}}
  @allParticipations={{this.allParticipations}}
/>`,
        );

        assert.notOk(screen.queryByLabelText(t('pages.assessment-individual-results.participation-selector')));
      });
    });

    module('for multipleSending campaigns', function () {
      test('it should have categories for participations options', async function (assert) {
        this.participation = {
          firstName: 'Jean',
          lastName: 'La fripouille',
          id: 12345,
          status: 'TO_SHARE',
        };
        const anotherParticipation = {
          firstName: 'Jean',
          lastName: 'La fripouille',
          id: 12346,
          status: 'SHARED',
          sharedAt: '2020-01-02',
        };
        this.campaign = { multipleSendings: true };
        this.allParticipations = [this.participation, anotherParticipation];

        const screen = await render(
          hbs`<Participant::Assessment::Header
  @participation={{this.participation}}
  @campaign={{this.campaign}}
  @allParticipations={{this.allParticipations}}
/>`,
        );

        const selector = screen.getByLabelText(t('pages.assessment-individual-results.participation-selector'));
        await click(selector);
        await screen.findByRole('listbox');

        assert.ok(
          within(screen.getByRole('listbox')).getByText(t('pages.assessment-individual-results.participation-shared'), {
            exact: false,
          }),
        );
        assert.ok(
          within(screen.getByRole('listbox')).getByText(
            t('pages.assessment-individual-results.participation-not-shared'),
            { exact: false },
          ),
        );
      });

      test('it should redirect toward a participation', async function (assert) {
        const router = this.owner.lookup('service:router');
        router.transitionTo = sinon.stub();

        this.participation = {
          firstName: 'Jean',
          lastName: 'La fripouille',
          id: 12345,
          status: 'TO_SHARE',
        };
        const anotherParticipation = {
          firstName: 'Jean',
          lastName: 'La fripouille',
          id: 12346,
          status: 'SHARED',
          sharedAt: '2020-01-02',
        };
        this.campaign = { multipleSendings: true, id: '1' };
        this.allParticipations = [this.participation, anotherParticipation];

        const screen = await render(
          hbs`<Participant::Assessment::Header
  @participation={{this.participation}}
  @campaign={{this.campaign}}
  @allParticipations={{this.allParticipations}}
/>`,
        );

        const selector = screen.getByLabelText(t('pages.assessment-individual-results.participation-selector'));
        await click(selector);
        await screen.findByRole('listbox');
        await click(
          screen.getByRole('option', {
            name: `${t('pages.assessment-individual-results.participation-label', { participationNumber: 1 })} - 02/01/2020`,
          }),
        );

        assert.ok(
          router.transitionTo.calledWith(
            'authenticated.campaigns.participant-assessment',
            this.campaign.id,
            this.allParticipations[1].id,
          ),
        );
      });
    });
  });

  test('it displays campaign participation creation date', async function (assert) {
    this.participation = { createdAt: '2020-01-01' };
    this.campaign = {};

    const screen = await render(
      hbs`<Participant::Assessment::Header @participation={{this.participation}} @campaign={{this.campaign}} />`,
    );

    assert.ok(screen.getByText('01 janv. 2020'));
  });

  test('it displays campaign participation progression', async function (assert) {
    this.participation = { progression: 0.75 };
    this.campaign = {};

    const screen = await render(
      hbs`<Participant::Assessment::Header @participation={{this.participation}} @campaign={{this.campaign}} />`,
    );

    assert.ok(screen.getByText(t('pages.assessment-individual-results.progression')));
    assert.ok(screen.getByText('75 %'));
  });

  module('is shared', function () {
    module('when participant has shared results', function () {
      test('it displays the sharing date', async function (assert) {
        this.participation = {
          isShared: true,
          sharedAt: '2020-01-02',
          masteryRate: 0.85,
        };
        this.campaign = {};

        const screen = await render(
          hbs`<Participant::Assessment::Header @participation={{this.participation}} @campaign={{this.campaign}} />`,
        );

        assert.ok(screen.getByText(t('pages.campaign-individual-results.shared-date')));
        assert.ok(screen.getByText('02 janv. 2020'));
      });
    });

    module('when participant has not shared results', function () {
      test('it does not displays the sharing date', async function (assert) {
        this.participation = { isShared: false };
        this.campaign = {};

        const screen = await render(
          hbs`<Participant::Assessment::Header @participation={{this.participation}} @campaign={{this.campaign}} />`,
        );

        assert.notOk(screen.queryByText(t('pages.campaign-individual-results.shared-date')));
      });
    });
  });

  module('identifiant', function () {
    module('when the external id is present', function () {
      test('it displays the external id', async function (assert) {
        this.participation = {
          participantExternalId: 'i12345',
          isShared: false,
        };
        this.campaign = { idPixLabel: 'identifiant de l’élève' };

        const screen = await render(
          hbs`<Participant::Assessment::Header @participation={{this.participation}} @campaign={{this.campaign}} />`,
        );

        assert.ok(screen.getByText('identifiant de l’élève'));
        assert.ok(screen.getByText('i12345'));
      });
    });
    module('when the external id is not present', function () {
      test('it does not display the external id', async function (assert) {
        this.participation = {
          participantExternalId: null,
          isShared: false,
        };
        this.campaign = {};

        const screen = await render(
          hbs`<Participant::Assessment::Header @participation={{this.participation}} @campaign={{this.campaign}} />`,
        );

        assert.notOk(screen.queryByText('identifiant de l’élève'));
      });
    });
  });

  module('results information', function () {
    module('when the participation is shared', function () {
      test('it should not display campaign progression', async function (assert) {
        this.participation = { progression: 1, isShared: true, masteryRate: 0.85 };
        this.campaign = {};

        const screen = await render(
          hbs`<Participant::Assessment::Header @participation={{this.participation}} @campaign={{this.campaign}} />`,
        );

        assert.notOk(screen.queryByText(t('pages.assessment-individual-results.progression')));
        assert.notOk(screen.queryByText(t('common.result.percentage', { value: this.participation.progression })));
      });

      module('when the campaign has stages', function () {
        test('it displays stages acquired', async function (assert) {
          this.campaign = {
            hasStages: true,
            stages: [
              { id: 'stage1', threshold: 0 },
              { id: 'stage2', threshold: 70 },
              { id: 'stage3', threshold: 80 },
            ],
          };
          this.participation = {
            isShared: true,
            reachedStage: 2,
            totalStage: 3,
          };

          const screen = await render(
            hbs`<Participant::Assessment::Header @participation={{this.participation}} @campaign={{this.campaign}} />`,
          );

          assert.ok(screen.queryByLabelText(t('pages.assessment-individual-results.result')));
          assert.ok(screen.getByText(t('common.result.stages', { count: 1, total: 2 })));
        });
      });

      module('when the campaign has no stages', function () {
        test('it displays campaign participation mastery percentage', async function (assert) {
          this.participation = { masteryRate: 0.65, isShared: true };
          this.campaign = {};

          const screen = await render(
            hbs`<Participant::Assessment::Header @participation={{this.participation}} @campaign={{this.campaign}} />`,
          );

          // We should keep getAllByText instead of getByText because in the ci the npm run test fails.
          // It finds two occurences instead of one for some reason related to a nbsp; not being present in this context.
          assert.ok(screen.getAllByText('65%')[0]);
        });
      });

      module('when the campaign has badges', function () {
        test('it displays badges acquired', async function (assert) {
          this.campaign = { hasBadges: true };
          this.participation = { isShared: true, masteryRate: 0.85, badges: [{ id: '1', title: 'Les bases' }] };

          const screen = await render(
            hbs`<Participant::Assessment::Header @participation={{this.participation}} @campaign={{this.campaign}} />`,
          );

          assert
            .dom(screen.queryByLabelText(t('pages.assessment-individual-results.badges')))
            .containsText('Les bases');
        });
      });

      module('when the campaign has no badges', function () {
        test('it does not display badges acquired', async function (assert) {
          this.campaign = { hasBadges: false };
          this.participation = { isShared: true, masteryRate: 0.85, badges: [{ id: '1', title: 'Les bases' }] };

          const screen = await render(
            hbs`<Participant::Assessment::Header @participation={{this.participation}} @campaign={{this.campaign}} />`,
          );

          assert.notOk(screen.queryByLabelText(t('pages.assessment-individual-results.badges')));
        });
      });

      module('when the campaign has badges but the participant has not acquired one', function () {
        test('it does not display badges', async function (assert) {
          this.campaign = { hasBadges: true };
          this.participation = { isShared: true, masteryRate: 0.85, badges: [] };

          const screen = await render(
            hbs`<Participant::Assessment::Header @participation={{this.participation}} @campaign={{this.campaign}} />`,
          );
          assert.notOk(screen.queryByLabelText(t('pages.assessment-individual-results.badges')));
        });
      });
    });

    module('when the participation is not shared', function () {
      test('it does not display results', async function (assert) {
        this.participation = { isShared: false };
        this.campaign = {};

        const screen = await render(
          hbs`<Participant::Assessment::Header @participation={{this.participation}} @campaign={{this.campaign}} />`,
        );

        assert.notOk(screen.queryByLabelText(t('pages.assessment-individual-results.result')));
      });
    });
  });
});
