import { beforeEach, describe, it } from 'mocha';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateByEmail } from '../helpers/authentication';
import visit from '../helpers/visit';
import { expect } from 'chai';
import { click, find, triggerEvent } from '@ember/test-helpers';

describe('Acceptance | Displaying a challenge of any type', () => {
  setupApplicationTest();
  setupMirage();

  let assessment;

  [
    { challengeType: 'QROC' },
  ].forEach(function(data) {
    describe(`when ${data.challengeType} challenge is focused`, () => {

      describe('when user has not seen the challenge tooltip yet', function() {
        beforeEach(async () => {
          const user = server.create('user', 'withEmail', {
            hasSeenFocusedChallengeTooltip: false,
          });
          await authenticateByEmail(user);
        });

        it('should display an overlay and tooltip', async () => {
          // given
          assessment = server.create('assessment', 'ofCompetenceEvaluationType');
          server.create('challenge', 'forCompetenceEvaluation', data.challengeType, 'withFocused');

          // when
          await visit(`/assessments/${assessment.id}/challenges/0`);

          // then
          expect(find('.assessment-challenge__focused-overlay')).to.exist;
          expect(find('.tooltip-tag__information')).to.exist;
        });

        it('should disable input and buttons', async () => {
          // given
          assessment = server.create('assessment', 'ofCompetenceEvaluationType');
          server.create('challenge', 'forCompetenceEvaluation', data.challengeType, 'withFocused');

          // when
          await visit(`/assessments/${assessment.id}/challenges/0`);

          // then
          expect(find('.challenge-actions__action-skip').getAttribute('disabled')).to.exist;
          expect(find('.challenge-actions__action-validate').getAttribute('disabled')).to.exist;
          expect(find('.challenge-response__proposal').getAttribute('disabled')).to.exist;
        });

        it('should not display an info alert with dashed border and overlay', async function() {
          // given
          assessment = server.create('assessment', 'ofCompetenceEvaluationType');
          server.create('challenge', 'forCompetenceEvaluation', data.challengeType, 'withFocused');

          // when
          await visit(`/assessments/${assessment.id}/challenges/0`);
          const challengeItem = find('.challenge-item');
          await triggerEvent(challengeItem, 'mouseleave');

          // then
          expect(find('.challenge-item__info-alert')).to.not.exist;
          expect(find('.challenge-item__container--focused')).to.not.exist;
          expect(find('.assessment-challenge__focused-out-overlay')).to.not.exist;
        });

        describe('when user closes tooltip', () => {
          beforeEach(async function() {
            // given
            assessment = server.create('assessment', 'ofCompetenceEvaluationType');
            server.create('challenge', 'forCompetenceEvaluation', data.challengeType, 'withFocused');

            // when
            await visit(`/assessments/${assessment.id}/challenges/0`);
            await click('.tooltip-tag-information__button');
          });

          it('should hide an overlay and tooltip', async () => {
            // then
            expect(find('.assessment-challenge__focused-overlay')).to.not.exist;
            expect(find('#challenge-statement-tag--tooltip')).to.not.exist;
          });

          it('should enable input and buttons', async () => {
            // then
            expect(find('.challenge-actions__action-skip').getAttribute('disabled')).to.not.exist;
            expect(find('.challenge-actions__action-validate').getAttribute('disabled')).to.not.exist;
            expect(find('.challenge-response__proposal').getAttribute('disabled')).to.not.exist;
          });

          it('should display a warning alert', async function() {
            // when
            await triggerEvent(window, 'blur');

            // then
            expect(find('.challenge-actions__focused-out-of-window')).to.exist;
          });

          it('should display an info alert with dashed border and overlay', async function() {
            // when
            const challengeItem = find('.challenge-item');
            await triggerEvent(challengeItem, 'mouseleave');

            // then
            expect(find('.challenge-item__info-alert')).to.exist;
            expect(find('.challenge-item__container--focused')).to.exist;
            expect(find('.assessment-challenge__focused-out-overlay')).to.exist;
          });

          it('should display only the warning alert when it has been triggered', async function() {
            // given
            const challengeItem = find('.challenge-item');
            await triggerEvent(challengeItem, 'mouseleave');

            expect(find('.challenge-item__info-alert')).to.exist;
            expect(find('.challenge-item__container--focused')).to.exist;
            expect(find('.assessment-challenge__focused-out-overlay')).to.exist;

            // when
            await triggerEvent(window, 'blur');

            // then
            expect(find('.challenge-item__info-alert')).to.not.exist;
            expect(find('.challenge-actions__focused-out-of-window')).to.exist;
            expect(find('.challenge-item__container--focused')).to.exist;
            expect(find('.assessment-challenge__focused-out-overlay')).to.exist;
          });
        });
      });

      describe('when user has already seen challenge tooltip', () => {
        beforeEach(async () => {
          const user = server.create('user', 'withEmail', {
            hasSeenFocusedChallengeTooltip: true,
          });
          await authenticateByEmail(user);

          assessment = server.create('assessment', 'ofCompetenceEvaluationType');
          server.create('challenge', 'forCompetenceEvaluation', data.challengeType, 'withFocused');

          await visit(`/assessments/${assessment.id}/challenges/0`);
        });

        it('should hide the overlay and tooltip', async () => {
          // then
          expect(find('.assessment-challenge__focused-overlay')).to.not.exist;
          expect(find('#challenge-statement-tag--tooltip')).to.not.exist;
        });

        it('should enable input and buttons', async () => {
          // then
          expect(find('.challenge-actions__action-skip').getAttribute('disabled')).to.not.exist;
          expect(find('.challenge-actions__action-validate').getAttribute('disabled')).to.not.exist;
          expect(find('.challenge-response__proposal').getAttribute('disabled')).to.not.exist;
        });
      });
    });

    describe(`when ${data.challengeType} challenge is not focused`, () => {
      it('should not display an overlay nor a tooltip', async () => {
        // given
        assessment = server.create('assessment', 'ofCompetenceEvaluationType');
        server.create('challenge', 'forCompetenceEvaluation', data.challengeType);

        // when
        await visit(`/assessments/${assessment.id}/challenges/0`);

        // then
        expect(find('.assessment-challenge__focused-overlay')).to.not.exist;
        expect(find('#challenge-statement-tag--tooltip')).to.not.exist;
      });

      describe('when user has focused out of document', function() {
        beforeEach(async function() {
          // given
          const user = server.create('user', 'withEmail');
          await authenticateByEmail(user);
          assessment = server.create('assessment', 'ofCompetenceEvaluationType');
          server.create('challenge', 'forCompetenceEvaluation', data.challengeType);

          // when
          await visit(`/assessments/${assessment.id}/challenges/0`);
        });

        it('should not display instructions', async function() {
          // then
          expect(find('.focused-challenge-instructions-action__confirmation-button')).to.not.exist;
        });

        it('should not display a warning alert', async function() {
          // when
          await triggerEvent(window, 'blur');
          // then
          expect(find('.challenge-actions__focused-out-of-window')).to.not.exist;
        });
      });
    });
  });
});
