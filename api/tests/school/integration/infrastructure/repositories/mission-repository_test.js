import { Mission } from '../../../../../src/school/domain/models/Mission.js';
import { MissionNotFoundError } from '../../../../../src/school/domain/school-errors.js';
import * as missionRepository from '../../../../../src/school/infrastructure/repositories/mission-repository.js';
import { catchErr, expect, mockLearningContent } from '../../../../test-helper.js';

describe('Integration | Repository | mission-repository', function () {
  describe('#get', function () {
    context('when there is a mission for the given id', function () {
      it('should return the correct mission with FR default language', async function () {
        // given
        const expectedMission = new Mission({
          id: 1,
          name: 'nameThemaFR1',
          competenceId: 'competenceId',
          thematicId: 'thematicId',
          learningObjectives: 'learningObjectivesi18n',
          validatedObjectives: 'validatedObjectivesi18n',
          introductionMediaUrl: 'http://monimage.pix.fr',
          introductionMediaType: 'image',
          introductionMediaAlt: "Alt à l'image",
          documentationUrl: 'http://madoc.pix.fr',
          content: {
            steps: [
              {
                name: 'step_name_1',
              },
            ],
          },
        });

        mockLearningContent({
          missions: [
            {
              id: 1,
              name_i18n: { fr: 'nameThemaFR1' },
              competenceId: 'competenceId',
              thematicId: 'thematicId',
              learningObjectives_i18n: { fr: 'learningObjectivesi18n' },
              validatedObjectives_i18n: { fr: 'validatedObjectivesi18n' },
              introductionMediaUrl: 'http://monimage.pix.fr',
              introductionMediaType: 'image',
              introductionMediaAlt: "Alt à l'image",
              documentationUrl: 'http://madoc.pix.fr',
              content: {
                steps: [
                  {
                    name_i18n: { fr: 'step_name_1' },
                  },
                ],
              },
            },
          ],
        });

        // when
        const mission = await missionRepository.get('1');

        // then
        expect({ ...mission }).to.deep.equal(expectedMission);
      });
    });
    context('when there is no mission for the given id', function () {
      it('should return the not found error', async function () {
        // given
        mockLearningContent({
          thematics: [],
        });
        const missionId = 'recThematic1';
        // when
        const error = await catchErr(missionRepository.get)(missionId);

        // then
        expect(error).to.be.instanceOf(MissionNotFoundError);
        expect(error.message).to.deep.equal(`Mission not found for mission id ${missionId}`);
      });
    });
  });

  describe('#findAllActiveMissions', function () {
    context('when there are active missions', function () {
      it('should return all active mission', async function () {
        // given
        const expectedMission = new Mission({
          id: 1,
          name: 'nameThemaFR1',
          competenceId: 'competenceId',
          thematicId: 'thematicId',
          cardImageUrl: 'super-url',
          learningObjectives: 'learningObjectivesi18n',
          validatedObjectives: 'validatedObjectivesi18n',
          introductionMediaUrl: 'http://monimage.pix.fr',
          introductionMediaType: 'image',
          introductionMediaAlt: "Alt à l'image",
          documentationUrl: 'http://madoc.pix.fr',
          content: {
            steps: [
              {
                name: 'step_name_1',
              },
            ],
          },
        });

        mockLearningContent({
          missions: [
            {
              id: 1,
              status: 'VALIDATED',
              name_i18n: { fr: 'nameThemaFR1' },
              competenceId: 'competenceId',
              thematicId: 'thematicId',
              cardImageUrl: 'super-url',
              learningObjectives_i18n: { fr: 'learningObjectivesi18n' },
              validatedObjectives_i18n: { fr: 'validatedObjectivesi18n' },
              introductionMediaUrl: 'http://monimage.pix.fr',
              introductionMediaType: 'image',
              introductionMediaAlt: "Alt à l'image",
              documentationUrl: 'http://madoc.pix.fr',
              content: {
                steps: [
                  {
                    name_i18n: { fr: 'step_name_1' },
                  },
                ],
              },
            },
            {
              id: 2,
              status: 'INACTIVE',
              name_i18n: { fr: 'nameThemaFR1' },
              competenceId: 'competenceId',
              thematicId: 'thematicId',
              cardImageUrl: 'super-url',
              learningObjectives_i18n: { fr: 'learningObjectivesi18n' },
              validatedObjectives_i18n: { fr: 'validatedObjectivesi18n' },
              introductionMediaUrl: 'http://monimage.pix.fr',
              introductionMediaType: 'image',
              introductionMediaAlt: "Alt à l'image",
              documentationUrl: 'http://madoc.pix.fr',
              content: {
                steps: [
                  {
                    name_i18n: { fr: 'step_name_1' },
                  },
                ],
              },
            },
          ],
        });

        // when
        const missions = await missionRepository.findAllActiveMissions();

        // then
        expect(missions).to.deep.equal([expectedMission]);
      });
    });
  });
});
