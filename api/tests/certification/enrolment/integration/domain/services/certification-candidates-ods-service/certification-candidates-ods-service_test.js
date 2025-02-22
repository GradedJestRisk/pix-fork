import fs from 'node:fs';
import * as url from 'node:url';

import * as complementaryCertificationRepository from '../../../../../../../src/certification/complementary-certification/infrastructure/repositories/complementary-certification-repository.js';
import * as certificationCandidatesOdsService from '../../../../../../../src/certification/enrolment/domain/services/certification-candidates-ods-service.js';
import * as centerRepository from '../../../../../../../src/certification/enrolment/infrastructure/repositories/center-repository.js';
import * as certificationCpfCityRepository from '../../../../../../../src/certification/enrolment/infrastructure/repositories/certification-cpf-city-repository.js';
import * as certificationCpfCountryRepository from '../../../../../../../src/certification/enrolment/infrastructure/repositories/certification-cpf-country-repository.js';
import {
  BILLING_MODES,
  CERTIFICATION_FEATURES,
} from '../../../../../../../src/certification/shared/domain/constants.js';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../../../src/certification/shared/domain/constants/certification-candidates-errors.js';
import { ComplementaryCertificationKeys } from '../../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import * as certificationCpfService from '../../../../../../../src/certification/shared/domain/services/certification-cpf-service.js';
import { CertificationCandidatesError } from '../../../../../../../src/shared/domain/errors.js';
import { getI18n } from '../../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { catchErr, databaseBuilder, domainBuilder, expect, sinon } from '../../../../../../test-helper.js';

const { promises } = fs;

const { readFile } = promises;

