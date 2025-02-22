import { ComponentElement } from '../../../../../../src/devcomp/domain/models/component/ComponentElement.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Models | Component | ComponentElement', function () {
  describe('#constructor', function () {
    it('should create a componentElement', function () {
      // given
      const element = Symbol('element');
      const type = 'element';

      // when
      const componentElement = new ComponentElement({ element });

      // then
      expect(componentElement.element).to.equal(element);
      expect(componentElement.type).to.equal(type);
    });
  });

  describe('if a componentElement does not have an element', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(() => new ComponentElement({}))();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('An element is required for a componentElement');
    });
  });
});
