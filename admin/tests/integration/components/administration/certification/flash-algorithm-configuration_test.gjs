import { render } from '@1024pix/ember-testing-library';
import FlashAlgorithmConfiguration from 'pix-admin/components/administration/certification/flash-algorithm-configuration';
import { module, test } from 'qunit';

import setupIntlRenderingTest, { t } from '../../../../helpers/setup-intl-rendering';

module('Integration | Component |  administration/certification/flash-algorithm-configuration', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display all details', async function (assert) {
    // given
    const flashAlgorithmConfiguration = {
      maximumAssessmentLength: 1,
      warmUpLength: 2,
      challengesBetweenSameCompetence: 3,
      variationPercent: 4,
      variationPercentUntil: 5,
      doubleMeasuresUntil: 6,
      limitToOneQuestionPerTube: true,
      enablePassageByAllCompetences: false,
    };

    // when
    const screen = await render(
      <template><FlashAlgorithmConfiguration @model={{flashAlgorithmConfiguration}} /></template>,
    );

    // then
    const maximumAssessmentLength = await screen.getByRole('spinbutton', {
      name: t('pages.administration.certification.flash-algorithm-configuration.form.maximumAssessmentLength'),
    }).value;
    const warmUpLength = await screen.getByRole('spinbutton', {
      name: t('pages.administration.certification.flash-algorithm-configuration.form.warmUpLength'),
    }).value;
    const challengesBetweenSameCompetence = await screen.getByRole('spinbutton', {
      name: t('pages.administration.certification.flash-algorithm-configuration.form.challengesBetweenSameCompetence'),
    }).value;
    const variationPercent = await screen.getByRole('spinbutton', {
      name: t('pages.administration.certification.flash-algorithm-configuration.form.variationPercent'),
    }).value;
    const variationPercentUntil = await screen.getByRole('spinbutton', {
      name: t('pages.administration.certification.flash-algorithm-configuration.form.variationPercentUntil'),
    }).value;
    const doubleMeasuresUntil = await screen.getByRole('spinbutton', {
      name: t('pages.administration.certification.flash-algorithm-configuration.form.doubleMeasuresUntil'),
    }).value;
    const limitToOneQuestionPerTube = await screen.getByRole('checkbox', {
      name: t('pages.administration.certification.flash-algorithm-configuration.form.limitToOneQuestionPerTube'),
    }).checked;
    const enablePassageByAllCompetences = await screen.getByRole('checkbox', {
      name: t('pages.administration.certification.flash-algorithm-configuration.form.enablePassageByAllCompetences'),
    }).checked;

    assert.strictEqual(maximumAssessmentLength, '1');
    assert.strictEqual(warmUpLength, '2');
    assert.strictEqual(challengesBetweenSameCompetence, '3');
    assert.strictEqual(variationPercent, '4');
    assert.strictEqual(variationPercentUntil, '5');
    assert.strictEqual(doubleMeasuresUntil, '6');
    assert.true(limitToOneQuestionPerTube);
    assert.false(enablePassageByAllCompetences);
  });
});