const i18n = getI18n();

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Services | extractCertificationCandidatesFromCandidatesImportSheet', function () {
  let userId;
  let sessionId, session;
  let mailCheck;
  let candidateList;
  let cleaComplementaryCertification;

  beforeEach(async function () {
    cleaComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
      label: 'CléA Numérique',
      key: ComplementaryCertificationKeys.CLEA,
    });
    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ isV3Pilot: false }).id;
    userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
    const sessionData = databaseBuilder.factory.buildSession({ certificationCenterId });
    sessionId = sessionData.id;
    session = domainBuilder.certification.enrolment.buildSession(sessionData);

    databaseBuilder.factory.buildCertificationCpfCountry({
      code: '99100',
      commonName: 'FRANCE',
      originalName: 'FRANCE',
      matcher: 'ACEFNR',
    });
    databaseBuilder.factory.buildCertificationCpfCountry({
      code: '99132',
      commonName: 'ANGLETERRE',
      originalName: 'ANGLETERRE',
      matcher: 'AEEEGLNRRT',
    });

    databaseBuilder.factory.buildCertificationCpfCity({ name: 'AJACCIO', INSEECode: '2A004', isActualName: true });
    databaseBuilder.factory.buildCertificationCpfCity({ name: 'PARIS 18', postalCode: '75018', isActualName: true });
    databaseBuilder.factory.buildCertificationCpfCity({
      name: 'SAINT-ANNE',
      postalCode: '97180',
      isActualName: true,
    });

    databaseBuilder.factory.buildCertificationCpfCity({
      name: 'BUELLAS',
      postalCode: '01310',
      INSEECode: '01065',
    });
    await databaseBuilder.commit();

    mailCheck = { checkDomainIsValid: sinon.stub() };

    candidateList = _buildCandidateList({ sessionId });
  });

  it('should throw a CertificationCandidatesError if there is an error in the file', async function () {
    // given
    const odsFilePath = `${__dirname}/attendance_sheet_extract_mandatory_ko_test.ods`;
    const odsBuffer = await readFile(odsFilePath);
    mailCheck.checkDomainIsValid.resolves();

    // when
    const error = await catchErr(
      certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet,
    )({
      i18n,
      session,
      odsBuffer,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
      centerRepository,
      complementaryCertificationRepository,
      isSco: true,
      mailCheck,
    });

    // then
    expect(error).to.be.instanceOf(CertificationCandidatesError);
    expect(error.code).to.equal('CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID');
    expect(error.meta).to.deep.equal({ line: 13, value: 'destinataire@gmail.com, destinataire@gmail.com' });
  });

  it('should throw a CertificationCandidatesError if there is an error in the birth information', async function () {
    // given
    const odsFilePath = `${__dirname}/attendance_sheet_extract_birth_ko_test.ods`;
    const odsBuffer = await readFile(odsFilePath);
    mailCheck.checkDomainIsValid.resolves();

    // when
    const error = await catchErr(
      certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet,
    )({
      i18n,
      session,
      odsBuffer,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
      centerRepository,
      complementaryCertificationRepository,
      isSco: true,
      mailCheck,
    });

    // then
    expect(error).to.be.instanceOf(CertificationCandidatesError);
    expect(error.code).to.equal(CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_FOREIGN_INSEE_CODE_NOT_VALID.code);
  });

  it('should throw a CertificationCandidatesError if there are email errors', async function () {
    // given
    const odsFilePath = `${__dirname}/attendance_sheet_extract_recipient_email_ko_test.ods`;
    const odsBuffer = await readFile(odsFilePath);
    mailCheck.checkDomainIsValid.withArgs('jack@d.it').throws();

    // when
    const error = await catchErr(
      certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet,
    )({
      i18n,
      session,
      odsBuffer,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
      centerRepository,
      complementaryCertificationRepository,
      isSco: true,
      mailCheck,
    });

    // then
    const certificationCandidatesError = new CertificationCandidatesError({
      code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID.code,
      meta: { email: 'jack@d.it', line: 1 },
    });

    expect(error).to.deepEqualInstance(certificationCandidatesError);
  });

  context('when there is duplicate certification candidate', function () {
    it('should throw a CertificationCandidatesError', async function () {
      // given
      const odsFilePath = `${__dirname}/attendance_sheet_extract_duplicate_candidate_ko_test.ods`;
      const odsBuffer = await readFile(odsFilePath);

      // when
      const error = await catchErr(
        certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet,
      )({
        i18n,
        session,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        centerRepository,
        complementaryCertificationRepository,
        isSco: true,
        mailCheck,
      });

      // then
      const certificationCandidatesError = new CertificationCandidatesError({
        code: CERTIFICATION_CANDIDATES_ERRORS.DUPLICATE_CANDIDATE.code,
        meta: { line: 14 },
      });

      expect(error).to.deepEqualInstance(certificationCandidatesError);
    });
  });

  it('should return extracted and validated certification candidates', async function () {
    // given
    const isSco = true;
    const odsFilePath = `${__dirname}/attendance_sheet_extract_ok_test.ods`;
    const odsBuffer = await readFile(odsFilePath);

    // when
    const actualCandidates =
      await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
        i18n,
        session,
        isSco,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        centerRepository,
        complementaryCertificationRepository,
        mailCheck,
      });

    // then
    candidateList = _buildCandidateList({ sessionId });
    const expectedCandidates = candidateList.map(domainBuilder.certification.enrolment.buildCandidate);
    expect(actualCandidates).to.deep.equal(expectedCandidates);
  });

  context('when certification center has habilitations', function () {
    context('when a candidate is imported with more than one complementary certification', function () {
      it('should throw an error', async function () {
        // given
        const pixPlusDroitComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Droit',
          key: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
        });

        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({}).id;
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId,
          complementaryCertificationId: cleaComplementaryCertification.id,
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId,
          complementaryCertificationId: pixPlusDroitComplementaryCertification.id,
        });

        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        const sessionData = databaseBuilder.factory.buildSession({ certificationCenterId });
        const session = domainBuilder.certification.enrolment.buildSession(sessionData);

        await databaseBuilder.commit();

        const odsFilePath = `${__dirname}/attendance_sheet_extract_with_complementary_certifications_ko_test.ods`;
        const odsBuffer = await readFile(odsFilePath);

        // when
        const error = await catchErr(
          certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet,
        )({
          i18n,
          session,
          odsBuffer,
          certificationCpfService,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
          centerRepository,
          complementaryCertificationRepository,
          isSco: false,
          mailCheck,
        });

        // then
        expect(error).to.deepEqualInstance(
          new CertificationCandidatesError({
            code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_MAX_ONE_COMPLEMENTARY_CERTIFICATION.code,
            message: 'A candidate cannot have more than one complementary certification',
            meta: {
              line: 13,
            },
          }),
        );
      });
    });

    context('when isCoreComplementaryCompatibilityEnabled false for center', function () {
      const isV3Pilot = false;

      it('should return extracted and validated certification candidates with complementary certification', async function () {
        // given
        mailCheck.checkDomainIsValid.resolves();
        const pixPlusDroitComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Droit',
          key: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
        });
        const pixPlusEdu1erDegreComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Édu 1er degré',
          key: ComplementaryCertificationKeys.PIX_PLUS_EDU_1ER_DEGRE,
        });
        const pixPlusEdu2ndDegreComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Édu 2nd degré',
          key: ComplementaryCertificationKeys.PIX_PLUS_EDU_2ND_DEGRE,
        });
        const PixPlusProSanteComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Pro Santé',
          key: ComplementaryCertificationKeys.PIX_PLUS_PRO_SANTE,
        });

        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          isV3Pilot,
        }).id;
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId,
          complementaryCertificationId: cleaComplementaryCertification.id,
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId,
          complementaryCertificationId: pixPlusDroitComplementaryCertification.id,
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId,
          complementaryCertificationId: pixPlusEdu1erDegreComplementaryCertification.id,
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId,
          complementaryCertificationId: pixPlusEdu2ndDegreComplementaryCertification.id,
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId,
          complementaryCertificationId: PixPlusProSanteComplementaryCertification.id,
        });

        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        const sessionData = databaseBuilder.factory.buildSession({ certificationCenterId });
        const session = domainBuilder.certification.enrolment.buildSession(sessionData);

        await databaseBuilder.commit();

        const odsFilePath = `${__dirname}/attendance_sheet_extract_with_complementary_certifications_ok_test.ods`;
        const odsBuffer = await readFile(odsFilePath);
        candidateList = _buildCandidateList({
          sessionId: sessionData.id,
          complementaryCertifications: [
            pixPlusEdu1erDegreComplementaryCertification,
            pixPlusDroitComplementaryCertification,
            cleaComplementaryCertification,
            pixPlusEdu2ndDegreComplementaryCertification,
            PixPlusProSanteComplementaryCertification,
          ],
        });
        const expectedCandidates = candidateList.map(domainBuilder.certification.enrolment.buildCandidate);

        // when
        const actualCandidates =
          await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
            i18n,
            session,
            odsBuffer,
            certificationCpfService,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
            centerRepository,
            complementaryCertificationRepository,
            isSco: false,
            mailCheck,
          });

        // then
        expect(actualCandidates).to.deep.equal(expectedCandidates);
      });
    });

    context('when isCoreComplementaryCompatibilityEnabled true for center', function () {
      const isV3Pilot = true;
      let pixPlusEdu1erDegreComplementaryCertification,
        pixPlusDroitComplementaryCertification,
        pixPlusEdu2ndDegreComplementaryCertification,
        PixPlusProSanteComplementaryCertification;
      let sessionData, session;

      beforeEach(function () {
        mailCheck.checkDomainIsValid.resolves();
        pixPlusDroitComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Droit',
          key: ComplementaryCertificationKeys.PIX_PLUS_DROIT,
        });
        pixPlusEdu1erDegreComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Édu 1er degré',
          key: ComplementaryCertificationKeys.PIX_PLUS_EDU_1ER_DEGRE,
        });
        pixPlusEdu2ndDegreComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Édu 2nd degré',
          key: ComplementaryCertificationKeys.PIX_PLUS_EDU_2ND_DEGRE,
        });
        PixPlusProSanteComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Pro Santé',
          key: ComplementaryCertificationKeys.PIX_PLUS_PRO_SANTE,
        });
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          isV3Pilot,
        }).id;
        const complementaryAlonePilotFeatureId = databaseBuilder.factory.buildFeature(
          CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE,
        ).id;
        databaseBuilder.factory.buildCertificationCenterFeature({
          certificationCenterId,
          featureId: complementaryAlonePilotFeatureId,
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId,
          complementaryCertificationId: cleaComplementaryCertification.id,
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId,
          complementaryCertificationId: pixPlusDroitComplementaryCertification.id,
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId,
          complementaryCertificationId: pixPlusEdu1erDegreComplementaryCertification.id,
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId,
          complementaryCertificationId: pixPlusEdu2ndDegreComplementaryCertification.id,
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId,
          complementaryCertificationId: PixPlusProSanteComplementaryCertification.id,
        });

        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCenterMembership({ userId, certificationCenterId });
        sessionData = databaseBuilder.factory.buildSession({ certificationCenterId });
        session = domainBuilder.certification.enrolment.buildSession(sessionData);

        return databaseBuilder.commit();
      });

      it('should return extracted and validated certification candidates with appropriate certification subscription', async function () {
        // given
        const odsFilePath = `${__dirname}/attendance_sheet_extract_with_complementary_certifications_compatibility_ok_test.ods`;
        const odsBuffer = await readFile(odsFilePath);
        candidateList = _buildCandidateList({
          sessionId: sessionData.id,
          complementaryCertifications: [
            pixPlusEdu1erDegreComplementaryCertification,
            pixPlusDroitComplementaryCertification,
            cleaComplementaryCertification,
            pixPlusEdu2ndDegreComplementaryCertification,
            PixPlusProSanteComplementaryCertification,
          ],
          ftEnabled: true,
        });
        const expectedCandidates = candidateList.map(domainBuilder.certification.enrolment.buildCandidate);

        // when
        const actualCandidates =
          await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
            i18n,
            session,
            odsBuffer,
            certificationCpfService,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
            centerRepository,
            complementaryCertificationRepository,
            isSco: false,
            mailCheck,
          });

        // then
        expect(actualCandidates).to.deep.equal(expectedCandidates);
      });

      it('should throw an error', async function () {
        // given
        const odsFilePath = `${__dirname}/attendance_sheet_extract_with_complementary_certifications_compatibility_ko_test.ods`;
        const odsBuffer = await readFile(odsFilePath);

        // when
        const error = await catchErr(
          certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet,
        )({
          i18n,
          session,
          odsBuffer,
          certificationCpfService,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
          centerRepository,
          complementaryCertificationRepository,
          isSco: false,
          mailCheck,
        });

        // then
        expect(error).to.deepEqualInstance(
          new CertificationCandidatesError({
            code: CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_WRONG_SUBSCRIPTIONS_COMPATIBILITY.code,
            message: 'A candidate cannot have more than one subscription to a certification',
            meta: {
              line: 14,
            },
          }),
        );
      });
    });
  });

  it('should return extracted and validated certification candidates with billing information', async function () {
    // given
    mailCheck.checkDomainIsValid.resolves();
    const isSco = false;

    const odsFilePath = `${__dirname}/attendance_sheet_extract_with_billing_ok_test.ods`;
    const odsBuffer = await readFile(odsFilePath);
    candidateList = _buildCandidateList({ hasBillingMode: true, sessionId });
    const expectedCandidates = candidateList.map(domainBuilder.certification.enrolment.buildCandidate);

    // when
    const actualCandidates =
      await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
        i18n,
        session,
        isSco,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        centerRepository,
        complementaryCertificationRepository,
        mailCheck,
      });

    // then
    expect(actualCandidates).to.deep.equal(expectedCandidates);
  });

  it('should return extracted and validated certification candidates without billing information when certification center is AEFE', async function () {
    // given
    const isSco = true;
    const odsFilePath = `${__dirname}/attendance_sheet_extract_ok_test.ods`;
    const odsBuffer = await readFile(odsFilePath);
    mailCheck.checkDomainIsValid.resolves();

    // when
    const actualCandidates =
      await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
        i18n,
        session,
        isSco,
        odsBuffer,
        certificationCpfService,
        certificationCpfCountryRepository,
        certificationCpfCityRepository,
        centerRepository,
        complementaryCertificationRepository,
        mailCheck,
      });

    // then
    const expectedCandidates = candidateList.map(domainBuilder.certification.enrolment.buildCandidate);
    expect(actualCandidates).to.deep.equal(expectedCandidates);
  });
});

