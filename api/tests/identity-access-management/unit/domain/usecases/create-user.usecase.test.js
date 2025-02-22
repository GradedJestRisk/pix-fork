import { createAccountCreationEmail } from '../../../../../src/identity-access-management/domain/emails/create-account-creation.email.js';
import { User } from '../../../../../src/identity-access-management/domain/models/User.js';
import { createUser } from '../../../../../src/identity-access-management/domain/usecases/create-user.usecase.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { AlreadyRegisteredEmailError } from '../../../../../src/shared/domain/errors.js';
import { EntityValidationError } from '../../../../../src/shared/domain/errors.js';
import { urlBuilder } from '../../../../../src/shared/infrastructure/utils/url-builder.js';
import { catchErr, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | create-user', function () {
  const userId = 123;
  const userEmail = 'test@example.net';
  const password = 'Password123';
  const localeFromHeader = 'fr-FR';
  const user = new User({ email: userEmail });
  const hashedPassword = 'ABCDEF1234';
  const savedUser = new User({ id: userId, email: userEmail, locale: localeFromHeader });

  let campaignCode;
  let authenticationMethodRepository;
  let userRepository;
  let userToCreateRepository;
  let emailRepository;
  let campaignRepository;
  let cryptoService;
  let userService;
  let passwordValidator;
  let userValidator;
  let emailValidationDemandRepository;
  let token;

  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute');
    DomainTransaction.execute.callsFake((fn) => {
      return fn({});
    });

    authenticationMethodRepository = {};
    userRepository = { checkIfEmailIsAvailable: sinon.stub() };
    userToCreateRepository = { create: sinon.stub() };
    emailRepository = { sendEmailAsync: sinon.stub() };
    campaignRepository = { getByCode: sinon.stub() };

    cryptoService = { hashPassword: sinon.stub() };
    userService = { createUserWithPassword: sinon.stub() };
    passwordValidator = { validate: sinon.stub() };
    userValidator = { validate: sinon.stub() };

    token = '00000000-0000-0000-0000-000000000000';
    emailValidationDemandRepository = {
      save: sinon.stub().resolves(token),
    };
    userRepository.checkIfEmailIsAvailable.resolves();

    userToCreateRepository.create.resolves(savedUser);
    emailRepository.sendEmailAsync.resolves();
    userValidator.validate.returns();

    passwordValidator.validate.returns();
    cryptoService.hashPassword.resolves(hashedPassword);

    userService.createUserWithPassword.resolves(savedUser);

    campaignCode = 'AZERTY123';
  });

  context('step validation of data', function () {
    it('should check the non existence of email in UserRepository', async function () {
      // given
      userRepository.checkIfEmailIsAvailable.resolves();

      // when
      await createUser({
        user,
        localeFromHeader,
        password,
        campaignCode,
        authenticationMethodRepository,
        campaignRepository,
        emailRepository,
        emailValidationDemandRepository,
        userRepository,
        userToCreateRepository,
        cryptoService,
        userService,
        userValidator,
        passwordValidator,
      });

      // then
      expect(userRepository.checkIfEmailIsAvailable).to.have.been.calledWithExactly(userEmail);
    });

    it('should validate the user', async function () {
      // when
      await createUser({
        user,
        localeFromHeader,
        password,
        campaignCode,
        authenticationMethodRepository,
        campaignRepository,
        emailRepository,
        emailValidationDemandRepository,
        userRepository,
        userToCreateRepository,
        cryptoService,
        userService,
        userValidator,
        passwordValidator,
      });

      //then
      expect(userValidator.validate).to.have.been.calledWithExactly({ user });
    });

    it('should validate the password', async function () {
      // when
      await createUser({
        user,
        localeFromHeader,
        password,
        campaignCode,
        authenticationMethodRepository,
        campaignRepository,
        emailRepository,
        emailValidationDemandRepository,
        userRepository,
        userToCreateRepository,
        cryptoService,
        userService,
        userValidator,
        passwordValidator,
      });

      // then
      expect(passwordValidator.validate).to.have.been.calledWithExactly(password);
    });

    context('when user email is already used', function () {
      it('should reject with an error EntityValidationError on email already registered', async function () {
        // given
        const emailExistError = new AlreadyRegisteredEmailError('email already exists');
        const expectedValidationError = new EntityValidationError({
          invalidAttributes: [
            {
              attribute: 'email',
              message: 'ALREADY_REGISTERED_EMAIL',
            },
          ],
        });

        userRepository.checkIfEmailIsAvailable.rejects(emailExistError);

        // when
        const error = await catchErr(createUser)({
          user,
          localeFromHeader,
          password,
          campaignCode,
          authenticationMethodRepository,
          campaignRepository,
          emailRepository,
          emailValidationDemandRepository,
          userRepository,
          userToCreateRepository,
          cryptoService,
          userService,
          userValidator,
          passwordValidator,
        });

        // then
        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
      });
    });

    context('when user validator fails', function () {
      it('should reject with an error EntityValidationError containing the entityValidationError', async function () {
        // given
        const expectedValidationError = new EntityValidationError({
          invalidAttributes: [
            {
              attribute: 'firstName',
              message: 'Votre prénom n’est pas renseigné.',
            },
            {
              attribute: 'password',
              message: 'Votre mot de passe n’est pas renseigné.',
            },
          ],
        });

        userValidator.validate.throws(expectedValidationError);

        // when
        const error = await catchErr(createUser)({
          user,
          localeFromHeader,
          password,
          campaignCode,
          authenticationMethodRepository,
          campaignRepository,
          emailRepository,
          emailValidationDemandRepository,
          userRepository,
          userToCreateRepository,
          cryptoService,
          userService,
          userValidator,
          passwordValidator,
        });

        // then
        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
      });
    });

    context('when user email is already in use, user validator fails', function () {
      const entityValidationError = new EntityValidationError({
        invalidAttributes: [
          {
            attribute: 'firstName',
            message: 'Votre prénom n’est pas renseigné.',
          },
          {
            attribute: 'password',
            message: 'Votre mot de passe n’est pas renseigné.',
          },
        ],
      });
      const emailExistError = new AlreadyRegisteredEmailError('email already exists');

      it('should reject with an error EntityValidationError containing the entityValidationError and the AlreadyRegisteredEmailError', async function () {
        // given
        userRepository.checkIfEmailIsAvailable.rejects(emailExistError);
        userValidator.validate.throws(entityValidationError);

        // when
        const error = await catchErr(createUser)({
          user,
          localeFromHeader,
          password,
          campaignCode,
          authenticationMethodRepository,
          campaignRepository,
          emailRepository,
          emailValidationDemandRepository,
          userRepository,
          userToCreateRepository,
          cryptoService,
          userService,
          userValidator,
          passwordValidator,
        });

        // then
        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.invalidAttributes).to.have.lengthOf(3);
      });
    });

    context('when user has accepted terms of service', function () {
      it('should update the validation date', async function () {
        // given
        const user = new User({
          email: userEmail,
          cgu: true,
        });

        // when
        await createUser({
          user,
          localeFromHeader,
          password,
          campaignCode,
          authenticationMethodRepository,
          campaignRepository,
          emailRepository,
          emailValidationDemandRepository,
          userRepository,
          userToCreateRepository,
          cryptoService,
          userService,
          userValidator,
          passwordValidator,
        });

        // then
        expect(user.lastTermsOfServiceValidatedAt).to.be.an.instanceOf(Date);
      });
    });

    context('when user has not accepted terms of service', function () {
      it('should not update the validation date', async function () {
        // given
        const user = new User({
          email: userEmail,
          cgu: false,
        });

        // when
        await createUser({
          user,
          localeFromHeader,
          password,
          campaignCode,
          authenticationMethodRepository,
          campaignRepository,
          emailRepository,
          emailValidationDemandRepository,
          userRepository,
          userToCreateRepository,
          cryptoService,
          userService,
          userValidator,
          passwordValidator,
        });

        // then
        expect(user.lastTermsOfServiceValidatedAt).not.to.be.an.instanceOf(Date);
      });
    });
  });

  context("when user's email is not defined", function () {
    it('should not check the absence of email in UserRepository', async function () {
      // given
      const user = { email: null };

      // when
      await createUser({
        user,
        localeFromHeader,
        password,
        campaignCode,
        authenticationMethodRepository,
        campaignRepository,
        emailRepository,
        emailValidationDemandRepository,
        userRepository,
        cryptoService,
        userService,
        userValidator,
        passwordValidator,
      });

      // then
      expect(userRepository.checkIfEmailIsAvailable).to.not.have.been.called;
    });
  });

  context('when user is valid', function () {
    context('step hash password and save user', function () {
      it('should encrypt the password', async function () {
        // when
        await createUser({
          user,
          localeFromHeader,
          password,
          campaignCode,
          authenticationMethodRepository,
          campaignRepository,
          emailRepository,
          emailValidationDemandRepository,
          userRepository,
          userToCreateRepository,
          cryptoService,
          userService,
          userValidator,
          passwordValidator,
        });

        // then
        expect(cryptoService.hashPassword).to.have.been.calledWithExactly(password);
      });

      it('should throw Error when hash password function fails', async function () {
        // given
        cryptoService.hashPassword.rejects(new Error());

        // when
        const error = await catchErr(createUser)({
          user,
          localeFromHeader,
          password,
          campaignCode,
          authenticationMethodRepository,
          campaignRepository,
          emailRepository,
          emailValidationDemandRepository,
          userRepository,
          userToCreateRepository,
          cryptoService,
          userService,
        });

        // then
        expect(error).to.be.instanceOf(Error);
      });

      it('should save the user with a properly encrypted password', async function () {
        // when
        await createUser({
          user,
          localeFromHeader,
          password,
          campaignCode,
          authenticationMethodRepository,
          campaignRepository,
          emailRepository,
          emailValidationDemandRepository,
          userRepository,
          userToCreateRepository,
          cryptoService,
          userService,

          userValidator,
          passwordValidator,
        });

        // then
        expect(userService.createUserWithPassword).to.have.been.calledWithExactly({
          user,
          hashedPassword,
          userToCreateRepository,
          authenticationMethodRepository,
        });
      });
    });

    context('step send account creation email to user', function () {
      const user = new User({ email: userEmail, locale: localeFromHeader });

      it('should send the account creation email', async function () {
        // given
        campaignRepository.getByCode.resolves({ organizationId: 1 });
        const expectedEmail = createAccountCreationEmail({
          email: userEmail,
          firstName: user.firstName,
          locale: localeFromHeader,
          token,
          redirectionUrl: `https://app.pix.fr/campagnes/${campaignCode}`,
        });

        // when
        await createUser({
          user,
          localeFromHeader,
          password,
          campaignCode,
          authenticationMethodRepository,
          campaignRepository,
          emailRepository,
          emailValidationDemandRepository,
          userRepository,
          userToCreateRepository,
          cryptoService,
          userService,
          userValidator,
          passwordValidator,
        });

        // then
        expect(emailRepository.sendEmailAsync).to.have.been.calledWithExactly(expectedEmail);
      });

      describe('when campaignCode is null', function () {
        campaignCode = null;

        it('should send the account creation email with null redirectionUrl', async function () {
          // given
          const expectedEmail = createAccountCreationEmail({
            email: userEmail,
            firstName: user.firstName,
            locale: localeFromHeader,
            token,
            redirectionUrl: null,
          });

          // when
          await createUser({
            user,
            localeFromHeader,
            password,
            campaignCode,
            authenticationMethodRepository,
            campaignRepository,
            emailRepository,
            emailValidationDemandRepository,
            userRepository,
            userToCreateRepository,
            cryptoService,
            userService,
            userValidator,
            passwordValidator,
          });

          // then
          expect(emailRepository.sendEmailAsync).to.have.been.calledWithExactly(expectedEmail);
        });
      });

      describe('when campaignCode is not valid', function () {
        campaignCode = 'NOT-VALID';

        it('should send the account creation email with null redirectionUrl', async function () {
          // given
          campaignRepository.getByCode.resolves(null);
          const expectedEmail = createAccountCreationEmail({
            email: userEmail,
            firstName: user.firstName,
            locale: localeFromHeader,
            token,
            redirectionUrl: null,
          });

          // when
          await createUser({
            user,
            localeFromHeader,
            password,
            campaignCode,
            authenticationMethodRepository,
            campaignRepository,
            emailRepository,
            emailValidationDemandRepository,
            userRepository,
            userToCreateRepository,
            cryptoService,
            userService,
            userValidator,
            passwordValidator,
          });

          // then
          expect(emailRepository.sendEmailAsync).to.have.been.calledWithExactly(expectedEmail);
        });
      });
    });

    it('returns saved user', async function () {
      // given
      campaignRepository.getByCode.resolves({ organizationId: 1 });
      const redirectionUrl = 'https://redirect.uri';
      sinon.stub(urlBuilder, 'getCampaignUrl').returns(redirectionUrl);
      emailRepository.sendEmailAsync.resolves();

      const expectedEmail = createAccountCreationEmail({
        email: userEmail,
        firstName: user.firstName,
        locale: localeFromHeader,
        token,
        redirectionUrl,
      });

      // when
      const createdUser = await createUser({
        user,
        localeFromHeader,
        password,
        campaignCode,
        authenticationMethodRepository,
        campaignRepository,
        emailRepository,
        emailValidationDemandRepository,
        userRepository,
        userToCreateRepository,
        cryptoService,
        userService,
        userValidator,
        passwordValidator,
      });

      // then
      expect(emailValidationDemandRepository.save).to.have.been.calledWith(userId);
      expect(emailRepository.sendEmailAsync).to.have.been.calledWith(expectedEmail);
      expect(createdUser).to.deep.equal(savedUser);
    });
  });
});
