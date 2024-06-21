import { accountRecoveryController } from '../../../../../src/identity-access-management/application/account-recovery/account-recovery.controller.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Application | Controller | account-recovery', function () {
  describe('#checkAccountRecoveryDemand', function () {
    it('returns serialized account recovery details', async function () {
      // given
      const temporaryKey = 'ABCDEFZEFDD';
      const studentInformation = { id: 1234, email: 'philipe@example.net', firstName: 'philipe' };
      const request = {
        params: { temporaryKey },
      };
      sinon.stub(usecases, 'getAccountRecoveryDetails');

      const studentInformationForAccountRecoverySerializerStub = {
        serializeAccountRecovery: sinon.stub(),
      };

      const dependencies = {
        studentInformationForAccountRecoverySerializer: studentInformationForAccountRecoverySerializerStub,
      };

      usecases.getAccountRecoveryDetails.resolves(studentInformation);

      // when
      await accountRecoveryController.checkAccountRecoveryDemand(request, hFake, dependencies);

      // then
      expect(usecases.getAccountRecoveryDetails).to.have.been.calledWithExactly({ temporaryKey });
      expect(
        studentInformationForAccountRecoverySerializerStub.serializeAccountRecovery,
      ).to.have.been.calledWithExactly(studentInformation);
    });
  });

  describe('#updateUserForAccountRecovery', function () {
    it('calls updateUserForAccountRecovery usecase and return 204', async function () {
      // given
      const user = domainBuilder.buildUser({ id: 1 });
      const temporaryKey = 'validTemporaryKey';
      const domainTransaction = Symbol();

      const request = {
        params: {
          id: user.id,
        },
        payload: {
          data: {
            attributes: {
              password: user.password,
              'temporary-key': temporaryKey,
            },
          },
        },
      };

      sinon.stub(usecases, 'updateUserForAccountRecovery').resolves();
      sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => {
        return lambda(domainTransaction);
      });

      // when
      const response = await accountRecoveryController.updateUserAccountFromRecoveryDemand(request, hFake);

      // then
      expect(usecases.updateUserForAccountRecovery).calledWithMatch({
        password: user.password,
        temporaryKey,
        domainTransaction,
      });
      expect(response.statusCode).to.equal(204);
    });
  });
});