function _buildCandidateList({
  hasBillingMode = false,
  sessionId,
  complementaryCertifications = [],
  ftEnabled = false,
}) {
  const firstCandidate = {
    id: null,
    sessionId,
    createdAt: null,
    lastName: 'Gallagher',
    firstName: 'Jack',
    birthdate: '1980-08-10',
    sex: 'M',
    birthCity: 'Londres',
    birthCountry: 'ANGLETERRE',
    birthINSEECode: '99132',
    birthPostalCode: null,
    birthProvinceCode: null,
    resultRecipientEmail: 'destinataire@gmail.com',
    email: 'jack@d.it',
    externalId: null,
    extraTimePercentage: 0.15,
    billingMode: hasBillingMode ? BILLING_MODES.PAID : null,
    prepaymentCode: null,
    subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
    organizationLearnerId: null,
    userId: null,
  };
  const secondCandidate = {
    id: null,
    sessionId,
    createdAt: null,
    lastName: 'Jackson',
    firstName: 'Janet',
    birthdate: '2005-12-05',
    sex: 'F',
    birthCity: 'AJACCIO',
    birthCountry: 'FRANCE',
    birthINSEECode: '2A004',
    birthPostalCode: null,
    birthProvinceCode: null,
    resultRecipientEmail: 'destinataire@gmail.com',
    email: 'jaja@hotmail.fr',
    externalId: 'DEF456',
    extraTimePercentage: null,
    billingMode: hasBillingMode ? BILLING_MODES.FREE : null,
    prepaymentCode: null,
    subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
    organizationLearnerId: null,
    userId: null,
  };
  const thirdCandidate = {
    id: null,
    sessionId,
    createdAt: null,
    lastName: 'Jackson',
    firstName: 'Michael',
    birthdate: '2004-04-04',
    sex: 'M',
    birthCity: 'PARIS 18',
    birthCountry: 'FRANCE',
    birthINSEECode: null,
    birthPostalCode: '75018',
    birthProvinceCode: null,
    resultRecipientEmail: 'destinataire@gmail.com',
    email: 'jackson@gmail.com',
    externalId: 'ABC123',
    extraTimePercentage: 0.6,
    billingMode: hasBillingMode ? BILLING_MODES.FREE : null,
    prepaymentCode: null,
    subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
    organizationLearnerId: null,
    userId: null,
  };
  const fourthCandidate = {
    id: null,
    sessionId,
    createdAt: null,
    lastName: 'Mercury',
    firstName: 'Freddy',
    birthdate: '1925-06-28',
    sex: 'M',
    birthCity: 'SAINT-ANNE',
    birthCountry: 'FRANCE',
    birthINSEECode: null,
    birthPostalCode: '97180',
    birthProvinceCode: null,
    resultRecipientEmail: null,
    email: null,
    externalId: 'GHI789',
    extraTimePercentage: 1.5,
    billingMode: hasBillingMode ? BILLING_MODES.PREPAID : null,
    prepaymentCode: hasBillingMode ? 'CODE1' : null,
    subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
    organizationLearnerId: null,
    userId: null,
  };
  const fifthCandidate = {
    id: null,
    sessionId,
    createdAt: null,
    firstName: 'Annie',
    lastName: 'Cordy',
    birthCity: 'BUELLAS',
    birthCountry: 'FRANCE',
    birthPostalCode: '01310',
    birthINSEECode: null,
    birthProvinceCode: null,
    sex: 'M',
    email: null,
    resultRecipientEmail: null,
    externalId: 'GHI769',
    birthdate: '1928-06-16',
    extraTimePercentage: 1.5,
    billingMode: null,
    prepaymentCode: null,
    subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
    organizationLearnerId: null,
    userId: null,
  };
  const sixthCandidate = {
    id: null,
    sessionId,
    createdAt: null,
    firstName: 'Demis',
    lastName: 'Roussos',
    birthCity: 'BUELLAS',
    birthCountry: 'FRANCE',
    birthPostalCode: null,
    birthINSEECode: '01065',
    birthProvinceCode: null,
    sex: 'M',
    email: null,
    resultRecipientEmail: null,
    externalId: 'GHI799',
    birthdate: '1946-06-15',
    extraTimePercentage: 1.5,
    billingMode: null,
    prepaymentCode: null,
    subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
    organizationLearnerId: null,
    userId: null,
  };
  if (hasBillingMode) {
    return [firstCandidate, secondCandidate, thirdCandidate, fourthCandidate];
  }
  if (complementaryCertifications.length > 0) {
    const seventhCandidate = {
      sessionId,
      id: null,
      createdAt: null,
      lastName: 'Cendy',
      firstName: 'Alain',
      birthdate: '1988-06-28',
      sex: 'M',
      birthCity: 'SAINT-ANNE',
      birthCountry: 'FRANCE',
      birthINSEECode: null,
      birthPostalCode: '97180',
      birthProvinceCode: null,
      resultRecipientEmail: null,
      email: null,
      externalId: 'SDQ987',
      extraTimePercentage: null,
      organizationLearnerId: null,
      userId: null,
      billingMode: BILLING_MODES.FREE,
      subscriptions: [domainBuilder.buildCoreSubscription({ certificationCandidateId: null })],
      prepaymentCode: null,
    };
    if (ftEnabled) {
      firstCandidate.subscriptions = [
        domainBuilder.buildComplementarySubscription({
          certificationCandidateId: null,
          complementaryCertificationId: complementaryCertifications[0].id,
        }),
      ];
      secondCandidate.subscriptions = [
        domainBuilder.buildComplementarySubscription({
          certificationCandidateId: null,
          complementaryCertificationId: complementaryCertifications[1].id,
        }),
      ];
      // CLEA
      thirdCandidate.subscriptions.push(
        domainBuilder.buildComplementarySubscription({
          certificationCandidateId: null,
          complementaryCertificationId: complementaryCertifications[2].id,
        }),
      );
      fourthCandidate.subscriptions = [
        domainBuilder.buildComplementarySubscription({
          certificationCandidateId: null,
          complementaryCertificationId: complementaryCertifications[3].id,
        }),
      ];
      seventhCandidate.subscriptions = [
        domainBuilder.buildComplementarySubscription({
          certificationCandidateId: null,
          complementaryCertificationId: complementaryCertifications[4].id,
        }),
      ];
    } else {
      firstCandidate.subscriptions.push(
        domainBuilder.buildComplementarySubscription({
          certificationCandidateId: null,
          complementaryCertificationId: complementaryCertifications[0].id,
        }),
      );
      secondCandidate.subscriptions.push(
        domainBuilder.buildComplementarySubscription({
          certificationCandidateId: null,
          complementaryCertificationId: complementaryCertifications[1].id,
        }),
      );
      thirdCandidate.subscriptions.push(
        domainBuilder.buildComplementarySubscription({
          certificationCandidateId: null,
          complementaryCertificationId: complementaryCertifications[2].id,
        }),
      );
      fourthCandidate.subscriptions.push(
        domainBuilder.buildComplementarySubscription({
          certificationCandidateId: null,
          complementaryCertificationId: complementaryCertifications[3].id,
        }),
      );
      seventhCandidate.subscriptions.push(
        domainBuilder.buildComplementarySubscription({
          certificationCandidateId: null,
          complementaryCertificationId: complementaryCertifications[4].id,
        }),
      );
    }
    firstCandidate.billingMode = BILLING_MODES.FREE;
    secondCandidate.billingMode = BILLING_MODES.FREE;
    thirdCandidate.billingMode = BILLING_MODES.FREE;
    fourthCandidate.billingMode = BILLING_MODES.FREE;
    fifthCandidate.billingMode = BILLING_MODES.FREE;
    if (ftEnabled)
      return [firstCandidate, secondCandidate, thirdCandidate, fourthCandidate, seventhCandidate, fifthCandidate];
    return [firstCandidate, secondCandidate, thirdCandidate, fourthCandidate, seventhCandidate];
  }
  return [firstCandidate, secondCandidate, thirdCandidate, fourthCandidate, fifthCandidate, sixthCandidate];
}
