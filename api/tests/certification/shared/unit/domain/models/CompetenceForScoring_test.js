import { CompetenceForScoring } from '../../../../../../src/certification/shared/domain/models/CompetenceForScoring.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | CompetenceForScoring', function () {
  describe('#getCompetenceMark', function () {
    let intervals;

    const competenceId = 'recCompetenceId';
    const areaCode = '1';
    const competenceCode = '1.1';

    beforeEach(function () {
      intervals = [
        {
          bounds: {
            max: -1,
            min: -5,
          },
          competenceLevel: 0,
        },
        {
          bounds: {
            max: 1,
            min: -1,
          },
          competenceLevel: 1,
        },
        {
          bounds: {
            max: 5,
            min: -1,
          },
          competenceLevel: 2,
        },
      ];
    });

    describe('when the capacity is inside the lowest interval', function () {
      it('should return the CompetenceMark with a level of 0', function () {
        const estimatedLevel = -4;

        const competenceForScoring = new CompetenceForScoring({
          competenceId,
          areaCode,
          competenceCode,
          intervals,
        });

        const competenceMark = competenceForScoring.getCompetenceMark(estimatedLevel);

        const expectedCompetenceMark = domainBuilder.buildCompetenceMark({
          competenceId,
          area_code: areaCode,
          competence_code: competenceCode,
          level: 0,
          score: 0,
        });

        expect(competenceMark).to.deep.equal(expectedCompetenceMark);
      });
    });

    describe('when the capacity is inside the level 1 interval', function () {
      it('should return the CompetenceMark with a level of 1', function () {
        const estimatedLevel = 0;

        const competenceForScoring = new CompetenceForScoring({
          competenceId,
          areaCode,
          competenceCode,
          intervals,
        });

        const competenceMark = competenceForScoring.getCompetenceMark(estimatedLevel);

        const expectedCompetenceMark = domainBuilder.buildCompetenceMark({
          competenceId,
          area_code: areaCode,
          competence_code: competenceCode,
          level: 1,
          score: 0,
        });

        expect(competenceMark).to.deep.equal(expectedCompetenceMark);
      });
    });

    describe('when the capacity is above the highest interval', function () {
      it('should return the CompetenceMark with a level of the highest interval', function () {
        const estimatedLevel = 6;

        const competenceForScoring = new CompetenceForScoring({
          competenceId,
          areaCode,
          competenceCode,
          intervals,
        });

        const competenceMark = competenceForScoring.getCompetenceMark(estimatedLevel);

        const expectedCompetenceMark = domainBuilder.buildCompetenceMark({
          competenceId,
          area_code: areaCode,
          competence_code: competenceCode,
          level: 2,
          score: 0,
        });

        expect(competenceMark).to.deep.equal(expectedCompetenceMark);
      });
    });

    describe('when the capacity is below the lowest interval', function () {
      it('should return the CompetenceMark with a level of the highest interval', function () {
        const estimatedLevel = -6;

        const competenceForScoring = new CompetenceForScoring({
          competenceId,
          areaCode,
          competenceCode,
          intervals,
        });

        const competenceMark = competenceForScoring.getCompetenceMark(estimatedLevel);

        const expectedCompetenceMark = domainBuilder.buildCompetenceMark({
          competenceId,
          area_code: areaCode,
          competence_code: competenceCode,
          level: 0,
          score: 0,
        });

        expect(competenceMark).to.deep.equal(expectedCompetenceMark);
      });
    });
  });
});
