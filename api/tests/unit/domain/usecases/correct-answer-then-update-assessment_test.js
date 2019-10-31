const { expect, sinon, domainBuilder } = require('../../../test-helper');

const Assessment = require('../../../../lib/domain/models/Assessment');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

const correctAnswerThenUpdateAssessment = require('../../../../lib/domain/usecases/correct-answer-then-update-assessment');

const { ChallengeAlreadyAnsweredError, NotFoundError, ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Use Cases | correct-answer-then-update-assessment', () => {

  const answerRepository = {
    findByChallengeAndAssessment: () => undefined,
    save: () => undefined,
  };
  const assessmentRepository = { get: () => undefined };
  const challengeRepository = { get: () => undefined };
  const competenceEvaluationRepository = { getByAssessmentId: () => undefined };
  const smartPlacementAssessmentRepository = { get: () => undefined };
  const skillRepository = { findByCompetenceId: () => undefined };
  const scorecardService = { computeScorecard: () => undefined };
  const knowledgeElementRepository = {
    save: () => undefined,
    findUniqByUserId: () => undefined,
  };

  beforeEach(() => {
    sinon.stub(answerRepository, 'findByChallengeAndAssessment');
    sinon.stub(answerRepository, 'save');
    sinon.stub(assessmentRepository, 'get');
    sinon.stub(challengeRepository, 'get');
    sinon.stub(competenceEvaluationRepository, 'getByAssessmentId');
    sinon.stub(skillRepository, 'findByCompetenceId');
    sinon.stub(smartPlacementAssessmentRepository, 'get');
    sinon.stub(scorecardService, 'computeScorecard');
    sinon.stub(knowledgeElementRepository, 'save');
    sinon.stub(knowledgeElementRepository, 'findUniqByUserId');
    sinon.stub(KnowledgeElement, 'createKnowledgeElementsForAnswer');
  });
  const userId = 1;

  context('when an answer for that challenge and that assessment already exists', () => {

    let answer;
    let result;

    beforeEach(() => {
      // given
      answer = domainBuilder.buildAnswer();
      answerRepository.findByChallengeAndAssessment.resolves(true);
      assessmentRepository.get.resolves({ userId });

      // when
      result = correctAnswerThenUpdateAssessment({
        answer,
        userId,
        answerRepository,
        assessmentRepository,
        challengeRepository,
        smartPlacementAssessmentRepository,
        knowledgeElementRepository,
        scorecardService,
      });
    });

    it('should call the answer repository to check if challenge has already been answered', () => {
      // then
      const expectedArguments = {
        assessmentId: answer.assessmentId,
        challengeId: answer.challengeId,
      };
      return result.catch((error) => error)
        .then(() => {
          return expect(answerRepository.findByChallengeAndAssessment).to.have.been.calledWith(expectedArguments);
        });
    });
    it('should fail because Challenge Already Answered', () => {
      // then
      return expect(result).to.be.rejectedWith(ChallengeAlreadyAnsweredError);
    });
  });

  context('when no answer already exists', () => {

    context('and assessment is a COMPETENCE_EVALUATION', () => {

      let answer;
      let assessment;
      let challenge;
      let competenceEvaluation;
      let knowledgeElement;
      let firstCreatedKnowledgeElement;
      let secondCreatedKnowledgeElement;
      let skills;
      let completedAnswer;
      let correctAnswerValue;
      let savedAnswer;
      let solution;
      let validator;
      let scorecard;

      beforeEach(() => {
        // given
        correctAnswerValue = '1';

        answer = domainBuilder.buildAnswer({ value: correctAnswerValue });
        answer.id = undefined;
        answer.result = undefined;
        answer.resultDetails = undefined;

        solution = domainBuilder.buildSolution({ id: answer.challengeId, value: correctAnswerValue });
        validator = domainBuilder.buildValidator.ofTypeQCU({ solution });
        challenge = domainBuilder.buildChallenge({ id: answer.challengeId, validator });
        assessment = domainBuilder.buildAssessment({ userId, type: Assessment.types.COMPETENCE_EVALUATION });
        competenceEvaluation = domainBuilder.buildCompetenceEvaluation();
        knowledgeElement = domainBuilder.buildKnowledgeElement();
        firstCreatedKnowledgeElement = domainBuilder.buildKnowledgeElement({ earnedPix: 2 });
        secondCreatedKnowledgeElement = domainBuilder.buildKnowledgeElement({ earnedPix: 1 });
        skills = domainBuilder.buildSkillCollection();

        completedAnswer = domainBuilder.buildAnswer(answer);
        completedAnswer.id = undefined;
        completedAnswer.result = AnswerStatus.OK;
        completedAnswer.resultDetails = null;

        savedAnswer = domainBuilder.buildAnswer(completedAnswer);

        scorecard = domainBuilder.buildUserScorecard({ level: 2, earnedPix: 22, exactlyEarnedPix: 22 });
        answerRepository.findByChallengeAndAssessment.resolves(false);
        assessmentRepository.get.resolves(assessment);
        challengeRepository.get.resolves(challenge);
        answerRepository.save.resolves(savedAnswer);
        competenceEvaluationRepository.getByAssessmentId.resolves(competenceEvaluation);
        skillRepository.findByCompetenceId.resolves(skills);
        knowledgeElementRepository.findUniqByUserId.resolves([knowledgeElement]);
        KnowledgeElement.createKnowledgeElementsForAnswer.returns([
          firstCreatedKnowledgeElement, secondCreatedKnowledgeElement,
        ]);
        knowledgeElementRepository.save
          .onFirstCall().resolves(firstCreatedKnowledgeElement)
          .onSecondCall().resolves(secondCreatedKnowledgeElement);
        smartPlacementAssessmentRepository.get.rejects(new NotFoundError());
        scorecardService.computeScorecard.resolves(scorecard);

      });

      it('should call the answer repository to check if challenge has already been answered', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArguments = {
          assessmentId: answer.assessmentId,
          challengeId: answer.challengeId,
        };
        expect(answerRepository.findByChallengeAndAssessment).to.have.been.calledWith(expectedArguments);
      });

      it('should call the answer repository to save the answer', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        expect(answerRepository.save).to.have.been.calledWith(completedAnswer);
      });

      it('should call repositories to get needed information', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        expect(competenceEvaluationRepository.getByAssessmentId).to.have.been.calledWith(assessment.id);
        expect(skillRepository.findByCompetenceId).to.have.been.calledWith(competenceEvaluation.competenceId);
        expect(knowledgeElementRepository.findUniqByUserId).to.have.been.calledWith({ userId: assessment.userId });
      });

      it('should return the saved answer - with the id', async () => {
        // when
        const result = await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArgument = savedAnswer;
        expect(result).to.deep.equal(expectedArgument);
      });

      context('when the user responds correctly', async () => {
        it('should add the level up to the answer when the user gain one level', async () => {
          // given
          const expectedLevel = scorecard.level + 1;
          // when
          const result = await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            answerRepository,
            assessmentRepository,
            challengeRepository,
            competenceEvaluationRepository,
            skillRepository,
            smartPlacementAssessmentRepository,
            knowledgeElementRepository,
            scorecardService,
          });

          // then
          expect(result.levelup).to.deep.equal({
            id: result.id,
            competenceName: scorecard.name,
            level: expectedLevel,
          });
        });

        it('should return an empty levelup when not gaining a level', async () => {
          // given
          knowledgeElementRepository.save
            .onFirstCall().resolves(domainBuilder.buildKnowledgeElement({ earnedPix: 0 }))
            .onSecondCall().resolves(domainBuilder.buildKnowledgeElement({ earnedPix: 0 }));

          // when
          const result = await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            answerRepository,
            assessmentRepository,
            challengeRepository,
            competenceEvaluationRepository,
            skillRepository,
            smartPlacementAssessmentRepository,
            knowledgeElementRepository,
            scorecardService,
          });

          // then
          expect(result.levelup).to.deep.equal({});
        });
      });

      context('when the user responds badly', async () => {
        it('should not compute the level up', async () => {
          // given
          answer = domainBuilder.buildAnswer({ value: '' });
          answer.id = undefined;
          answer.result = undefined;
          answer.resultDetails = undefined;

          // when
          await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            answerRepository,
            assessmentRepository,
            challengeRepository,
            competenceEvaluationRepository,
            skillRepository,
            smartPlacementAssessmentRepository,
            knowledgeElementRepository,
            scorecardService,
          });

          // then
          expect(scorecardService.computeScorecard).to.not.have.been.called;
        });
      });
    });

    context('and assessment is a SMART_PLACEMENT', () => {

      let answer;
      let assessment;
      let smartPlacementAssessment;
      let challenge;
      let completedAnswer;
      let correctAnswerValue;
      let firstKnowledgeElement;
      let savedAnswer;
      let secondKnowledgeElement;
      let solution;
      let validator;
      let scorecard;

      beforeEach(() => {
        // given
        correctAnswerValue = '1';

        answer = domainBuilder.buildAnswer();
        answer.id = undefined;
        answer.result = undefined;
        answer.resultDetails = undefined;

        solution = domainBuilder.buildSolution({ id: answer.challengeId, value: correctAnswerValue });
        validator = domainBuilder.buildValidator.ofTypeQCU({ solution });
        challenge = domainBuilder.buildChallenge({ id: answer.challengeId, validator });

        completedAnswer = domainBuilder.buildAnswer(answer);
        completedAnswer.id = undefined;
        completedAnswer.result = AnswerStatus.OK;
        completedAnswer.resultDetails = null;

        savedAnswer = domainBuilder.buildAnswer(completedAnswer);

        assessment = domainBuilder.buildAssessment({ userId, type: Assessment.types.SMARTPLACEMENT });
        smartPlacementAssessment = domainBuilder.buildSmartPlacementAssessment();
        firstKnowledgeElement = domainBuilder.buildKnowledgeElement({ earnedPix: 2 });
        secondKnowledgeElement = domainBuilder.buildKnowledgeElement({ earnedPix: 1.8 });
        scorecard = domainBuilder.buildUserScorecard({ level: 2, earnedPix: 20, exactlyEarnedPix: 20.2 });

        answerRepository.findByChallengeAndAssessment.resolves(false);
        assessmentRepository.get.resolves(assessment);
        challengeRepository.get.resolves(challenge);
        answerRepository.save.resolves(savedAnswer);
        smartPlacementAssessmentRepository.get.resolves(smartPlacementAssessment);
        KnowledgeElement.createKnowledgeElementsForAnswer.returns([
          firstKnowledgeElement, secondKnowledgeElement,
        ]);
        knowledgeElementRepository.save
          .onFirstCall().resolves(firstKnowledgeElement)
          .onSecondCall().resolves(secondKnowledgeElement);

        scorecardService.computeScorecard.resolves(scorecard);

      });

      it('should call the answer repository to check if challenge has already been answered', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArguments = {
          assessmentId: answer.assessmentId,
          challengeId: answer.challengeId,
        };
        expect(answerRepository.findByChallengeAndAssessment).to.have.been.calledWith(expectedArguments);
      });

      it('should call the answer repository to save the answer', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArgument = completedAnswer;
        expect(answerRepository.save).to.have.been.calledWith(expectedArgument);
      });

      it('should call the smart placement assessment repository to try and get the assessment', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArgument = answer.assessmentId;
        expect(smartPlacementAssessmentRepository.get).to.have.been.calledWith(expectedArgument);
      });

      it('should call the challenge repository to get the answer challenge', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArgument = answer.challengeId;
        expect(challengeRepository.get).to.have.been.calledWith(expectedArgument);
      });

      it('should create the knowledge elements for the answer', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArgument = {
          answer: savedAnswer,
          challenge: challenge,
          previouslyFailedSkills: smartPlacementAssessment.getFailedSkills(),
          previouslyValidatedSkills: smartPlacementAssessment.getValidatedSkills(),
          targetSkills: smartPlacementAssessment.targetProfile.skills,
          userId: smartPlacementAssessment.userId
        };
        expect(KnowledgeElement.createKnowledgeElementsForAnswer).to.have.been.calledWith(expectedArgument);
      });

      it('should save the newly created knowledge elements', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArgs = [
          [firstKnowledgeElement],
          [secondKnowledgeElement],
        ];
        expect(knowledgeElementRepository.save.args).to.deep.equal(expectedArgs);
      });

      it('should return the saved answer - with the id', async () => {
        // when
        const result = await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArgument = savedAnswer;
        expect(result).to.deep.equal(expectedArgument);
      });

      context('when the user responds correctly', async () => {
        it('should add the level up to the answer when the user gain one level', async () => {
          // given
          const expectedLevel = scorecard.level + 1;

          // when
          const result = await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            answerRepository,
            assessmentRepository,
            challengeRepository,
            competenceEvaluationRepository,
            skillRepository,
            smartPlacementAssessmentRepository,
            knowledgeElementRepository,
            scorecardService,
          });

          // then
          expect(result.levelup).to.deep.equal({
            id: result.id,
            competenceName: scorecard.name,
            level: expectedLevel,
          });
        });

        it('should return an empty levelup when not gaining a level', async () => {
          // given
          knowledgeElementRepository.save
            .onFirstCall().resolves(domainBuilder.buildKnowledgeElement({ earnedPix: 0 }))
            .onSecondCall().resolves(domainBuilder.buildKnowledgeElement({ earnedPix: 0 }));

          // when
          const result = await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            answerRepository,
            assessmentRepository,
            challengeRepository,
            competenceEvaluationRepository,
            skillRepository,
            smartPlacementAssessmentRepository,
            knowledgeElementRepository,
            scorecardService,
          });

          // then
          expect(result.levelup).to.deep.equal({});
        });
      });

      context('when the user responds badly', async () => {
        it('should not compute the level up', async () => {
          // given
          answer = domainBuilder.buildAnswer({ value: '' });
          answer.id = undefined;
          answer.result = undefined;
          answer.resultDetails = undefined;

          // when
          await correctAnswerThenUpdateAssessment({
            answer,
            userId,
            answerRepository,
            assessmentRepository,
            challengeRepository,
            competenceEvaluationRepository,
            skillRepository,
            smartPlacementAssessmentRepository,
            knowledgeElementRepository,
            scorecardService,
          });

          // then
          expect(scorecardService.computeScorecard).to.not.have.been.called;
        });
      });

    });

    context('and assessment is a nor a SMART_PLACEMENT nor a COMPETENCE_EVALUATION', () => {

      let answer;
      let assessment;
      let challenge;
      let completedAnswer;
      let correctAnswerValue;
      let savedAnswer;
      let solution;
      let validator;

      beforeEach(() => {
        // given
        correctAnswerValue = '1';

        answer = domainBuilder.buildAnswer();
        answer.id = undefined;
        answer.result = undefined;
        answer.resultDetails = undefined;

        solution = domainBuilder.buildSolution({ id: answer.challengeId, value: correctAnswerValue });
        validator = domainBuilder.buildValidator.ofTypeQCU({ solution });
        challenge = domainBuilder.buildChallenge({ id: answer.challengeId, validator });

        completedAnswer = domainBuilder.buildAnswer(answer);
        completedAnswer.id = undefined;
        completedAnswer.result = AnswerStatus.OK;
        completedAnswer.resultDetails = null;

        savedAnswer = domainBuilder.buildAnswer(completedAnswer);

        assessment = domainBuilder.buildAssessment({ userId, type: Assessment.types.CERTIFICATION });

        answerRepository.findByChallengeAndAssessment.resolves(false);
        assessmentRepository.get.resolves(assessment);
        challengeRepository.get.resolves(challenge);
        answerRepository.save.resolves(savedAnswer);
      });

      it('should call the answer repository to check if challenge has already been answered', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArguments = {
          assessmentId: answer.assessmentId,
          challengeId: answer.challengeId,
        };
        expect(answerRepository.findByChallengeAndAssessment).to.have.been.calledWith(expectedArguments);
      });

      it('should call the answer repository to save the answer', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArgument = completedAnswer;
        expect(answerRepository.save).to.have.been.calledWith(expectedArgument);
      });

      it('should call the challenge repository to get the answer challenge', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArgument = answer.challengeId;
        expect(challengeRepository.get).to.have.been.calledWith(expectedArgument);
      });

      it('should not call the compute scorecard method', async () => {
        // when
        await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        expect(scorecardService.computeScorecard).to.not.have.been.called;
      });

      it('should return the saved answer - with the id', async () => {
        // when
        const result = await correctAnswerThenUpdateAssessment({
          answer,
          userId,
          answerRepository,
          assessmentRepository,
          challengeRepository,
          competenceEvaluationRepository,
          skillRepository,
          smartPlacementAssessmentRepository,
          knowledgeElementRepository,
          scorecardService,
        });

        // then
        const expectedArgument = savedAnswer;
        expect(result).to.deep.equal(expectedArgument);
      });
    });
  });

  context('when the user which want to save the answer is not the right user', () => {

    let answer;
    let assessment;

    beforeEach(() => {
      answer = domainBuilder.buildAnswer();
      answerRepository.findByChallengeAndAssessment.resolves(false);
      assessment = domainBuilder.buildAssessment({ userId: (userId + 1) });
      assessmentRepository.get.resolves(assessment);
    });

    it('should throw an error if no userId is passed', () => {
      // when
      const result = correctAnswerThenUpdateAssessment({
        answer,
        userId,
        answerRepository,
        assessmentRepository,
        scorecardService,
      });

      // then
      return expect(result).to.be.rejectedWith(ForbiddenAccess);
    });
  });

});
