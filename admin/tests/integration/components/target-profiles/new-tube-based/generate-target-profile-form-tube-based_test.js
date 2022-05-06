import { module, test } from 'qunit';
import { render, clickByName } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import { setupRenderingTest } from 'ember-qunit';

module('Integration | Component | targetProfiles::NewTubeBased::GenerateTargetProfileFormTubeBased', function (hooks) {
  setupRenderingTest(hooks);
  let frameworks;

  hooks.beforeEach(() => {
    const tubes1 = [
      {
        id: 'tubeId1',
        practicalTitle: 'Tube 1',
        practicalDescription: 'Description 1',
      },
      {
        id: 'tubeId2',
        practicalTitle: 'Tube 2',
        practicalDescription: 'Description 2',
      },
    ];

    const tubes2 = [
      {
        id: 'tubeId3',
        practicalTitle: 'Tube 3',
        practicalDescription: 'Description 3',
      },
    ];

    const thematics = [
      { id: 'thematicId1', name: 'Thématique 1', tubes: tubes1 },
      { id: 'thematicId2', name: 'Thématique 2', tubes: tubes2 },
    ];

    const competences = [
      {
        id: 'competenceId',
        index: '1',
        name: 'Titre competence',
        get sortedThematics() {
          return thematics;
        },
        thematics,
      },
    ];

    const areas = [
      {
        title: 'Titre domaine',
        code: 1,
        get sortedCompetences() {
          return competences;
        },
      },
    ];

    frameworks = [{ id: 'frameworkId', name: 'Pix', areas }];
  });

  test('it should display a list of tubes', async function (assert) {
    // given
    this.set('frameworks', frameworks);

    // when
    const screen = await render(
      hbs`<TargetProfiles::NewTubeBased::GenerateTargetProfileFormTubeBased @frameworks={{this.frameworks}} />`
    );
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');

    // then
    assert.dom(screen.getByText('Tube 1 : Description 1')).exists();
    assert.dom(screen.getByText('Tube 2 : Description 2')).exists();
    assert.dom(screen.getByText('Tube 3 : Description 3')).exists();
  });

  test('it should check the tubes if selected', async function (assert) {
    // given
    this.set('frameworks', frameworks);

    // when
    const screen = await render(
      hbs`<TargetProfiles::NewTubeBased::GenerateTargetProfileFormTubeBased @frameworks={{this.frameworks}} />`
    );

    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Tube 1 : Description 1');

    // then
    assert.dom(screen.getByLabelText('Tube 1 : Description 1')).isChecked();
  });

  test('it should check all tubes corresponding to the thematics if a thematic is selected', async function (assert) {
    // given
    this.set('frameworks', frameworks);

    // when
    const screen = await render(
      hbs`<TargetProfiles::NewTubeBased::GenerateTargetProfileFormTubeBased @frameworks={{this.frameworks}} />`
    );
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Thématique 1');

    // then
    assert.dom(screen.getByLabelText('Tube 1 : Description 1')).isChecked();
    assert.dom(screen.getByLabelText('Tube 2 : Description 2')).isChecked();
    assert.dom(screen.getByLabelText('Thématiques')).isNotChecked();
    assert.dom(screen.getByLabelText('Thématiques')).hasProperty('indeterminate', true);
  });

  test('it should check the thematic if all corresponding tubes are selected', async function (assert) {
    // given
    this.set('frameworks', frameworks);

    // when
    const screen = await render(
      hbs`<TargetProfiles::NewTubeBased::GenerateTargetProfileFormTubeBased @frameworks={{this.frameworks}} />`
    );
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Tube 1 : Description 1');
    await clickByName('Tube 2 : Description 2');

    // then
    assert.dom(screen.getByLabelText('Thématique 1')).isChecked();
    assert.dom(screen.getByLabelText('Thématiques')).isNotChecked();
    assert.dom(screen.getByLabelText('Thématiques')).hasProperty('indeterminate', true);
  });

  test('it should indeterminate the thematic if not all of corresponding tubes are selected', async function (assert) {
    // given
    this.set('frameworks', frameworks);

    // when
    const screen = await render(
      hbs`<TargetProfiles::NewTubeBased::GenerateTargetProfileFormTubeBased @frameworks={{this.frameworks}} />`
    );
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Tube 1 : Description 1');

    // then
    assert.dom(screen.getByLabelText('Thématique 1')).isNotChecked();
    assert.dom(screen.getByLabelText('Thématique 1')).hasProperty('indeterminate', true);
    assert.dom(screen.getByLabelText('Thématiques')).isNotChecked();
    assert.dom(screen.getByLabelText('Thématiques')).hasProperty('indeterminate', true);
  });

  test('it should check the competence if all corresponding thematics are selected', async function (assert) {
    // given
    this.set('frameworks', frameworks);

    // when
    const screen = await render(
      hbs`<TargetProfiles::NewTubeBased::GenerateTargetProfileFormTubeBased @frameworks={{this.frameworks}} />`
    );
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Thématique 1');
    await clickByName('Thématique 2');

    // then
    assert.dom(screen.getByLabelText('Thématiques')).isChecked();
  });

  test('it should check the thematics and tubes if competence is selected', async function (assert) {
    // given
    this.set('frameworks', frameworks);

    // when
    const screen = await render(
      hbs`<TargetProfiles::NewTubeBased::GenerateTargetProfileFormTubeBased @frameworks={{this.frameworks}} />`
    );
    await clickByName('1 · Titre domaine');
    await clickByName('1 Titre competence');
    await clickByName('Thématiques');

    // then
    assert.dom(screen.getByLabelText('Thématique 1')).isChecked();
    assert.dom(screen.getByLabelText('Thématique 1')).hasProperty('indeterminate', false);

    assert.dom(screen.getByLabelText('Thématique 2')).isChecked();
    assert.dom(screen.getByLabelText('Thématique 2')).hasProperty('indeterminate', false);

    assert.dom(screen.getByLabelText('Tube 1 : Description 1')).isChecked();
    assert.dom(screen.getByLabelText('Tube 2 : Description 2')).isChecked();
    assert.dom(screen.getByLabelText('Tube 3 : Description 3')).isChecked();
  });

  test('it should display a return button', async function (assert) {
    // given
    this.set('frameworks', frameworks);

    // when
    const screen = await render(
      hbs`<TargetProfiles::NewTubeBased::GenerateTargetProfileFormTubeBased @frameworks={{this.frameworks}} />`
    );

    // then
    assert.dom(screen.getByRole('button', { name: 'Retour' })).exists();
  });

  test('it should display a download target profile button', async function (assert) {
    // given
    this.set('frameworks', frameworks);

    // when
    const screen = await render(
      hbs`<TargetProfiles::NewTubeBased::GenerateTargetProfileFormTubeBased @frameworks={{this.frameworks}} />`
    );

    // then
    assert.dom(screen.getByRole('button', { name: 'Télécharger la sélection des sujets (JSON)' })).exists();
  });
});
