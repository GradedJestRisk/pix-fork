import { LocaleFormatError, LocaleNotSupportedError } from '../../../../../src/shared/domain/errors.js';
import { getCanonicalLocale } from '../../../../../src/shared/domain/services/locale-service.js';
import { catchErrSync, expect } from '../../../../test-helper.js';

describe('Unit | Shared | Domain | Service | Locale', function () {
  describe('#getCanonicalLocale', function () {
    it('throws a LocaleFormatError error', function () {
      // when
      const error = catchErrSync(getCanonicalLocale)('anInvalidLocale');

      //then
      expect(error).to.be.instanceOf(LocaleFormatError);
    });

    it('throws a LocaleNotSupportedError error', function () {
      // when
      const error = catchErrSync(getCanonicalLocale)('pt-PT');

      //then
      expect(error).to.be.instanceOf(LocaleNotSupportedError);
    });

    it('canonicalizes the given locale', function () {
      // given
      const locale = getCanonicalLocale('fr-fr');

      //then
      expect(locale).to.equal('fr-FR');
    });
  });
});
