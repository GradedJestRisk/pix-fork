import { FlashAssessmentAlgorithm } from '../../../../../../src/certification/flash-certification/domain/models/FlashAssessmentAlgorithm.js';
import { FlashAssessmentSuccessRateHandler } from '../../../../../../src/certification/flash-certification/domain/models/FlashAssessmentSuccessRateHandler.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../../../../../src/certification/shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { config } from '../../../../../../src/shared/config.js';
import { catchErrSync, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

const baseFlashAssessmentAlgorithmConfig = {
  warmUpLength: 0,
  forcedCompetences: [],
  minimumEstimatedSuccessRateRanges: [],
  limitToOneQuestionPerTube: false,
  enablePassageByAllCompetences: false,
};

describe('Unit | Domain | Models | FlashAssessmentAlgorithm | FlashAssessmentAlgorithm', function () {
  let flashAlgorithmImplementation;

  const baseGetNextChallengeOptions = {
    challengesBetweenSameCompetence: 2,
    minimalSuccessRate: 0,
  };

  beforeEach(function () {
    flashAlgorithmImplementation = {
      getPossibleNextChallenges: sinon.stub(),
      getCapacityAndErrorRate: sinon.stub(),
    };
  });

  describe('#getPossibleNextChallenges', function () {
    context('when user has answered more questions than allowed', function () {
      it('should throw a RangeError', function () {
        // given
        const assessmentAnswers = [domainBuilder.buildAnswer({ id: 1 }), domainBuilder.buildAnswer({ id: 2 })];
        const skill1 = domainBuilder.buildSkill({ id: 1 });
        const skill2 = domainBuilder.buildSkill({ id: 2 });
        const challenges = [
          domainBuilder.buildChallenge({ id: assessmentAnswers[0].challengeId, skill: skill1 }),
          domainBuilder.buildChallenge({ competenceId: 'comp2', skill: skill2 }),
        ];
        const capacity = 0;
        const algorithm = new FlashAssessmentAlgorithm({
          flashAlgorithmImplementation,
          configuration: _getAlgorithmConfig({
            maximumAssessmentLength: 1,
          }),
        });

        // when
        const error = catchErrSync(({ assessmentAnswers, challenges, capacity }) =>
          algorithm.getPossibleNextChallenges({
            assessmentAnswers,
            challenges,
            capacity,
          }),
        )({
          assessmentAnswers,
          challenges,
          capacity,
        });

        // then
        expect(error).to.be.instanceOf(RangeError);
        expect(error.message).to.equal('User answered more questions than allowed');
      });
    });

    context('when user has answered to the maximun number of questions', function () {
      it('should throw an AssessmentEndedError', function () {
        // then
        const assessmentAnswers = [domainBuilder.buildAnswer({ id: 1 }), domainBuilder.buildAnswer({ id: 2 })];
        const skill1 = domainBuilder.buildSkill({ id: 1 });
        const skill2 = domainBuilder.buildSkill({ id: 2 });
        const challenges = [
          domainBuilder.buildChallenge({ id: assessmentAnswers[0].challengeId, skill: skill1 }),
          domainBuilder.buildChallenge({ competenceId: 'comp2', skill: skill2 }),
        ];
        const capacity = 0;
        const algorithm = new FlashAssessmentAlgorithm({
          flashAlgorithmImplementation,
          configuration: _getAlgorithmConfig({
            maximumAssessmentLength: 2,
          }),
        });

        // when
        const nextChallenges = algorithm.getPossibleNextChallenges({
          assessmentAnswers,
          challenges,
          capacity,
        });

        expect(nextChallenges).to.have.lengthOf(0);
      });
    });

    context('when there are challenges left to answer', function () {
      context('with limitToOneQuestionPerTube=true', function () {
        it('should limit to one challenge', function () {
          const alreadyAnsweredChallengesCount = 10;
          const remainingAnswersToGive = 1;
          const initialCapacity = config.v3Certification.defaultCandidateCapacity;
          const computedCapacity = 2;
          config.features.numberOfChallengesForFlashMethod = 20;
          const algorithm = new FlashAssessmentAlgorithm({
            flashAlgorithmImplementation,
            configuration: _getAlgorithmConfig({
              maximumAssessmentLength: alreadyAnsweredChallengesCount + remainingAnswersToGive,
              limitToOneQuestionPerTube: true,
            }),
          });

          const skill1Tube1 = domainBuilder.buildSkill({
            tubeId: 'tube1',
          });
          const skill2Tube1 = domainBuilder.buildSkill({
            tubeId: 'tube1',
          });
          const skillTube2 = domainBuilder.buildSkill({
            tubeId: 'tube2',
          });

          const answeredChallengeTube1 = domainBuilder.buildChallenge({
            id: 'answeredChallengeTube1',
            skill: skill1Tube1,
          });

          const unansweredChallengeTube1 = domainBuilder.buildChallenge({
            id: 'unansweredChallengeTube1',
            skill: skill2Tube1,
          });

          const unansweredChallengeTube2 = domainBuilder.buildChallenge({
            id: 'unansweredChallengeTube2',
            skill: skillTube2,
          });

          const assessmentAnswers = [
            domainBuilder.buildAnswer({
              challengeId: answeredChallengeTube1.id,
            }),
          ];

          const challenges = [answeredChallengeTube1, unansweredChallengeTube1, unansweredChallengeTube2];

          flashAlgorithmImplementation.getCapacityAndErrorRate
            .withArgs(
              _getCapacityAndErrorRateParams({
                allAnswers: assessmentAnswers,
                challenges,
                capacity: initialCapacity,
              }),
            )
            .returns({
              capacity: computedCapacity,
            });

          const expectedChallenges = [unansweredChallengeTube2];
          flashAlgorithmImplementation.getPossibleNextChallenges
            .withArgs({
              availableChallenges: expectedChallenges,
              capacity: computedCapacity,
              options: baseGetNextChallengeOptions,
            })
            .returns(expectedChallenges);

          expect(algorithm.getPossibleNextChallenges({ assessmentAnswers, challenges })).to.deep.equal(
            expectedChallenges,
          );
        });
      });

      context('with limitToOneQuestionPerTube=false', function () {
        it('should return challenges with non answered skills', function () {
          const alreadyAnsweredChallengesCount = 10;
          const remainingAnswersToGive = 1;
          const initialCapacity = config.v3Certification.defaultCandidateCapacity;
          const computedCapacity = 2;
          config.features.numberOfChallengesForFlashMethod = 20;
          const algorithm = new FlashAssessmentAlgorithm({
            flashAlgorithmImplementation,
            configuration: _getAlgorithmConfig({
              maximumAssessmentLength: alreadyAnsweredChallengesCount + remainingAnswersToGive,
            }),
          });

          const skill1Tube1 = domainBuilder.buildSkill({
            id: 'skill1',
            tubeId: 'tube1',
          });
          const skill2Tube1 = domainBuilder.buildSkill({
            id: 'skill2',
            tubeId: 'tube1',
          });
          const skillTube2 = domainBuilder.buildSkill({
            id: 'skill3',
            tubeId: 'tube2',
          });

          const answeredChallengeTube1 = domainBuilder.buildChallenge({
            id: 'answeredChallengeTube1',
            skill: skill1Tube1,
          });

          const unansweredChallengeTube1 = domainBuilder.buildChallenge({
            id: 'unansweredChallengeTube1',
            skill: skill2Tube1,
          });

          const unansweredChallengeTube2 = domainBuilder.buildChallenge({
            id: 'unansweredChallengeTube2',
            skill: skillTube2,
          });

          const assessmentAnswers = [
            domainBuilder.buildAnswer({
              challengeId: answeredChallengeTube1.id,
            }),
          ];

          const challenges = [answeredChallengeTube1, unansweredChallengeTube1, unansweredChallengeTube2];

          flashAlgorithmImplementation.getCapacityAndErrorRate
            .withArgs(
              _getCapacityAndErrorRateParams({
                allAnswers: assessmentAnswers,
                challenges,
                capacity: initialCapacity,
              }),
            )
            .returns({
              capacity: computedCapacity,
            });

          const expectedChallenges = [unansweredChallengeTube1, unansweredChallengeTube2];
          flashAlgorithmImplementation.getPossibleNextChallenges
            .withArgs({
              availableChallenges: expectedChallenges,
              capacity: computedCapacity,
              options: baseGetNextChallengeOptions,
            })
            .returns(expectedChallenges);

          expect(algorithm.getPossibleNextChallenges({ assessmentAnswers, challenges })).to.deep.equal(
            expectedChallenges,
          );
        });
      });
    });

    context('when settings specific answers for computing estimated level', function () {
      it('should choose a challenge that has the required success rate first', function () {
        // Given
        const easyDifficulty = -3;
        const hardDifficulty = 3;
        const discriminant = 1;
        const initialCapacity = 3;

        const easyChallenge = domainBuilder.buildChallenge({
          id: 'easyChallenge',
          skill: domainBuilder.buildSkill({
            id: 'skillEasy',
          }),
          competenceId: 'compEasy',
          discriminant,
          difficulty: easyDifficulty,
        });

        const hardChallenge = domainBuilder.buildChallenge({
          id: 'hardChallenge',
          skill: domainBuilder.buildSkill({
            id: 'skillHard',
          }),
          competenceId: 'compHard',
          discriminant,
          difficulty: hardDifficulty,
        });

        const answer1 = domainBuilder.buildAnswer({
          challengeId: easyChallenge.id,
        });

        const challenges = [hardChallenge, easyChallenge];
        const assessmentAnswers = [answer1];
        const answersForComputingCapacity = [];

        // when
        const algorithm = new FlashAssessmentAlgorithm({
          flashAlgorithmImplementation,
          configuration: _getAlgorithmConfig(),
        });

        flashAlgorithmImplementation.getCapacityAndErrorRate
          .withArgs(
            _getCapacityAndErrorRateParams({
              allAnswers: answersForComputingCapacity,
              challenges,
              capacity: initialCapacity,
            }),
          )
          .returns({
            capacity: 0,
          });

        flashAlgorithmImplementation.getPossibleNextChallenges
          .withArgs({
            availableChallenges: [hardChallenge],
            capacity: 0,
            options: {
              ...baseGetNextChallengeOptions,
            },
          })
          .returns([hardChallenge]);

        const nextChallenges = algorithm.getPossibleNextChallenges({
          assessmentAnswers,
          challenges,
          initialCapacity,
          answersForComputingCapacity,
        });

        expect(nextChallenges).to.deep.equal([hardChallenge]);
      });
    });

    context('when specifying a minimal success rate', function () {
      context('when a fixed minimal success rate has been set', function () {
        it('should choose a challenge that has the required success rate first', function () {
          // Given
          const easyDifficulty = -3;
          const hardDifficulty = 3;
          const discriminant = 1;
          const initialCapacity = 3;

          const easyChallenge = domainBuilder.buildChallenge({
            id: 'easyChallenge',
            skill: domainBuilder.buildSkill({
              id: 'skillEasy',
            }),
            competenceId: 'compEasy',
            discriminant,
            difficulty: easyDifficulty,
          });

          const hardChallenge = domainBuilder.buildChallenge({
            id: 'hardChallenge',
            skill: domainBuilder.buildSkill({
              id: 'skillHard',
            }),
            competenceId: 'compHard',
            discriminant,
            difficulty: hardDifficulty,
          });

          const challenges = [hardChallenge, easyChallenge];
          const assessmentAnswers = [];

          // when
          const algorithm = new FlashAssessmentAlgorithm({
            flashAlgorithmImplementation,
            configuration: _getAlgorithmConfig({
              limitToOneQuestionPerTube: true,
              minimumEstimatedSuccessRateRanges: [
                FlashAssessmentSuccessRateHandler.create({
                  startingChallengeIndex: 0,
                  endingChallengeIndex: 1,
                  value: 0.8,
                }),
              ],
            }),
          });

          flashAlgorithmImplementation.getCapacityAndErrorRate.returns({
            capacity: 0,
          });
          flashAlgorithmImplementation.getPossibleNextChallenges
            .withArgs({
              availableChallenges: challenges,
              capacity: 0,
              options: {
                ...baseGetNextChallengeOptions,
                minimalSuccessRate: 0.8,
              },
            })
            .returns([easyChallenge, hardChallenge]);

          const nextChallenges = algorithm.getPossibleNextChallenges({
            assessmentAnswers,
            challenges,
            initialCapacity,
          });

          expect(nextChallenges).to.deep.equal([easyChallenge, hardChallenge]);
        });
      });
    });
  });
});

const _getAlgorithmConfig = (options) => {
  return new FlashAssessmentAlgorithmConfiguration({
    ...baseFlashAssessmentAlgorithmConfig,
    ...options,
  });
};

const _getCapacityAndErrorRateParams = (params) => ({
  variationPercent: undefined,
  variationPercentUntil: undefined,
  doubleMeasuresUntil: undefined,
  ...params,
});
