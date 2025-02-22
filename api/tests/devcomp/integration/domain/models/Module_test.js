import { ModuleInstantiationError } from '../../../../../src/devcomp/domain/errors.js';
import { Text } from '../../../../../src/devcomp/domain/models/element/Text.js';
import { Grain } from '../../../../../src/devcomp/domain/models/Grain.js';
import { Module } from '../../../../../src/devcomp/domain/models/module/Module.js';
import { catchErrSync, expect } from '../../../../test-helper.js';

describe('Integration | Devcomp | Domain | Models | Module', function () {
  describe('When a transition text is related to a missing grain', function () {
    it('should throw an error', function () {
      // given
      const grain = new Grain({
        id: '1',
        title: 'Le format des adresses email',
        components: [{ type: 'element', element: new Text({ id: 'id', content: 'content' }) }],
      });
      const id = '1';
      const slug = 'les-adresses-email';
      const title = 'Les adresses email';
      const grains = [grain];
      const transitionTexts = [
        {
          grainId: '1',
          content: 'content grain 1',
        },
        {
          grainId: '2',
          content: 'content grain 2',
        },
      ];
      const details = Symbol('details');

      // when
      const error = catchErrSync(() => new Module({ id, slug, title, grains, transitionTexts, details }))();

      // then
      expect(error).to.be.instanceOf(ModuleInstantiationError);
      expect(error.message).to.equal('All the transition texts should be linked to a grain contained in the module.');
    });
  });
});
