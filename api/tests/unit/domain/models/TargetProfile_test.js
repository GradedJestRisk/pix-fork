const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | TargetProfile', () => {

  describe('findSkillById', () => {

    it('should return the corresponding skill when target profile has the skill by id', () => {
      // given
      const skill = domainBuilder.buildSkill();
      const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill] });

      // when
      const actualSkill = targetProfile.findSkillById(skill.id);

      // then
      expect(actualSkill).to.deep.equal(skill);
    });

    it('should return undefined when no skills found in target profile by given id', () => {
      // given
      const skill = domainBuilder.buildSkill({ id: 'someId' });
      const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill] });

      // when
      const actualSkill = targetProfile.findSkillById('someOtherId');

      // then
      expect(actualSkill).to.be.undefined;
    });
  });

  describe('getCompetenceIds', () => {

    it('should return an array with unique competence ids of skills in target profile', () => {
      // given
      const skill1 = domainBuilder.buildSkill({ competenceId: 'competence1' });
      const skill2 = domainBuilder.buildSkill({ competenceId: 'competence2' });
      const skill3 = domainBuilder.buildSkill({ competenceId: 'competence1' });
      const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill1, skill2, skill3] });

      // when
      const competenceIds = targetProfile.getCompetenceIds();

      // then
      expect(competenceIds).to.exactlyContain(['competence1', 'competence2']);
    });
  });

});
