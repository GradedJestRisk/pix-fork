import { Grain } from '../../../../../src/devcomp/domain/models/Grain.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Grain', function () {
  describe('#constructor', function () {
    it('should create a grain and keep attributes', function () {
      // given
      const id = 1;
      const title = 'Les adresses email';
      const components = [Symbol('component')];

      // when
      const grain = new Grain({ id, title, components });

      // then
      expect(grain.id).to.equal(id);
      expect(grain.title).to.equal(title);
      expect(grain.components).to.have.length(components.length);
    });

    describe('if a grain does not have an id', function () {
      it('should throw an error', function () {
        expect(() => new Grain({})).to.throw('The id is required for a grain');
      });
    });

    describe('if a grain does not have a title', function () {
      it('should throw an error', function () {
        expect(() => new Grain({ id: 1 })).to.throw('The title is required for a grain');
      });
    });

    describe('if a grain does not have components', function () {
      it('should not throw an error', function () {
        expect(() => new Grain({ id: 1, title: 'Les adresses mail', components: [] })).not.to.throw();
      });
    });

    describe('if a grain does have components', function () {
      describe('given a wrong typed grain.components in param', function () {
        it('should throw an error', function () {
          expect(
            () =>
              new Grain({
                id: 'id_grain_1',
                title: 'Bien écrire son adresse mail',
                components: 'components',
              }),
          ).to.throw(`Grain components should be a list of components`);
        });
      });
    });
  });
});
