import {
  identifiersType,
  optionalIdentifiersType,
  queriesType,
} from '../../../../../src/shared/domain/types/identifiers-type.js';
import { expect } from '../../../../test-helper.js';
const { userId, competenceId } = identifiersType;
const { organizationId } = optionalIdentifiersType;

describe('Unit | Domain | Type | identifier-types', function () {
  context('identifiersType', function () {
    describe('#userId', function () {
      context('when id is valid', function () {
        it('should not reject', function () {
          // given
          const validId = 1;

          // when
          const { error } = userId.validate(validId);

          // then
          expect(error).to.be.undefined;
        });
      });

      context('when id is invalid', function () {
        it('should reject outside of lower bound', async function () {
          // given
          const lowerBoundOutOfRangeId = 0;

          // when
          const { error } = userId.validate(lowerBoundOutOfRangeId);

          // then
          expect(error.message).to.equal('"value" must be greater than or equal to 1');
        });

        it('should reject outside of upper bound', async function () {
          // given
          const upperBoundOutOfRangeId = 2147483648;

          // when
          const { error } = userId.validate(upperBoundOutOfRangeId);

          // then
          expect(error.message).to.equal('"value" must be less than or equal to 2147483647');
        });
      });
    });

    describe('#competenceId', function () {
      context('when id is valid', function () {
        it('should not reject', function () {
          // given
          const validId = '1234567890123456';

          // when then
          const { error } = competenceId.validate(validId);

          // then
          expect(error).to.be.undefined;
        });
      });

      context('when id is invalid', function () {
        it('should reject when empty', async function () {
          // given
          const emptyString = '';

          // when
          const { error } = competenceId.validate(emptyString);

          // then
          expect(error.message).to.equal('"value" is not allowed to be empty');
        });

        it('should reject when too large', async function () {
          // given
          const tooLargeString = 'A'.repeat(256);

          // when
          const { error } = competenceId.validate(tooLargeString);

          // then
          expect(error.message).to.equal('"value" length must be less than or equal to 255 characters long');
        });
      });
    });
  });

  context('optionalIdentifiersType', function () {
    describe('#organizationId', function () {
      context('when organizationId is null', function () {
        it('should not throw', function () {
          // given
          const nullId = null;

          // when
          const { error } = organizationId.validate(nullId);

          // then
          expect(error).to.be.undefined;
        });
      });
      context('when organizationId is empty', function () {
        it('should not throw', function () {
          // given
          const emptyId = '';

          // when
          const { error } = organizationId.validate(emptyId);

          // then
          expect(error).to.be.undefined;
        });
      });
      context('when organizationId is undefined', function () {
        it('should not throw', function () {
          // given
          const undefinedId = '';

          // when
          const { error } = organizationId.validate(undefinedId);

          // then
          expect(error).to.be.undefined;
        });
      });
      context('when organizationId is lower of range', function () {
        it('should reject outside of lower bound', async function () {
          // given
          const lowerBoundOutOfRangeId = 0;

          // when
          const { error } = organizationId.validate(lowerBoundOutOfRangeId);

          // then
          expect(error.message).to.equal('"value" must be greater than or equal to 1');
        });
      });
      context('when organizationId is higher of range', function () {
        it('should reject outside of upper bound', async function () {
          // given
          const upperBoundOutOfRangeId = 2147483648;

          // when
          const { error } = organizationId.validate(upperBoundOutOfRangeId);

          // then
          expect(error.message).to.equal('"value" must be less than or equal to 2147483647');
        });
      });
    });
  });

  context('queriesType', function () {
    describe('#paginationType', function () {
      context('when number is valid', function () {
        it('should not reject', function () {
          // given
          const validNumber = 1;

          // when
          const { error } = queriesType.paginationType.validate({ number: validNumber });

          // then
          expect(error).to.be.undefined;
        });

        it('should not reject when string is number', function () {
          // given
          const validNumber = '18';

          // when
          const { error } = queriesType.paginationType.validate({ number: validNumber });

          // then
          expect(error).to.be.undefined;
        });

        it('should not reject when is null', async function () {
          // given
          const validNumber = null;

          // when
          const { error } = queriesType.paginationType.validate({ number: validNumber });

          // then
          expect(error).to.be.undefined;
        });
      });

      context('when number is invalid', function () {
        it('should reject when is string', async function () {
          // given
          const invalidNumber = 'toto';

          // when
          const { error } = queriesType.paginationType.validate({ number: invalidNumber });

          // then
          expect(error.message).to.equal('"number" must be a number');
        });
      });

      context('when size is valid', function () {
        it('should not reject', function () {
          // given
          const validNumber = 1;

          // when
          const { error } = queriesType.paginationType.validate({ size: validNumber });

          // then
          expect(error).to.be.undefined;
        });

        it('should not reject when string is number', function () {
          // given
          const validNumber = '18';

          // when
          const { error } = queriesType.paginationType.validate({ size: validNumber });

          // then
          expect(error).to.be.undefined;
        });

        it('should not reject when is null', async function () {
          // given
          const validNumber = null;

          // when
          const { error } = queriesType.paginationType.validate({ size: validNumber });

          // then
          expect(error).to.be.undefined;
        });
      });

      context('when size is invalid', function () {
        it('should reject when is string', async function () {
          // given
          const invalidNumber = 'toto';

          // when
          const { error } = queriesType.paginationType.validate({ size: invalidNumber });

          // then
          expect(error.message).to.equal('"size" must be a number');
        });
      });
    });
  });
});
