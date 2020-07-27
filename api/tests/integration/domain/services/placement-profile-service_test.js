const { expect, sinon, domainBuilder } = require('../../../test-helper');
const _ = require('lodash');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const knowledgeElementRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-repository');
const placementProfileService = require('../../../../lib/domain/services/placement-profile-service');

const Assessment = require('../../../../lib/domain/models/Assessment');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const PlacementProfile = require('../../../../lib/domain/models/PlacementProfile');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Competence = require('../../../../lib/domain/models/Competence');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const Skill = require('../../../../lib/domain/models/Skill');
const UserCompetence = require('../../../../lib/domain/models/UserCompetence');

describe('Integration | Service | Placement Profile Service', function() {

  const userId = 63731;

  function _createCompetence(id, index, name, areaCode) {
    const competence = new Competence();
    competence.id = id;
    competence.index = index;
    competence.name = name;
    competence.area = { code: areaCode };

    return competence;
  }

  function _createChallenge(id, competence, skills, testedSkill) {
    const challenge = new Challenge();
    challenge.id = id;
    challenge.skills = skills;
    challenge.competenceId = competence;
    challenge.testedSkill = testedSkill;
    return challenge;
  }

  const skillCitation4 = new Skill({ id: 10, name: '@citation4' });
  const skillCollaborer4 = new Skill({ id: 20, name: '@collaborer4' });
  const skillMoteur3 = new Skill({ id: 30, name: '@moteur3' });
  const skillRecherche4 = new Skill({ id: 40, name: '@recherche4' });
  const skillRemplir2 = new Skill({ id: 50, name: '@remplir2' });
  const skillRemplir4 = new Skill({ id: 60, name: '@remplir4' });
  const skillUrl3 = new Skill({ id: 70, name: '@url3' });
  const skillWeb1 = new Skill({ id: 80, name: '@web1' });
  const skillSearch1 = new Skill({ id: 90, name: '@url1' });
  const skillRequin5 = new Skill({ id: 110, name: '@requin5' });
  const skillRequin8 = new Skill({ id: 120, name: '@requin8' });

  const competenceFlipper = _createCompetence('competenceRecordIdOne', '1.1', '1.1 Construire un flipper', '1');
  const competenceDauphin = _createCompetence('competenceRecordIdTwo', '1.2', '1.2 Adopter un dauphin', '1');
  const competenceRequin = _createCompetence('competenceRecordIdThree', '1.3', '1.3 Se faire manger par un requin', '1');

  const challengeForSkillCollaborer4 = _createChallenge('challengeRecordIdThree', 'competenceRecordIdThatDoesNotExistAnymore', [skillCollaborer4], '@collaborer4');

  const challengeForSkillCitation4 = _createChallenge('challengeRecordIdOne', competenceFlipper.id, [skillCitation4], '@citation4');
  const challengeForSkillCitation4AndMoteur3 = _createChallenge('challengeRecordIdTwo', competenceFlipper.id, [skillCitation4, skillMoteur3], '@citation4');
  const challengeForSkillRecherche4 = _createChallenge('challengeRecordIdFour', competenceFlipper.id, [skillRecherche4], '@recherche4');
  const challengeRecordWithoutSkills = _createChallenge('challengeRecordIdNine', competenceFlipper.id, [], null);
  const anotherChallengeForSkillCitation4 = _createChallenge('challengeRecordIdTen', competenceFlipper.id, [skillCitation4], '@citation4');
  const challengeForSkillSearch1 = _createChallenge('challenge_url1', competenceFlipper.id, [skillSearch1], '@search1');
  const challenge2ForSkillSearch1 = _createChallenge('challenge_bis_url1', competenceFlipper.id, [skillSearch1], '@search1');

  const challengeForSkillRemplir2 = _createChallenge('challengeRecordIdFive', competenceDauphin.id, [skillRemplir2], '@remplir2');
  const challengeForSkillRemplir4 = _createChallenge('challengeRecordIdSix', competenceDauphin.id, [skillRemplir4], '@remplir4');
  const challengeForSkillUrl3 = _createChallenge('challengeRecordIdSeven', competenceDauphin.id, [skillUrl3], '@url3');
  const challengeForSkillWeb1 = _createChallenge('challengeRecordIdEight', competenceDauphin.id, [skillWeb1], '@web1');

  const challengeForSkillRequin5 = _createChallenge('challengeRecordIdNine', competenceRequin.id, [skillRequin5], '@requin5');
  const challengeForSkillRequin8 = _createChallenge('challengeRecordIdTen', competenceRequin.id, [skillRequin8], '@requin8');

  const competences = [
    competenceFlipper,
    competenceDauphin,
    competenceRequin,
  ];

  beforeEach(() => {
    sinon.stub(challengeRepository, 'findOperative').resolves([
      challengeForSkillCitation4,
      anotherChallengeForSkillCitation4,
      challengeForSkillCitation4AndMoteur3,
      challengeForSkillCollaborer4,
      challengeForSkillRecherche4,
      challengeForSkillRemplir2,
      challengeForSkillRemplir4,
      challengeForSkillUrl3,
      challengeForSkillWeb1,
      challengeRecordWithoutSkills,
      challengeForSkillRequin5,
      challengeForSkillRequin8,
    ]);
    sinon.stub(competenceRepository, 'listPixCompetencesOnly').resolves(competences);
  });

  context('V1 Profile', () => {
    describe('#getPlacementProfile', () => {

      const assessmentResult1 = new AssessmentResult({ level: 1, pixScore: 12 });
      const assessmentResult2 = new AssessmentResult({ level: 2, pixScore: 23 });
      const assessmentResult3 = new AssessmentResult({ level: 0, pixScore: 2 });
      const assessment1 = new Assessment({
        id: 13,
        status: 'completed',
        competenceId: 'competenceRecordIdOne',
        assessmentResults: [assessmentResult1]
      });
      const assessment2 = new Assessment({
        id: 1637,
        status: 'completed',
        competenceId: 'competenceRecordIdTwo',
        assessmentResults: [assessmentResult2]
      });
      const assessment3 = new Assessment({
        id: 145,
        status: 'completed',
        competenceId: 'competenceRecordIdUnknown',
        assessmentResults: [assessmentResult3]
      });

      beforeEach(() => {
        sinon.stub(assessmentRepository, 'findLastCompletedAssessmentsForEachCompetenceByUser').resolves([
          assessment1, assessment2, assessment3
        ]);
      });

      it('should load achieved assessments', async () => {
        // given
        const limitDate = '2020-10-27 08:44:25';

        // when
        await placementProfileService.getPlacementProfile({ userId, limitDate, isV2Certification: false });

        // then
        sinon.assert.calledOnce(assessmentRepository.findLastCompletedAssessmentsForEachCompetenceByUser);
        sinon.assert.calledWith(assessmentRepository.findLastCompletedAssessmentsForEachCompetenceByUser, userId, '2020-10-27 08:44:25');
      });
    });
  });

  context('V2 Profile', () => {
    describe('#getPlacementProfile', () => {

      it('should assign 0 pixScore and level of 0 to user competence when not assessed', async () => {
        // given
        sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
          .withArgs({ userId, limitDate: sinon.match.any }).resolves({});

        // when
        const actualPlacementProfile = await placementProfileService.getPlacementProfile({
          userId,
          limitDate: 'salut',
        });

        // then
        expect(actualPlacementProfile.userCompetences).to.deep.equal([
          {
            id: 'competenceRecordIdOne',
            index: '1.1',
            area: { code: '1' },
            name: '1.1 Construire un flipper',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
            challenges: []
          },
          {
            id: 'competenceRecordIdTwo',
            index: '1.2',
            area: { code: '1' },
            name: '1.2 Adopter un dauphin',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
            challenges: []
          },
          {
            id: 'competenceRecordIdThree',
            index: '1.3',
            area: { code: '1' },
            name: '1.3 Se faire manger par un requin',
            skills: [],
            pixScore: 0,
            estimatedLevel: 0,
            challenges: []
          }]);
      });

      describe('PixScore by competences', () => {

        it('should assign pixScore and level to user competence based on knowledge elements', async () => {
          // given

          const ke = domainBuilder.buildKnowledgeElement({
            competenceId: 'competenceRecordIdTwo',
            skillId: skillRemplir2.id,
            earnedPix: 23
          });

          sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
            .withArgs({ userId, limitDate: sinon.match.any }).resolves({ competenceRecordIdTwo: [ke] });

          // when
          const actualPlacementProfile = await placementProfileService.getPlacementProfile({
            userId,
            limitDate: 'salut',
          });

          // then
          expect(actualPlacementProfile.userCompetences[0]).to.include({
            id: 'competenceRecordIdOne',
            pixScore: 0,
            estimatedLevel: 0
          });
          expect(actualPlacementProfile.userCompetences[1]).to.include({
            id: 'competenceRecordIdTwo',
            pixScore: 23,
            estimatedLevel: 2,
          });
        });

        it('should include both inferred and direct KnowlegdeElements to compute PixScore', async () => {
          // given
          const inferredKe = domainBuilder.buildKnowledgeElement({
            competenceId: 'competenceRecordIdTwo',
            skillId: skillRemplir2.id,
            earnedPix: 8,
            source: KnowledgeElement.SourceType.INFERRED
          });

          const directKe = domainBuilder.buildKnowledgeElement({
            competenceId: 'competenceRecordIdTwo',
            skillId: skillRemplir4.id,
            earnedPix: 9,
            source: KnowledgeElement.SourceType.DIRECT
          });

          sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
            .withArgs({
              userId,
              limitDate: sinon.match.any
            }).resolves({ 'competenceRecordIdTwo': [inferredKe, directKe] });

          // when
          const actualPlacementProfile = await placementProfileService.getPlacementProfile({
            userId,
            limitDate: 'salut',
          });

          // then
          expect(actualPlacementProfile.userCompetences[1].pixScore).to.equal(17);
        });

        context('when we dont want to limit pix score', () => {
          it('should not limit pixScore and level to the max reachable for user competence based on knowledge elements', async () => {

            const ke = domainBuilder.buildKnowledgeElement({
              competenceId: 'competenceRecordIdOne',
              earnedPix: 64
            });

            sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
              .withArgs({ userId, limitDate: sinon.match.any }).resolves({ competenceRecordIdOne: [ke] });

            // when
            const actualPlacementProfile = await placementProfileService.getPlacementProfile({
              userId,
              limitDate: 'salut',
              allowExcessPixAndLevels: true
            });

            // then
            expect(actualPlacementProfile.userCompetences[0]).to.include({
              id: 'competenceRecordIdOne',
              pixScore: 64,
              estimatedLevel: 8
            });
          });

        });

        context('when we want to limit pix score', () => {
          it('should limit pixScore to 40 and level to 5', async () => {

            const ke = domainBuilder.buildKnowledgeElement({
              competenceId: 'competenceRecordIdOne',
              earnedPix: 64
            });

            sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
              .withArgs({ userId, limitDate: sinon.match.any }).resolves({ competenceRecordIdOne: [ke] });

            // when
            const actualPlacementProfile = await placementProfileService.getPlacementProfile({
              userId,
              limitDate: 'salut',
              allowExcessPixAndLevels: false
            });

            // then
            expect(actualPlacementProfile.userCompetences[0]).to.include({
              id: 'competenceRecordIdOne',
              pixScore: 40,
              estimatedLevel: 5
            });
          });
        });
      });

    });
  });
  describe('#getPlacementProfilesWithSnapshotting', () => {

    it('should assign 0 pixScore and level of 0 to user competence when not assessed', async () => {
      // given
      sinon.stub(knowledgeElementRepository, 'findSnapshotGroupedByCompetencesForUsers')
        .withArgs({ [userId]: sinon.match.any }).resolves({ [userId]: {} });

      // when
      const actualPlacementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
        userIdsAndDates: { [userId]: 'someLimitDate' },
        competences
      });

      // then
      expect(actualPlacementProfiles[0].userCompetences).to.deep.equal([
        {
          id: 'competenceRecordIdOne',
          index: '1.1',
          area: { code: '1' },
          name: '1.1 Construire un flipper',
          skills: [],
          pixScore: 0,
          estimatedLevel: 0,
          challenges: []
        },
        {
          id: 'competenceRecordIdTwo',
          index: '1.2',
          area: { code: '1' },
          name: '1.2 Adopter un dauphin',
          skills: [],
          pixScore: 0,
          estimatedLevel: 0,
          challenges: []
        },
        {
          id: 'competenceRecordIdThree',
          index: '1.3',
          area: { code: '1' },
          name: '1.3 Se faire manger par un requin',
          skills: [],
          pixScore: 0,
          estimatedLevel: 0,
          challenges: []
        }]);
    });

    describe('PixScore by competences', () => {

      it('should assign pixScore and level to user competence based on knowledge elements', async () => {
        // given
        const ke = domainBuilder.buildKnowledgeElement({
          competenceId: 'competenceRecordIdTwo',
          skillId: skillRemplir2.id,
          earnedPix: 23
        });

        sinon.stub(knowledgeElementRepository, 'findSnapshotGroupedByCompetencesForUsers')
          .withArgs({ [userId]: sinon.match.any }).resolves({ [userId]: { competenceRecordIdTwo: [ke] } });

        // when
        const actualPlacementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
          userIdsAndDates: { [userId]: 'someLimitDate' },
          competences
        });

        // then
        expect(actualPlacementProfiles[0].userCompetences[0]).to.include({
          id: 'competenceRecordIdOne',
          pixScore: 0,
          estimatedLevel: 0
        });
        expect(actualPlacementProfiles[0].userCompetences[1]).to.include({
          id: 'competenceRecordIdTwo',
          pixScore: 23,
          estimatedLevel: 2,
        });
      });

      it('should include both inferred and direct KnowlegdeElements to compute PixScore', async () => {
        // given
        const inferredKe = domainBuilder.buildKnowledgeElement({
          competenceId: 'competenceRecordIdTwo',
          skillId: skillRemplir2.id,
          earnedPix: 8,
          source: KnowledgeElement.SourceType.INFERRED
        });

        const directKe = domainBuilder.buildKnowledgeElement({
          competenceId: 'competenceRecordIdTwo',
          skillId: skillRemplir4.id,
          earnedPix: 9,
          source: KnowledgeElement.SourceType.DIRECT
        });

        sinon.stub(knowledgeElementRepository, 'findSnapshotGroupedByCompetencesForUsers')
          .withArgs({ [userId]: sinon.match.any }).resolves({ [userId]: { 'competenceRecordIdTwo': [inferredKe, directKe] } });

        // when
        const actualPlacementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
          userIdsAndDates: { [userId]: 'someLimitDate' },
          competences
        });

        // then
        expect(actualPlacementProfiles[0].userCompetences[1].pixScore).to.equal(17);
      });

      context('when we dont want to limit pix score', () => {
        it('should not limit pixScore and level to the max reachable for user competence based on knowledge elements', async () => {
          const ke = domainBuilder.buildKnowledgeElement({
            competenceId: 'competenceRecordIdOne',
            earnedPix: 64
          });

          sinon.stub(knowledgeElementRepository, 'findSnapshotGroupedByCompetencesForUsers')
            .withArgs({ [userId]: sinon.match.any }).resolves({ [userId]: { competenceRecordIdOne: [ke] } });

          // when
          const actualPlacementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
            userIdsAndDates: { [userId]: 'someLimitDate' },
            competences,
            allowExcessPixAndLevels: true
          });

          // then
          expect(actualPlacementProfiles[0].userCompetences[0]).to.include({
            id: 'competenceRecordIdOne',
            pixScore: 64,
            estimatedLevel: 8
          });
        });

      });

      context('when we want to limit pix score', () => {
        it('should limit pixScore to 40 and level to 5', async () => {
          const ke = domainBuilder.buildKnowledgeElement({
            competenceId: 'competenceRecordIdOne',
            earnedPix: 64
          });

          sinon.stub(knowledgeElementRepository, 'findSnapshotGroupedByCompetencesForUsers')
            .withArgs({ [userId]: sinon.match.any }).resolves({ [userId]: { competenceRecordIdOne: [ke] } });

          // when
          const actualPlacementProfiles = await placementProfileService.getPlacementProfilesWithSnapshotting({
            userIdsAndDates: { [userId]: 'someLimitDate' },
            competences,
            allowExcessPixAndLevels: false
          });

          // then
          expect(actualPlacementProfiles[0].userCompetences[0]).to.include({
            id: 'competenceRecordIdOne',
            pixScore: 40,
            estimatedLevel: 5
          });
        });
      });
    });
  });

  describe('#pickCertificationChallenges', () => {
    let placementProfile;
    let userCompetence1;
    let userCompetence2;

    beforeEach(() => {
      userCompetence1 = new UserCompetence({
        id: 'competenceRecordIdOne',
        index: '1.1',
        area: { code: '1' },
        name: '1.1 Construire un flipper',
      });
      userCompetence1.pixScore = 12;
      userCompetence1.estimatedLevel = 1;
      userCompetence2 = new UserCompetence({
        id: 'competenceRecordIdTwo',
        index: '1.2',
        area: { code: '1' },
        name: '1.2 Adopter un dauphin',
      });
      userCompetence2.pixScore = 23;
      userCompetence2.estimatedLevel = 2;
      placementProfile = new PlacementProfile({
        userId,
        userCompetences: [],
        profileDate: 'limitDate'
      });

      sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
        .withArgs({ userId, limitDate: 'limitDate' }).resolves('ke');

      KnowledgeElement.findDirectlyValidatedFromGroups = sinon.stub().returns([{ answerId: 123 }, { answerId: 456 }, { answerId: 789 }]);
      sinon.stub(answerRepository, 'findChallengeIdsFromAnswerIds');
      // when
    });

    it('should find validated challenges', async () => {
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdFive']);

      // when
      await placementProfileService.pickCertificationChallenges(placementProfile);

      // then
      sinon.assert.calledOnce(challengeRepository.findOperative);
    });

    it('should assign skill to related competence', async () => {
      // given
      placementProfile.userCompetences = [userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdFive']);

      // when
      const userCompetences = await placementProfileService.pickCertificationChallenges(placementProfile);

      // then
      expect(userCompetences).to.deep.equal([
        {
          ...placementProfile.userCompetences[0],
          skills: [skillRemplir2],
          challenges: [challengeForSkillRemplir2]
        }]);
    });

    context('when competence level is less than 1', () => {

      it('should select no challenge', async () => {
        // given
        userCompetence1.estimatedLevel = 0;
        placementProfile.userCompetences = [userCompetence1];

        answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves([]);

        // when
        const userCompetences = await placementProfileService.pickCertificationChallenges(placementProfile);

        // then
        expect(userCompetences).to.deep.equal([
          {
            ...placementProfile.userCompetences[0],
            skills: [],
            challenges: []
          }]);
      });
    });

    context('when no challenge validate the skill', () => {

      it('should not return the skill', async () => {
        // given
        placementProfile.userCompetences = [userCompetence2];
        answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdEleven']);

        // when
        const userCompetences = await placementProfileService.pickCertificationChallenges(placementProfile);

        // then
        expect(userCompetences).to.deep.equal([
          {
            ...placementProfile.userCompetences[0],
            skills: [],
            challenges: []
          }]);
      });
    });

    context('when three challenges validate the same skill', () => {

      it('should select an unanswered challenge', async () => {
        // given
        placementProfile.userCompetences = [userCompetence1];
        answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdOne']);

        // when
        const userCompetences = await placementProfileService.pickCertificationChallenges(placementProfile);
        const expectedSkills = [skillCitation4];

        // then
        expect(userCompetences).to.deep.equal([
          {
            ...placementProfile.userCompetences[0],
            skills: expectedSkills,
          }]);
        const skillsForChallenges = _.uniq(_.flatMap(userCompetences[0].challenges, 'skills'));
        expect(skillsForChallenges).to.deep.include.members(expectedSkills);
      });

      it('should select a challenge for every skill', async () => {
        // given
        placementProfile.userCompetences = [userCompetence1];
        answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdFour', 'challengeRecordIdTwo']);

        // when
        const userCompetences = await placementProfileService.pickCertificationChallenges(placementProfile);
        const expectedSkills = [skillCitation4, skillRecherche4, skillMoteur3];

        // then
        expect(userCompetences).to.deep.equal([
          {
            ...placementProfile.userCompetences[0],
            skills: expectedSkills,
          },
        ]);

        const skillsForChallenges = _.uniq(_.flatMap(userCompetences[0].challenges, 'skills'));
        expect(skillsForChallenges).to.deep.include.members(expectedSkills);
      });

      it('should return at most one challenge per skill', async () => {
        // given
        placementProfile.userCompetences = [userCompetence1];
        answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdFour', 'challengeRecordIdTwo']);

        // when
        const userCompetences = await placementProfileService.pickCertificationChallenges(placementProfile);
        const expectedSkills = [skillCitation4, skillRecherche4, skillMoteur3];

        // then
        expect(userCompetences).to.deep.equal([
          {
            ...userCompetences[0],
            skills: expectedSkills,
          },
        ]);

        const skillsForChallenges = _.uniq(_.flatMap(userCompetences[0].challenges, 'skills'));
        expect(skillsForChallenges.length).to.equal(expectedSkills.length);
      });
    });

    it('should group skills by competence ', async () => {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdFour', 'challengeRecordIdFive', 'challengeRecordIdSeven']);
      // when
      const userCompetences = await placementProfileService.pickCertificationChallenges(placementProfile);

      // then
      expect(userCompetences).to.deep.equal([
        {
          id: 'competenceRecordIdOne',
          index: '1.1',
          area: { code: '1' },
          name: '1.1 Construire un flipper',
          skills: [skillRecherche4],
          pixScore: 12,
          estimatedLevel: 1,
          challenges: [challengeForSkillRecherche4]
        },
        {
          id: 'competenceRecordIdTwo',
          index: '1.2',
          area: { code: '1' },
          name: '1.2 Adopter un dauphin',
          skills: [skillUrl3, skillRemplir2],
          pixScore: 23,
          estimatedLevel: 2,
          challenges: [challengeForSkillUrl3, challengeForSkillRemplir2]
        }]);
    });

    it('should sort in desc grouped skills by competence', async () => {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdSix', 'challengeRecordIdFive', 'challengeRecordIdSeven']);
      // when
      const userCompetences = await placementProfileService.pickCertificationChallenges(placementProfile);

      // then
      expect(userCompetences).to.deep.equal([
        {
          id: 'competenceRecordIdOne',
          index: '1.1',
          area: { code: '1' },
          name: '1.1 Construire un flipper',
          skills: [],
          pixScore: 12,
          estimatedLevel: 1,
          challenges: [],
        },
        {
          id: 'competenceRecordIdTwo',
          index: '1.2',
          area: { code: '1' },
          name: '1.2 Adopter un dauphin',
          skills: [skillRemplir4, skillUrl3, skillRemplir2],
          pixScore: 23,
          estimatedLevel: 2,
          challenges: [challengeForSkillRemplir4, challengeForSkillUrl3, challengeForSkillRemplir2],
        }]);
    });

    it('should return the three most difficult skills sorted in desc grouped by competence', async () => {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdSix', 'challengeRecordIdFive', 'challengeRecordIdSeven', 'challengeRecordIdEight']);
      // when
      const userCompetences = await placementProfileService.pickCertificationChallenges(placementProfile);

      // then
      expect(userCompetences).to.deep.equal([
        {
          id: 'competenceRecordIdOne',
          index: '1.1',
          area: { code: '1' },
          name: '1.1 Construire un flipper',
          skills: [],
          pixScore: 12,
          estimatedLevel: 1,
          challenges: [],
        },
        {
          id: 'competenceRecordIdTwo',
          index: '1.2',
          area: { code: '1' },
          name: '1.2 Adopter un dauphin',
          skills: [skillRemplir4, skillUrl3, skillRemplir2],
          pixScore: 23,
          estimatedLevel: 2,
          challenges: [challengeForSkillRemplir4, challengeForSkillUrl3, challengeForSkillRemplir2],
        }]);
    });

    it('should not add a skill twice', async () => {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdFive', 'challengeRecordIdFive']);
      // when
      const userCompetences = await placementProfileService.pickCertificationChallenges(placementProfile);

      // then
      expect(userCompetences).to.deep.equal([
        {
          id: 'competenceRecordIdOne',
          index: '1.1',
          area: { code: '1' },
          name: '1.1 Construire un flipper',
          skills: [],
          pixScore: 12,
          estimatedLevel: 1,
          challenges: [],
        },
        {
          id: 'competenceRecordIdTwo',
          index: '1.2',
          area: { code: '1' },
          name: '1.2 Adopter un dauphin',
          skills: [skillRemplir2],
          pixScore: 23,
          estimatedLevel: 2,
          challenges: [challengeForSkillRemplir2],
        }]);
    });

    it('should not assign skill, when the challenge id is not found', async () => {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['nonExistentchallengeRecordId']);
      // when
      const userCompetences = await placementProfileService.pickCertificationChallenges(placementProfile);

      // then
      expect(userCompetences).to.deep.equal([
        {
          id: 'competenceRecordIdOne',
          index: '1.1',
          area: { code: '1' },
          name: '1.1 Construire un flipper',
          skills: [],
          pixScore: 12,
          estimatedLevel: 1,
          challenges: [],
        },
        {
          id: 'competenceRecordIdTwo',
          index: '1.2',
          area: { code: '1' },
          name: '1.2 Adopter un dauphin',
          skills: [],
          pixScore: 23,
          estimatedLevel: 2,
          challenges: [],
        }]);
    });

    it('should not assign skill, when the competence is not found', async () => {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdThree']);
      // when
      const userCompetences = await placementProfileService.pickCertificationChallenges(placementProfile);

      // then
      expect(userCompetences).to.deep.equal([
        {
          id: 'competenceRecordIdOne',
          index: '1.1',
          area: { code: '1' },
          name: '1.1 Construire un flipper',
          skills: [],
          pixScore: 12,
          estimatedLevel: 1,
          challenges: [],
        },
        {
          id: 'competenceRecordIdTwo',
          index: '1.2',
          area: { code: '1' },
          name: '1.2 Adopter un dauphin',
          skills: [],
          pixScore: 23,
          estimatedLevel: 2,
          challenges: [],
        }]);
    });

    context('when competence has no challenge which validated two skills', () => {

      it('should return three challenges by competence', async () => {
        // given
        placementProfile.userCompetences = [userCompetence1, userCompetence2];
        answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdSix', 'challengeRecordIdFive', 'challengeRecordIdSeven', 'challengeRecordIdEight']);
        // when
        const userCompetences = await placementProfileService.pickCertificationChallenges(placementProfile);

        // then
        expect(userCompetences[1].skills)
          .to.have.members([skillRemplir4, skillUrl3, skillRemplir2]);
        expect(userCompetences[1].challenges)
          .to.have.members([challengeForSkillRemplir4, challengeForSkillUrl3, challengeForSkillRemplir2]);
      });
    });

    context('when competence has challenge which validated two skills', () => {

      it('should return three challenges by competence', async () => {
        // given
        placementProfile.userCompetences = [userCompetence1, userCompetence2];
        answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdFour', 'challengeRecordIdTwo', 'challenge_url1']);
        challengeRepository.findOperative.resolves([
          challengeForSkillRecherche4,
          challengeForSkillCitation4AndMoteur3,
          challengeForSkillCollaborer4,
          challengeForSkillSearch1,
          challenge2ForSkillSearch1,
        ]);
        // when
        const userCompetences = await placementProfileService.pickCertificationChallenges(placementProfile);

        // then
        expect(userCompetences[0].skills)
          .to.have.members([skillCitation4, skillRecherche4, skillMoteur3, skillSearch1]);
        expect(userCompetences[0].challenges)
          .to.have.members([challengeForSkillCitation4AndMoteur3, challengeForSkillRecherche4, challenge2ForSkillSearch1]);
      });
    });
  });
});
