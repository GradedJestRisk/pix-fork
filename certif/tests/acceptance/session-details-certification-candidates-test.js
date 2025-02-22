import { visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn, find, settled, triggerEvent } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupIntl } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { SUBSCRIPTION_TYPES } from 'pix-certif/models/subscription';
import { module, test } from 'qunit';

import { authenticateSession } from '../helpers/test-init';

/* eslint-disable ember/no-settled-after-test-helper */
module('Acceptance | Session Details Certification Candidates', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'fr');

  module('When certificationPointOfContact is not logged in', function () {
    test('it should not be accessible by an unauthenticated certificationPointOfContact', async function (assert) {
      const session = server.create('session-enrolment');
      server.create('session-management', {
        id: session.id,
      });
      // when
      await visit(`/sessions/${session.id}/candidats`);

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('when certificationPointOfContact is logged in', function (hooks) {
    let allowedCertificationCenterAccess;
    let certificationPointOfContact;
    let session;
    const complementaryCertificationId = 123;

    hooks.beforeEach(async () => {
      server.create('feature-toggle', {
        isNeedToAdjustCertificationAccessibilityEnabled: false,
      });
      allowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
        isAccessBlockedCollege: false,
        isAccessBlockedLycee: false,
        isAccessBlockedAEFE: false,
        isAccessBlockedAgri: false,
        isV3Pilot: false,
        habilitations: [
          {
            id: complementaryCertificationId,
            label: 'Pix+Droit',
          },
        ],
      });
      certificationPointOfContact = server.create('certification-point-of-contact', {
        firstName: 'Lena',
        lastName: 'Rine',
        allowedCertificationCenterAccesses: [allowedCertificationCenterAccess],
        pixCertifTermsOfServiceAccepted: true,
      });
      session = server.create('session-enrolment', { certificationCenterId: allowedCertificationCenterAccess.id });
      server.create('session-management', {
        id: session.id,
      });
      await authenticateSession(certificationPointOfContact.id);
    });

    test('it should redirect from candidates to session list on click on return button', async function (assert) {
      // when
      const screen = await visit(`/sessions/${session.id}/candidats`);
      await click(screen.getByRole('link', { name: 'Revenir à la liste des sessions' }));

      // then
      assert.deepEqual(currentURL(), '/sessions');
    });

    module('when current certification center is blocked', function () {
      test('should redirect to espace-ferme URL', async function (assert) {
        // given
        allowedCertificationCenterAccess.update({ isAccessBlockedCollege: true });

        // when
        await visit(`/sessions/${session.id}/candidats`);

        // then
        assert.strictEqual(currentURL(), '/espace-ferme');
      });
    });

    module('when there is no candidates yet', function () {
      test('it should display a download button and upload button', async function (assert) {
        // when
        const screen = await visit(`/sessions/${session.id}/candidats`);

        // then
        assert.dom(screen.getByRole('button', { name: 'Télécharger (.ods)' })).exists();
        assert.dom(screen.getByRole('button', { name: 'Importer (.ods)' })).exists();
      });

      test('it should display a sentence when there is no certification candidates yet', async function (assert) {
        // when
        const screen = await visit(`/sessions/${session.id}/candidats`);

        // then
        assert.dom(screen.getByText('En attente de candidats')).exists();
      });
    });

    module('when there are some candidates', function (hooks) {
      let sessionWithCandidates;

      hooks.beforeEach(function () {
        sessionWithCandidates = server.create('session-enrolment', {
          certificationCenterId: allowedCertificationCenterAccess.id,
        });
        const coreSubscription = server.create('subscription', {
          type: SUBSCRIPTION_TYPES.CORE,
          complementaryCertificationId: null,
        });
        const complementarySubscription = server.create('subscription', {
          type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
          complementaryCertificationId,
        });
        server.create('certification-candidate', {
          firstName: 'Alin',
          lastName: 'Cendy',
          sessionId: sessionWithCandidates.id,
          isLinked: false,
          resultRecipientEmail: 'cendy@example.com',
          birthdate: '10-10-2000',
          externalId: 'EXTERNAL-ID',
          subscriptions: [coreSubscription],
        });
        server.create('certification-candidate', {
          firstName: 'Alain',
          lastName: 'Sassin',
          sessionId: sessionWithCandidates.id,
          isLinked: false,
          resultRecipientEmail: 'sassin@example.com',
          subscriptions: [complementarySubscription],
        });
        server.create('session-management', {
          id: sessionWithCandidates.id,
        });
      });

      test('it should display details modal button', async function (assert) {
        // when
        const screen = await visit(`/sessions/${sessionWithCandidates.id}/candidats`);

        // then
        assert.dom(screen.getByRole('button', { name: 'Voir le détail du candidat Alin Cendy' })).exists();
      });

      test('it should display the list of certification candidates', async function (assert) {
        // given
        const dayjs = this.owner.lookup('service:dayjs');

        // when
        const screen = await visit(`/sessions/${sessionWithCandidates.id}/candidats`);

        // then
        const table = screen.getByRole('table', {
          name: 'Liste des candidats inscrits à la session, triée par nom de naissance, avec un lien pour voir les détails du candidat et la possibilité de supprimer un candidat dans la dernière colonne.',
        });
        const rows = await within(table).findAllByRole('row');
        assert.strictEqual(rows.length, 3);
        assert.dom(within(rows[0]).queryByRole('columnheader', { name: 'Accessibilité' })).doesNotExist();
        assert.dom(within(rows[1]).getByRole('cell', { name: 'Cendy' })).exists();
        assert.dom(within(rows[1]).getByRole('cell', { name: 'Alin' })).exists();
        assert.dom(within(rows[1]).getByRole('cell', { name: 'cendy@example.com' })).exists();
        assert
          .dom(within(rows[1]).getByRole('cell', { name: dayjs.self('10-10-2000', 'YYYY-MM-DD').format('DD/MM/YYYY') }))
          .exists();
        assert.dom(within(rows[1]).getByRole('cell', { name: '30 %' })).exists();
        assert.dom(within(rows[1]).getByRole('cell', { name: 'Certification Pix' })).exists();
        assert.dom(within(rows[2]).getByRole('cell', { name: 'Pix+Droit' })).exists();

        await click(screen.getByRole('button', { name: 'Voir le détail du candidat Alin Cendy' }));

        const modal = await screen.findByRole('dialog');
        assert.dom(within(modal).getByText('EXTERNAL-ID')).exists();
      });

      module(
        'when feature toggle isNeedToAdjustCertificationAccessibilityEnabled is true and center is v3 pilot',
        function (hooks) {
          let allowedCertificationCenterAccess;
          let certificationPointOfContact;
          let session;

          hooks.beforeEach(async () => {
            server.create('feature-toggle', {
              isNeedToAdjustCertificationAccessibilityEnabled: true,
            });
            allowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
              isV3Pilot: true,
            });
            certificationPointOfContact = server.create('certification-point-of-contact', {
              firstName: 'Lena',
              lastName: 'Rine',
              allowedCertificationCenterAccesses: [allowedCertificationCenterAccess],
              pixCertifTermsOfServiceAccepted: true,
            });
            session = server.create('session-enrolment', {
              certificationCenterId: allowedCertificationCenterAccess.id,
            });
            server.create('certification-candidate', {
              firstName: 'John',
              lastName: 'Doe',
              sessionId: session.id,
              accessibilityAdjustedCertificationNeeded: true,
            });
            server.create('session-management', {
              id: session.id,
            });
            await authenticateSession(certificationPointOfContact.id);
          });

          test('should display accessibility adjusted certification needed information', async function (assert) {
            // given
            const screen = await visit(`/sessions/${session.id}/candidats`);

            // then
            assert.dom(screen.getByRole('columnheader', { name: 'Accessibilité' })).exists();
            assert.dom(screen.getByRole('cell', { name: 'Oui' })).exists();
          });

          test('should be possible to update candidate information', async function (assert) {
            // given
            const screen = await visit(`/sessions/${session.id}/candidats`);
            assert.dom(screen.getByRole('columnheader', { name: 'Accessibilité' })).exists();
            assert.dom(screen.getByRole('cell', { name: 'Oui' })).exists();

            // when
            await click(screen.getByRole('button', { name: 'Editer le candidat John Doe' }));
            await click(screen.getByText("Le candidat a besoin d'un aménagement"));
            await click(screen.getByText('Modifier'));

            // then
            assert.dom(screen.queryByRole('cell', { name: 'Oui' })).doesNotExist();
          });
        },
      );

      module('when the details button is clicked', function () {
        test('it should display the candidate details modal', async function (assert) {
          // when
          const screen = await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
          await click(screen.getByLabelText(`Voir le détail du candidat Alain Sassin`));

          // then
          const modal = await screen.findByRole('dialog');
          assert.dom(screen.getByRole('heading', { name: 'Détail du candidat' })).exists();
          assert.dom(screen.getByText('Commune de naissance')).exists();
          assert.dom(within(modal).getByText('France')).exists();
          assert.dom(within(modal).getByText('Homme')).exists();
          assert.dom(within(modal).getByText('Pix+Droit')).exists();
        });
      });

      module('on import', function () {
        test('it should replace the candidates list with the imported ones', async function (assert) {
          // given
          const screen = await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
          const file = new Blob(['foo'], { type: `${sessionWithCandidates.id}.add-two-candidates` });

          // when
          const input = await screen.findByLabelText('Importer (.ods)');
          await triggerEvent(input, 'change', { files: [file] });
          await settled();

          // then
          assert.dom('table tbody tr').exists({ count: 2 });
        });

        test('it should display a success message when uploading a valid file', async function (assert) {
          // given
          const screen = await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
          const file = new Blob(['foo'], { type: 'valid-file' });

          // when
          const input = find('#upload-attendance-sheet');
          await triggerEvent(input, 'change', { files: [file] });
          await settled();

          // then
          assert.dom(screen.getByText('La liste des candidats a été importée avec succès.')).exists();
        });

        module('error cases', function () {
          module('when uploading an invalid file', function () {
            test('it should display the error message', async function (assert) {
              // given
              const screen = await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
              const file = new Blob(['foo'], { type: 'invalid-file' });

              // when
              const input = find('#upload-attendance-sheet');
              await triggerEvent(input, 'change', { files: [file] });
              await settled();

              // then
              assert
                .dom(
                  screen.getByText(
                    "Veuillez télécharger à nouveau le modèle de liste des candidats et l'importer à nouveau.",
                    { exact: false },
                  ),
                )
                .exists();
            });
          });

          module('when uploading a file with validation error', function () {
            test('it should display the error message', async function (assert) {
              // given
              const screen = await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
              const file = new Blob(['foo'], { type: 'candidate-birth-postal-code-city-not-valid' });

              // when
              const input = find('#upload-attendance-sheet');
              await triggerEvent(input, 'change', { files: [file] });
              await settled();

              // then
              assert
                .dom(
                  screen.getByText(
                    'Aucun candidat n’a été importé. Ligne 2 : Le code postal "88000" ne correspond pas à la ville "Gotham City"',
                  ),
                )
                .exists();
            });
          });

          module('when uploading a file with generic error', function () {
            test('it should display the default message', async function (assert) {
              // given
              const screen = await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
              const file = new Blob(['foo'], { type: 'internal-error' });

              // when
              const input = find('#upload-attendance-sheet');
              await triggerEvent(input, 'change', { files: [file] });
              await settled();

              // then
              assert
                .dom(
                  screen.getByText(
                    "Aucun candidat n’a été importé. Veuillez réessayer ou nous contacter via le formulaire du centre d'aide.",
                  ),
                )
                .exists();
            });
          });

          module('when importing is forbidden', function () {
            test('it should display a specific error message', async function (assert) {
              // given
              const screen = await visit(`/sessions/${sessionWithCandidates.id}/candidats`);
              const file = new Blob(['foo'], { type: 'forbidden-import' });

              // when
              const input = find('#upload-attendance-sheet');
              await triggerEvent(input, 'change', { files: [file] });
              await settled();

              // then
              assert
                .dom(
                  screen.getByText(
                    (errorMessage) =>
                      errorMessage.startsWith('Aucun candidat n’a été importé.') &&
                      errorMessage.endsWith(
                        'Si vous souhaitez modifier la liste, vous pouvez inscrire un candidat directement dans le tableau ci-dessous.',
                      ),
                  ),
                )
                .exists();
            });
          });

          module('when the import is not allowed', function () {
            test('it should display a warning', async function (assert) {
              // given
              server.create('certification-candidate', { sessionId: sessionWithCandidates.id, isLinked: true });

              // when
              const screen = await visit(`/sessions/${sessionWithCandidates.id}/candidats`);

              // then
              assert
                .dom(
                  screen.getByText(
                    'La session a débuté, vous ne pouvez plus importer une liste de candidats. Si vous souhaitez modifier la liste, vous pouvez inscrire un candidat directement dans le tableau ci-dessous.',
                  ),
                )
                .exists();
            });
          });
        });
      });
    });

    test('it should redirect to the default candidates detail view', async function (assert) {
      // given
      const connectedCertificationPointOfContactId = certificationPointOfContact.id;
      await authenticateSession(connectedCertificationPointOfContactId);

      // when
      const screen = await visit(`/sessions/${session.id}`);
      await click(screen.getByRole('link', { name: 'Candidats' }));

      // then
      assert.strictEqual(currentURL(), `/sessions/${session.id}/candidats`);
    });

    module('when the addCandidate button is clicked', function () {
      test('it should open the new Certification Candidate Modal', async function (assert) {
        // given
        const sessionWithoutCandidates = server.create('session-enrolment', {
          certificationCenterId: allowedCertificationCenterAccess.id,
        });
        server.create('session-management', {
          id: sessionWithoutCandidates.id,
        });
        server.create('country', []);

        // when
        const screen = await visit(`/sessions/${sessionWithoutCandidates.id}/candidats`);
        await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
        await settled();

        // then
        await screen.findByRole('dialog');
        assert.dom(screen.getByRole('button', { name: 'Inscrire le candidat' })).exists();
      });

      module('when the addCandidate button is clicked a second time', function (hooks) {
        hooks.beforeEach(async function () {
          server.createList('country', 2, { code: '99100', name: 'France' });
        });

        test('it should open the new Certification Candidate Modal with empty input', async function (assert) {
          // given
          const sessionWithoutCandidates = server.create('session-enrolment', {
            certificationCenterId: allowedCertificationCenterAccess.id,
          });
          server.create('session-management', {
            id: sessionWithoutCandidates.id,
          });
          const screen = await visit(`/sessions/${sessionWithoutCandidates.id}/candidats`);

          await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
          const modal = await screen.findByRole('dialog');
          await fillIn(screen.getByLabelText('* Nom de naissance'), 'BackStreet');
          await fillIn(screen.getByLabelText('* Prénom'), 'Boys');
          await click(screen.getByLabelText('Homme'));
          await fillIn(screen.getByLabelText('* Date de naissance'), '01/01/2000');
          await fillIn(screen.getByLabelText('* Pays de naissance'), '99100');
          await click(screen.getByLabelText('Code INSEE'));
          await fillIn(screen.getByLabelText('Identifiant externe'), '44AA3355');
          await fillIn(screen.getByLabelText('* Code INSEE de naissance'), '75100');
          await fillIn(screen.getByLabelText('Temps majoré (%)'), '20');
          await click(screen.getByLabelText('* Tarification part Pix'));
          await click(
            await screen.findByRole('option', {
              name: 'Prépayée',
            }),
          );
          await fillIn(screen.getByLabelText('Code de prépaiement'), '12345');
          await fillIn(
            screen.getByLabelText('E-mail du destinataire des résultats (formateur, enseignant...)'),
            'guybrush.threepwood@example.net',
          );
          await fillIn(screen.getByLabelText('E-mail de convocation'), 'roooooar@example.net');

          await click(within(modal).getByRole('button', { name: 'Fermer' }));

          // when
          await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
          // then

          assert.strictEqual(screen.getByLabelText('* Nom de naissance').value, '');
          assert.strictEqual(screen.getByLabelText('* Prénom').value, '');
          assert.false(screen.getByLabelText('Homme').checked);
          assert.strictEqual(screen.getByLabelText('* Date de naissance').value, '');
          assert.strictEqual(screen.getByLabelText('Identifiant externe').value, '');
          assert.strictEqual(screen.getByLabelText('* Code INSEE de naissance').value, '');
          assert.strictEqual(screen.getByLabelText('Temps majoré (%)').value, '');
          assert.strictEqual(screen.getByLabelText('* Tarification part Pix').value, '');
          assert.dom(screen.queryByLabelText('Code de prépaiement')).doesNotExist();
          assert.strictEqual(
            screen.getByLabelText('E-mail du destinataire des résultats (formateur, enseignant...)').value,
            '',
          );
          assert.strictEqual(screen.getByLabelText('E-mail de convocation').value, '');
        });
      });

      module('when the new candidate form is submitted', function () {
        module('when the submitted form data is incorrect', function () {
          test('it should display a generic error message', async function (assert) {
            // given
            const session = server.create('session-enrolment', {
              certificationCenterId: allowedCertificationCenterAccess.id,
            });
            server.create('session-management', {
              id: session.id,
            });
            server.createList('country', 2, { code: '99100' });

            this.server.post(
              '/sessions/:id/certification-candidates',
              () => ({
                errors: [
                  {
                    status: '400',
                    title: 'Bad Request',
                    detail: '"data.attributes.first-name" must be a number',
                  },
                ],
              }),
              400,
            );

            // when
            const screen = await visit(`/sessions/${session.id}/candidats`);
            await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
            await screen.findByRole('dialog');
            await _fillFormWithCorrectData(screen);
            await click(screen.getByRole('button', { name: 'Inscrire le candidat' }));
            await settled();

            // then
            assert
              .dom(
                screen.getByText(
                  'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.',
                ),
              )
              .exists();
          });

          module('when candidate information in form data are invalid', function () {
            test('it should display a specific error message', async function (assert) {
              // given
              const session = server.create('session-enrolment', {
                certificationCenterId: allowedCertificationCenterAccess.id,
              });
              server.create('session-management', {
                id: session.id,
              });
              server.createList('country', 2, { code: '99100' });

              this.server.post(
                '/sessions/:id/certification-candidates',
                () => ({
                  errors: [
                    {
                      status: '422',
                      detail: 'An error message',
                      code: 'CANDIDATE_BIRTH_POSTAL_CODE_CITY_NOT_VALID',
                      meta: {
                        birthPostalCode: 12345,
                        birthCity: 'Gotham City',
                      },
                    },
                  ],
                }),
                400,
              );

              // when
              const screen = await visit(`/sessions/${session.id}/candidats`);
              await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
              await screen.findByRole('dialog');
              await _fillFormWithCorrectData(screen);
              await click(screen.getByRole('button', { name: 'Inscrire le candidat' }));

              // then
              assert
                .dom(screen.getByText('Le code postal "12345" ne correspond pas à la ville "Gotham City"'))
                .exists();
            });
          });
        });

        module('when candidate data is valid', function (hooks) {
          hooks.beforeEach(async function () {
            server.createList('country', 2, { code: '99100' });
            session = server.create('session-enrolment', {
              certificationCenterId: allowedCertificationCenterAccess.id,
            });
            server.create('session-management', {
              id: session.id,
            });
          });

          test('it should display a success notification', async function (assert) {
            // when
            const screen = await visit(`/sessions/${session.id}/candidats`);
            await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
            await screen.findByRole('dialog');
            await _fillFormWithCorrectData(screen);
            await click(screen.getByRole('button', { name: 'Inscrire le candidat' }));
            await settled();

            // then
            assert.dom(screen.getByText('Le candidat a été inscrit avec succès.')).exists();
          });

          test('it should add a new candidate', async function (assert) {
            // when
            const screen = await visit(`/sessions/${session.id}/candidats`);
            await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
            await screen.findByRole('dialog');
            await _fillFormWithCorrectData(screen);
            await click(screen.getByRole('button', { name: 'Inscrire le candidat' }));
            await settled();

            // then
            const table = screen.getByRole('table', {
              name: 'Liste des candidats inscrits à la session, triée par nom de naissance, avec un lien pour voir les détails du candidat et la possibilité de supprimer un candidat dans la dernière colonne.',
            });
            const rows = await within(table).findAllByRole('row');
            assert.dom(within(rows[1]).getByRole('cell', { name: 'Guybrush' })).exists();
            assert.dom(within(rows[1]).getByRole('cell', { name: 'Threepwood' })).exists();
            assert.dom(within(rows[1]).getByRole('cell', { name: '28/04/2019' })).exists();
            assert.dom(within(rows[1]).getByRole('cell', { name: '20 %' })).exists();
            assert.dom(within(rows[1]).getByRole('cell', { name: 'email.destinataire@example.net' })).exists();
          });

          module('when shouldDisplayPaymentOptions is true', function () {
            test('it should add a new candidate with billing information', async function (assert) {
              // given
              allowedCertificationCenterAccess.update({ type: 'SUP' });

              const screen = await visit(`/sessions/${session.id}/candidats`);
              await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
              await fillIn(screen.getByLabelText('* Prénom'), 'Guybrush');
              await fillIn(screen.getByLabelText('* Nom de naissance'), 'Threepwood');
              await fillIn(screen.getByLabelText('* Date de naissance'), '28/04/2019');
              await click(screen.getByLabelText('Homme'));
              await fillIn(screen.getByLabelText('* Pays de naissance'), '99100');
              await click(screen.getByLabelText('Code INSEE'));
              await fillIn(screen.getByLabelText('Identifiant externe'), '44AA3355');
              await fillIn(screen.getByLabelText('* Code INSEE de naissance'), '75100');
              await click(screen.getByLabelText('* Tarification part Pix'));
              await click(
                await screen.findByRole('option', {
                  name: 'Prépayée',
                }),
              );

              await fillIn(screen.getByLabelText('Code de prépaiement'), '12345');
              await click(screen.getByRole('radio', { name: 'Aucune' }));

              // when
              await click(screen.getByRole('button', { name: 'Inscrire le candidat' }));

              // then
              await click(screen.getByRole('button', { name: 'Voir le détail du candidat Guybrush Threepwood' }));

              const modal = await screen.findByRole('dialog');
              assert.dom(within(modal).getByText('Prépayée')).exists();
              assert.dom(within(modal).getByText('12345')).exists();
            });
          });
        });
      });
    });
  });
  async function _fillFormWithCorrectData(screen) {
    await fillIn(screen.getByRole('textbox', { name: '* Prénom' }), 'Guybrush');
    await fillIn(screen.getByRole('textbox', { name: '* Nom de naissance' }), 'Threepwood');
    await fillIn(screen.getByRole('textbox', { name: '* Date de naissance' }), '28/04/2019');
    await click(screen.getByRole('radio', { name: 'Homme' }));
    await fillIn(screen.getByRole('button', { name: '* Pays de naissance' }), '99100');
    await click(screen.getByRole('radio', { name: 'Code INSEE' }));
    await fillIn(screen.getByRole('textbox', { name: 'Identifiant externe' }), '44AA3355');
    await fillIn(screen.getByRole('textbox', { name: '* Code INSEE de naissance' }), '75100');
    await fillIn(screen.getByRole('textbox', { name: 'Temps majoré (%)' }), '20');
    await click(screen.getByRole('button', { name: '* Tarification part Pix' }));
    await click(
      await screen.findByRole('option', {
        name: 'Gratuite',
      }),
    );
    await fillIn(
      screen.getByRole('textbox', { name: 'E-mail du destinataire des résultats (formateur, enseignant...)' }),
      'email.destinataire@example.net',
    );
    await fillIn(screen.getByRole('textbox', { name: 'E-mail de convocation' }), 'email.convocation@example.net');
    await click(screen.getByRole('radio', { name: 'Aucune' }));
  }
});
/* eslint-enable ember/no-settled-after-test-helper */
