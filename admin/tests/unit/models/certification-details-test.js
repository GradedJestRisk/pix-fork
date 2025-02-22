import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | certification details', function (hooks) {
  setupTest(hooks);

  module('#get answers', function () {
    test('it returns answers with order property', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const listChallengesAndAnswers = [{ id: 'answerId1' }, { id: 'answerId2' }, { id: 'answerId3' }];

      // when
      const certification = store.createRecord('certification-details', {
        listChallengesAndAnswers,
      });

      // then
      assert.deepEqual(certification.answers, [
        { id: 'answerId1', order: 1 },
        { id: 'answerId2', order: 2 },
        { id: 'answerId3', order: 3 },
      ]);
    });
  });

  module('#get competences', function () {
    module('when there are Pix+ competences', function () {
      test('returns all competences with Pix+ competences included', function (assert) {
        // given
        const PIX_PLUS_INDEX = '';
        const store = this.owner.lookup('service:store');
        const listChallengesAndAnswers = [
          { id: 'answerIdPix+1', competence: PIX_PLUS_INDEX },
          { id: 'answerIdPix+2', competence: PIX_PLUS_INDEX },
          { id: 'answerId2', competence: '1.1' },
          { id: 'answerId3', competence: '1.2' },
        ];
        const competencesWithMark = [{ index: '1.1' }, { index: '1.2' }];

        // when
        const certification = store.createRecord('certification-details', {
          listChallengesAndAnswers,
          competencesWithMark,
        });

        // then
        assert.deepEqual(certification.competences, [
          {
            index: PIX_PLUS_INDEX,
            name: 'Pix +',
            answers: [
              { id: 'answerIdPix+1', competence: '', order: 1 },
              { id: 'answerIdPix+2', competence: '', order: 2 },
            ],
          },
          {
            index: '1.1',
            answers: [{ id: 'answerId2', competence: '1.1', order: 3 }],
          },
          { index: '1.2', answers: [{ id: 'answerId3', competence: '1.2', order: 4 }] },
        ]);
      });
    });

    module('when there are only Pix core competences', function () {
      test('returns competences', function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const listChallengesAndAnswers = [
          { id: 'answerId1', competence: '1.1' },
          { id: 'answerId2', competence: '1.1' },
          { id: 'answerId3', competence: '1.2' },
        ];
        const competencesWithMark = [{ index: '1.1' }, { index: '1.2' }];

        // when
        const certification = store.createRecord('certification-details', {
          listChallengesAndAnswers,
          competencesWithMark,
        });

        // then
        assert.deepEqual(certification.competences, [
          {
            index: '1.1',
            answers: [
              { id: 'answerId1', competence: '1.1', order: 1 },
              { id: 'answerId2', competence: '1.1', order: 2 },
            ],
          },
          { index: '1.2', answers: [{ id: 'answerId3', competence: '1.2', order: 3 }] },
        ]);
      });
    });
  });
});
