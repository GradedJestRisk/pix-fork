import * as certificateRepository from '../../../../../../src/certification/results/infrastructure/repositories/certificate-repository.js';
import { AutoJuryCommentKeys } from '../../../../../../src/certification/shared/domain/models/JuryComment.js';
import { SESSIONS_VERSIONS } from '../../../../../../src/certification/shared/domain/models/SessionVersion.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { status } from '../../../../../../src/shared/domain/models/AssessmentResult.js';
import {
  catchErr,
  databaseBuilder,
  domainBuilder,
  expect,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../../test-helper.js';

describe('Integration | Infrastructure | Repository | Certification', function () {
  const minimalLearningContent = [
    {
      id: 'recArea0',
      code: '1',
      competences: [
        {
          id: 'recNv8qhaY887jQb2',
          index: '1.3',
          name: 'Traiter des données',
        },
      ],
    },
  ];

  describe('#getCertificationAttestation', function () {
    it('should throw a NotFoundError when certification attestation does not exist', async function () {
      // when
      const error = await catchErr(certificateRepository.getCertificationAttestation)({ certificationCourseId: 123 });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should throw a NotFoundError when certification has no assessment-result', async function () {
      // given
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        certifiedBadges: [],
        sessionId: 789,
      };
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildIncomplete(certificationAttestationData);
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getCertificationAttestation)({
        certificationCourseId: certificationAttestationData.id,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should throw a NotFoundError when certification is cancelled', async function () {
      // given
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        certifiedBadges: [],
        sessionId: 789,
      };
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildCancelled(certificationAttestationData);
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getCertificationAttestation)({
        certificationCourseId: certificationAttestationData.id,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should throw a NotFoundError when certification is not published', async function () {
      // given
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: false,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        certifiedBadges: [],
        sessionId: 789,
      };
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildValidCertificationAttestation(certificationAttestationData);
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getCertificationAttestation)({
        certificationCourseId: certificationAttestationData.id,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should throw a NotFoundError when certification is rejected', async function () {
      // given
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        certifiedBadges: [],
        sessionId: 789,
      };
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildRejected(certificationAttestationData);
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getCertificationAttestation)({
        certificationCourseId: certificationAttestationData.id,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with id "123"');
    });

    it('should return a CertificationAttestation', async function () {
      // given
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);

      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        certifiedBadges: [],
        sessionId: 789,
      };
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildValidCertificationAttestation(certificationAttestationData);
      await databaseBuilder.commit();

      // when
      const certificationAttestation = await certificateRepository.getCertificationAttestation({
        certificationCourseId: 123,
      });

      // then
      const expectedCertificationAttestation =
        domainBuilder.buildCertificationAttestation(certificationAttestationData);
      expect(certificationAttestation).to.deepEqualInstanceOmitting(expectedCertificationAttestation, [
        'resultCompetenceTree',
      ]);
    });

    it('should return a CertificationAttestation with appropriate result competence tree', async function () {
      // given
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        certifiedBadges: [],
        sessionId: 789,
      };
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      const assessmentResultId = _buildValidCertificationAttestation(certificationAttestationData, false);

      const competenceMarks1 = domainBuilder.buildCompetenceMark({
        id: 1234,
        level: 4,
        score: 32,
        area_code: '1',
        competence_code: '1.1',
        competenceId: 'recComp1',
        assessmentResultId,
      });
      databaseBuilder.factory.buildCompetenceMark(competenceMarks1);

      const competenceMarks2 = domainBuilder.buildCompetenceMark({
        id: 4567,
        level: 5,
        score: 40,
        area_code: '1',
        competence_code: '1.2',
        competenceId: 'recComp2',
        assessmentResultId,
      });
      databaseBuilder.factory.buildCompetenceMark(competenceMarks2);

      await databaseBuilder.commit();

      const competence1 = domainBuilder.buildCompetence({
        id: 'recComp1',
        index: '1.1',
        name: 'Traiter des données',
      });
      const competence2 = domainBuilder.buildCompetence({
        id: 'recComp2',
        index: '1.2',
        name: 'Traiter des choux',
      });
      const area1 = domainBuilder.buildArea({
        id: 'recArea1',
        code: '1',
        competences: [
          { ...competence1, name_i18n: { fr: competence1.name } },
          { ...competence2, name_i18n: { fr: competence2.name } },
        ],
        title: 'titre test',
        framework: null,
      });

      const learningContentObjects = learningContentBuilder.fromAreas([{ ...area1, title_i18n: { fr: area1.title } }]);
      mockLearningContent(learningContentObjects);

      // when
      const certificationAttestation = await certificateRepository.getCertificationAttestation({
        certificationCourseId: 123,
      });

      // then
      const expectedResultCompetenceTree = domainBuilder.buildResultCompetenceTree({
        id: `123-${assessmentResultId}`,
        competenceMarks: [competenceMarks1, competenceMarks2],
        competenceTree: domainBuilder.buildCompetenceTree({ areas: [area1] }),
      });
      expect(certificationAttestation.resultCompetenceTree).to.deepEqualInstance(expectedResultCompetenceTree);
    });

    it('should take into account the latest validated assessment result of a student', async function () {
      // given
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        certifiedBadges: [],
        sessionId: 789,
      };

      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildCertificationAttestationWithSeveralResults(certificationAttestationData);
      await databaseBuilder.commit();

      // when
      const certificationAttestation = await certificateRepository.getCertificationAttestation({
        certificationCourseId: certificationAttestationData.id,
      });

      // then
      const expectedCertificationAttestation =
        domainBuilder.buildCertificationAttestation(certificationAttestationData);
      expect(certificationAttestation).to.deepEqualInstanceOmitting(expectedCertificationAttestation, [
        'resultCompetenceTree',
      ]);
    });

    context('acquired certifiable badges', function () {
      it(`should get the certified badge images when the certifications were acquired`, async function () {
        // given
        const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
        mockLearningContent(learningContentObjects);
        const certificationAttestationData = {
          id: 123,
          firstName: 'Sarah Michelle',
          lastName: 'Gellar',
          birthdate: '1977-04-14',
          birthplace: 'Saint-Ouen',
          isPublished: true,
          userId: 456,
          date: new Date('2020-01-01'),
          verificationCode: 'P-SOMECODE',
          maxReachableLevelOnCertificationDate: 5,
          deliveredAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          pixScore: 51,
          certifiedBadges: [
            {
              isTemporaryBadge: false,
              label: 'Pix+ Test 1',
              imageUrl: 'https://images.pix.fr/badge1.svg',
              stickerUrl: 'https://images.pix.fr/skicker1.pdf',
              message: 'Pix+ Test 1 certificate message',
            },
            {
              isTemporaryBadge: true,
              label: 'Pix+ Test 2',
              imageUrl: 'https://images.pix.fr/badge2.svg',
              stickerUrl: 'https://images.pix.fr/skicker2.pdf',
              message: 'Pix+ Test 2 temporary certificate message',
            },
          ],
          sessionId: 789,
        };

        _buildSession({
          userId: certificationAttestationData.userId,
          sessionId: certificationAttestationData.sessionId,
          publishedAt: certificationAttestationData.deliveredAt,
          certificationCenter: certificationAttestationData.certificationCenter,
        });
        _buildValidCertificationAttestation(certificationAttestationData);
        const badge1Id = databaseBuilder.factory.buildBadge({ key: 'PIX_TEST_1' }).id;
        const badge2Id = databaseBuilder.factory.buildBadge({ key: 'PIX_TEST_2' }).id;
        const complementaryCertification1Id = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Test 1',
          hasExternalJury: false,
          key: 'A',
        }).id;
        const complementaryCertification2Id = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Test 2',
          hasExternalJury: true,
          key: 'B',
        }).id;
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 21,
          label: 'Pix+ Test 1',
          badgeId: badge1Id,
          complementaryCertificationId: complementaryCertification1Id,
          imageUrl: 'https://images.pix.fr/badge1.svg',
          stickerUrl: 'https://images.pix.fr/skicker1.pdf',
          certificateMessage: 'Pix+ Test 1 certificate message',
          temporaryCertificateMessage: '',
        }).id;
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 22,
          label: 'Pix+ Test 2',
          badgeId: badge2Id,
          complementaryCertificationId: complementaryCertification2Id,
          imageUrl: 'https://images.pix.fr/badge2.svg',
          stickerUrl: 'https://images.pix.fr/skicker2.pdf',
          certificateMessage: 'Pix+ Test 2 certificate message',
          temporaryCertificateMessage: 'Pix+ Test 2 temporary certificate message',
        }).id;

        databaseBuilder.factory.buildComplementaryCertificationCourse({
          id: 998,
          certificationCourseId: 123,
          complementaryCertificationId: complementaryCertification1Id,
          complementaryCertificationBadgeId: 21,
        });
        databaseBuilder.factory.buildComplementaryCertificationCourse({
          id: 999,
          certificationCourseId: 123,
          complementaryCertificationId: complementaryCertification2Id,
          complementaryCertificationBadgeId: 22,
        });
        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 998,
          complementaryCertificationBadgeId: 21,
          acquired: true,
        });
        databaseBuilder.factory.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 999,
          complementaryCertificationBadgeId: 22,
          acquired: true,
        });
        await databaseBuilder.commit();

        // when
        const certificationAttestation = await certificateRepository.getCertificationAttestation({
          certificationCourseId: 123,
        });

        // then
        const expectedCertificationAttestation =
          domainBuilder.buildCertificationAttestation(certificationAttestationData);
        expect(certificationAttestation).deepEqualInstanceOmitting(expectedCertificationAttestation, [
          'resultCompetenceTree',
        ]);
      });
    });
  });

  describe('#findByDivisionForScoIsManagingStudentsOrganization', function () {
    it('should return an empty array when there are no certification attestations for given organization', async function () {
      // given
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      databaseBuilder.factory.buildOrganization({ id: 456, type: 'SCO', isManagingStudents: true });
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildValidCertificationAttestation(certificationAttestationData);
      _linkCertificationAttestationToOrganization({
        certificationAttestationData,
        organizationId: 456,
        division: '3emeB',
      });
      await databaseBuilder.commit();

      // when
      const certificationAttestations = await certificateRepository.findByDivisionForScoIsManagingStudentsOrganization({
        organizationId: 123,
        division: '3emeB',
      });

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should return an empty array when the organization is not SCO IS MANAGING STUDENTS', async function () {
      // given
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SUP', isManagingStudents: false });
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      _buildSession({
        userId: 456,
        sessionId: 789,
        publishedAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
      });
      _buildValidCertificationAttestation(certificationAttestationData);
      _linkCertificationAttestationToOrganization({
        certificationAttestationData,
        organizationId: 123,
        division: '3emeB',
      });
      await databaseBuilder.commit();

      // when
      const certificationAttestations = await certificateRepository.findByDivisionForScoIsManagingStudentsOrganization({
        organizationId: 123,
        division: '3emeB',
      });

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should return an empty array when the certification does not belong to an organization learner in the right division', async function () {
      // given
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildValidCertificationAttestation(certificationAttestationData);
      _linkCertificationAttestationToOrganization({
        certificationAttestationData,
        organizationId: 123,
        division: '5emeG',
      });
      await databaseBuilder.commit();

      // when
      const certificationAttestations = await certificateRepository.findByDivisionForScoIsManagingStudentsOrganization({
        organizationId: 123,
        division: '3emeB',
      });

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should not return certifications that have no validated assessment-result', async function () {
      // given
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildRejected(certificationAttestationData);
      _linkCertificationAttestationToOrganization({
        certificationAttestationData,
        organizationId: 123,
        division: '3emeB',
      });
      await databaseBuilder.commit();

      // when
      const certificationAttestations = await certificateRepository.findByDivisionForScoIsManagingStudentsOrganization({
        organizationId: 123,
        division: '3emeB',
      });

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should not return cancelled certifications', async function () {
      // given
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildCancelled(certificationAttestationData);
      _linkCertificationAttestationToOrganization({
        certificationAttestationData,
        organizationId: 123,
        division: '3emeB',
      });
      await databaseBuilder.commit();

      // when
      const certificationAttestations = await certificateRepository.findByDivisionForScoIsManagingStudentsOrganization({
        organizationId: 123,
        division: '3emeB',
      });

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should not return non published certifications', async function () {
      // given
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      const certificationAttestationData = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: false,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      _buildSession({
        userId: certificationAttestationData.userId,
        sessionId: certificationAttestationData.sessionId,
        publishedAt: certificationAttestationData.deliveredAt,
        certificationCenter: certificationAttestationData.certificationCenter,
      });
      _buildValidCertificationAttestation(certificationAttestationData);
      _linkCertificationAttestationToOrganization({
        certificationAttestationData,
        organizationId: 123,
        division: '3emeB',
      });
      await databaseBuilder.commit();

      // when
      const certificationAttestations = await certificateRepository.findByDivisionForScoIsManagingStudentsOrganization({
        organizationId: 123,
        division: '3emeB',
      });

      // then
      expect(certificationAttestations).to.be.empty;
    });

    it('should return an array of certification attestations ordered by last name, first name', async function () {
      // given
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      const certificationAttestationDataA = {
        id: 456,
        firstName: 'James',
        lastName: 'Marsters',
        birthdate: '1962-08-20',
        birthplace: 'Trouville',
        isPublished: true,
        userId: 111,
        date: new Date('2020-05-01'),
        verificationCode: 'P-SOMEOTHERCODE',
        maxReachableLevelOnCertificationDate: 6,
        deliveredAt: new Date('2021-07-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 23,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 777,
      };
      const certificationAttestationDataB = {
        id: 123,
        firstName: 'Laura',
        lastName: 'Gellar',
        birthdate: '1990-01-04',
        birthplace: 'Torreilles',
        isPublished: true,
        userId: 333,
        date: new Date('2019-01-01'),
        verificationCode: 'P-YETANOTHERCODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2020-05-05'),
        certificationCenter: 'Centre Catalan',
        pixScore: 150,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 999,
      };
      const certificationAttestationDataC = {
        id: 789,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 222,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 888,
      };
      _buildSession({
        userId: certificationAttestationDataA.userId,
        sessionId: certificationAttestationDataA.sessionId,
        publishedAt: certificationAttestationDataA.deliveredAt,
        certificationCenter: certificationAttestationDataA.certificationCenter,
      });
      _buildSession({
        userId: certificationAttestationDataC.userId,
        sessionId: certificationAttestationDataC.sessionId,
        publishedAt: certificationAttestationDataC.deliveredAt,
        certificationCenter: certificationAttestationDataC.certificationCenter,
      });
      _buildSession({
        userId: certificationAttestationDataB.userId,
        sessionId: certificationAttestationDataB.sessionId,
        publishedAt: certificationAttestationDataB.deliveredAt,
        certificationCenter: certificationAttestationDataB.certificationCenter,
      });
      _buildValidCertificationAttestation(certificationAttestationDataA);
      _buildValidCertificationAttestation(certificationAttestationDataB);
      _buildValidCertificationAttestation(certificationAttestationDataC);
      _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataA,
        organizationId: 123,
        division: '3emeB',
      });
      _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataB,
        organizationId: 123,
        division: '3emeB',
      });
      _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataC,
        organizationId: 123,
        division: '3emeB',
      });
      await databaseBuilder.commit();

      // when
      const certificationAttestations = await certificateRepository.findByDivisionForScoIsManagingStudentsOrganization({
        organizationId: 123,
        division: '3emeB',
      });

      // then
      const expectedCertificationAttestationA =
        domainBuilder.buildCertificationAttestation(certificationAttestationDataA);
      const expectedCertificationAttestationB =
        domainBuilder.buildCertificationAttestation(certificationAttestationDataB);
      const expectedCertificationAttestationC =
        domainBuilder.buildCertificationAttestation(certificationAttestationDataC);
      expect(certificationAttestations).to.have.length(3);

      expect(certificationAttestations[0]).deepEqualInstanceOmitting(expectedCertificationAttestationB, [
        'resultCompetenceTree',
      ]);
      expect(certificationAttestations[1]).deepEqualInstanceOmitting(expectedCertificationAttestationC, [
        'resultCompetenceTree',
      ]);
      expect(certificationAttestations[2]).deepEqualInstanceOmitting(expectedCertificationAttestationA, [
        'resultCompetenceTree',
      ]);
    });

    it('should ignore disabled shooling-registrations', async function () {
      // given
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      const certificationAttestationDataA = {
        id: 456,
        firstName: 'James',
        lastName: 'Marsters',
        birthdate: '1962-08-20',
        birthplace: 'Trouville',
        isPublished: true,
        userId: 111,
        date: new Date('2020-05-01'),
        verificationCode: 'P-SOMEOTHERCODE',
        maxReachableLevelOnCertificationDate: 6,
        deliveredAt: new Date('2021-07-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 23,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 777,
      };
      const certificationAttestationDataB = {
        id: 123,
        firstName: 'Laura',
        lastName: 'Gellar',
        birthdate: '1990-01-04',
        birthplace: 'Torreilles',
        isPublished: true,
        userId: 333,
        date: new Date('2019-01-01'),
        verificationCode: 'P-YETANOTHERCODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2020-05-05'),
        certificationCenter: 'Centre Catalan',
        pixScore: 150,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 999,
      };
      const certificationAttestationDataC = {
        id: 789,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 222,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 888,
      };
      _buildSession({
        userId: certificationAttestationDataA.userId,
        sessionId: certificationAttestationDataA.sessionId,
        publishedAt: certificationAttestationDataA.deliveredAt,
        certificationCenter: certificationAttestationDataA.certificationCenter,
      });
      _buildSession({
        userId: certificationAttestationDataC.userId,
        sessionId: certificationAttestationDataC.sessionId,
        publishedAt: certificationAttestationDataC.deliveredAt,
        certificationCenter: certificationAttestationDataC.certificationCenter,
      });
      _buildSession({
        userId: certificationAttestationDataB.userId,
        sessionId: certificationAttestationDataB.sessionId,
        publishedAt: certificationAttestationDataB.deliveredAt,
        certificationCenter: certificationAttestationDataB.certificationCenter,
      });
      _buildValidCertificationAttestation(certificationAttestationDataA);
      _buildValidCertificationAttestation(certificationAttestationDataB);
      _buildValidCertificationAttestation(certificationAttestationDataC);
      _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataA,
        organizationId: 123,
        division: '3emeB',
      });
      _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataB,
        organizationId: 123,
        division: '3emeB',
      });
      _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataC,
        organizationId: 123,
        division: '3emeB',
        isDisabled: true,
      });
      await databaseBuilder.commit();

      // when
      const certificationAttestations = await certificateRepository.findByDivisionForScoIsManagingStudentsOrganization({
        organizationId: 123,
        division: '3emeB',
      });

      // then
      const expectedCertificationAttestationA =
        domainBuilder.buildCertificationAttestation(certificationAttestationDataA);
      const expectedCertificationAttestationB =
        domainBuilder.buildCertificationAttestation(certificationAttestationDataB);

      expect(certificationAttestations).to.have.length(2);
      expect(certificationAttestations[0]).to.deepEqualInstanceOmitting(expectedCertificationAttestationB, [
        'resultCompetenceTree',
      ]);

      expect(certificationAttestations[1]).to.deepEqualInstanceOmitting(expectedCertificationAttestationA, [
        'resultCompetenceTree',
      ]);
    });

    describe('when the last certification is rejected', function () {
      it('should take into account the latest valid certification', async function () {
        // given
        const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
        mockLearningContent(learningContentObjects);
        databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
        const certificationAttestationData = {
          id: 123,
          firstName: 'Sarah Michelle',
          lastName: 'Gellar',
          birthdate: '1977-04-14',
          birthplace: 'Saint-Ouen',
          isPublished: true,
          userId: 456,
          date: new Date('2020-01-01'),
          verificationCode: 'P-SOMECODE',
          maxReachableLevelOnCertificationDate: 5,
          deliveredAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          pixScore: 51,
          cleaCertificationImagePath: null,
          pixPlusDroitCertificationImagePath: null,
          sessionId: 789,
          version: SESSIONS_VERSIONS.V2,
        };
        databaseBuilder.factory.buildUser({ id: 456 });
        databaseBuilder.factory.buildOrganizationLearner({
          id: 55,
          organizationId: 123,
          userId: 456,
          division: '3emeB',
        }).id;
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        databaseBuilder.factory.buildSession({
          id: 789,
          publishedAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          certificationCenterId,
        });

        _buildCertificationAttestationWithSeveralResults(certificationAttestationData, status.VALIDATED);
        _linkCertificationAttestationToOrganization({
          certificationAttestationData,
          organizationLearnerId: 55,
        });

        const certificationAttestationDataRejected = {
          ...certificationAttestationData,
          id: 124,
          date: new Date('2020-01-03'),
          sessionId: 790,
          verificationCode: 'P-SOM3COD3',
        };
        databaseBuilder.factory.buildSession({
          id: 790,
          publishedAt: new Date('2021-05-07'),
          certificationCenter: 'Centre des poules bien dodues',
          certificationCenterId,
          version: SESSIONS_VERSIONS.V2,
        });
        _buildCertificationAttestationWithSeveralResults(certificationAttestationDataRejected, status.REJECTED);
        const candidate = databaseBuilder.factory.buildCertificationCandidate({
          userId: 456,
          sessionId: certificationAttestationDataRejected.sessionId,
          organizationLearnerId: 55,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });

        await databaseBuilder.commit();

        // when
        const certificationAttestations =
          await certificateRepository.findByDivisionForScoIsManagingStudentsOrganization({
            organizationId: 123,
            division: '3emeB',
          });

        // then
        const expectedCertificationAttestation =
          domainBuilder.buildCertificationAttestation(certificationAttestationData);
        expect(certificationAttestations).to.have.length(1);
        expect(certificationAttestations[0]).to.deepEqualInstanceOmitting(expectedCertificationAttestation, [
          'resultCompetenceTree',
        ]);
      });
    });

    it('should take into account the latest certification of an organization learner', async function () {
      // given
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);
      databaseBuilder.factory.buildOrganization({ id: 123, type: 'SCO', isManagingStudents: true });
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: 123,
        division: '3emeb',
      }).id;
      const certificationAttestationDataOldest = {
        id: 123,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 456,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 789,
      };
      const certificationAttestationDataNewest = {
        id: 456,
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId: 789,
        date: new Date('2021-01-01'),
        verificationCode: 'P-SOMEOTHERCODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien maigrelettes',
        pixScore: 51,
        cleaCertificationImagePath: null,
        pixPlusDroitCertificationImagePath: null,
        sessionId: 999,
      };
      _buildSession({
        userId: certificationAttestationDataOldest.userId,
        sessionId: certificationAttestationDataOldest.sessionId,
        publishedAt: certificationAttestationDataOldest.deliveredAt,
        certificationCenter: certificationAttestationDataOldest.certificationCenter,
      });
      _buildSession({
        userId: certificationAttestationDataNewest.userId,
        sessionId: certificationAttestationDataNewest.sessionId,
        publishedAt: certificationAttestationDataNewest.deliveredAt,
        certificationCenter: certificationAttestationDataNewest.certificationCenter,
      });
      _buildValidCertificationAttestation(certificationAttestationDataOldest);
      _buildValidCertificationAttestation(certificationAttestationDataNewest);
      _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataOldest,
        organizationId: 123,
        organizationLearnerId,
      });
      _linkCertificationAttestationToOrganization({
        certificationAttestationData: certificationAttestationDataNewest,
        organizationId: 123,
        organizationLearnerId,
      });
      await databaseBuilder.commit();

      // when
      const certificationAttestations = await certificateRepository.findByDivisionForScoIsManagingStudentsOrganization({
        organizationId: 123,
        division: '3emeB',
      });

      // then
      const expectedCertificationAttestation = domainBuilder.buildCertificationAttestation(
        certificationAttestationDataNewest,
      );
      expect(certificationAttestations).to.have.length(1);
      expect(certificationAttestations[0]).to.deepEqualInstanceOmitting(expectedCertificationAttestation, [
        'resultCompetenceTree',
      ]);
    });
  });

  describe('#findPrivateCertificatesByUserId', function () {
    it('should return an empty list when the certificate does not exist', async function () {
      // when
      const result = await certificateRepository.findPrivateCertificatesByUserId({ userId: 123 });

      // then
      expect(result).to.deep.equal([]);
    });

    it('should return an empty list when the certificate has no assessment-result', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        isCancelled: false,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        commentForCandidate: 'Il aime beaucoup les mangues, et ça se voit !',
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: privateCertificateData.deliveredAt,
        certificationCenter: privateCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: privateCertificateData.firstName,
        lastName: privateCertificateData.lastName,
        birthdate: privateCertificateData.birthdate,
        birthplace: privateCertificateData.birthplace,
        isPublished: privateCertificateData.isPublished,
        isCancelled: privateCertificateData.isCancelled,
        createdAt: privateCertificateData.date,
        verificationCode: privateCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      databaseBuilder.factory.buildAssessment({ certificationCourseId });
      await databaseBuilder.commit();

      // when
      const result = await certificateRepository.findPrivateCertificatesByUserId({ userId });

      // then
      expect(result).to.deep.equal([]);
    });

    it('should return the certificate when it is cancelled', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        isCancelled: true,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        version: SESSIONS_VERSIONS.V3,
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: privateCertificateData.deliveredAt,
        certificationCenter: privateCertificateData.certificationCenter,
        certificationCenterId,
        version: SESSIONS_VERSIONS.V3,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: privateCertificateData.firstName,
        lastName: privateCertificateData.lastName,
        birthdate: privateCertificateData.birthdate,
        birthplace: privateCertificateData.birthplace,
        isPublished: privateCertificateData.isPublished,
        isCancelled: privateCertificateData.isCancelled,
        createdAt: privateCertificateData.date,
        verificationCode: privateCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId,
        pixScore: privateCertificateData.pixScore,
        status: 'validated',
      });

      await databaseBuilder.commit();

      // when
      const result = await certificateRepository.findPrivateCertificatesByUserId({ userId });

      // then
      expect(result).to.have.length(1);
    });

    it('should return the certificate when it is not published', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: false,
        isCancelled: false,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: privateCertificateData.deliveredAt,
        certificationCenter: privateCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: privateCertificateData.firstName,
        lastName: privateCertificateData.lastName,
        birthdate: privateCertificateData.birthdate,
        birthplace: privateCertificateData.birthplace,
        isPublished: privateCertificateData.isPublished,
        isCancelled: privateCertificateData.isCancelled,
        createdAt: privateCertificateData.date,
        verificationCode: privateCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId,
        pixScore: privateCertificateData.pixScore,
        status: 'validated',
      });

      await databaseBuilder.commit();

      // when
      const result = await certificateRepository.findPrivateCertificatesByUserId({ userId });

      // then
      expect(result).to.have.length(1);
    });

    it('should return the certificate when it is rejected', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        isCancelled: false,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: privateCertificateData.deliveredAt,
        certificationCenter: privateCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: privateCertificateData.firstName,
        lastName: privateCertificateData.lastName,
        birthdate: privateCertificateData.birthdate,
        birthplace: privateCertificateData.birthplace,
        isPublished: privateCertificateData.isPublished,
        isCancelled: privateCertificateData.isCancelled,
        createdAt: privateCertificateData.date,
        verificationCode: privateCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;

      databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId,
        pixScore: privateCertificateData.pixScore,
        status: 'rejected',
      });
      await databaseBuilder.commit();

      // when
      const result = await certificateRepository.findPrivateCertificatesByUserId({ userId });

      // then
      expect(result).to.have.length(1);
    });

    it('should return a collection of PrivateCertificate', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        isCancelled: false,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'ABCDE-F',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        commentForCandidate: 'Il aime beaucoup les mangues, et ça se voit !',
        version: SESSIONS_VERSIONS.V3,
      };

      const { certificationCourseId } = await _buildValidPrivateCertificate(privateCertificateData);
      // when
      const privateCertificates = await certificateRepository.findPrivateCertificatesByUserId({ userId });

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
        id: certificationCourseId,
        ...privateCertificateData,
      });
      expect(privateCertificates).to.have.length(1);
      expect(privateCertificates[0]).to.deepEqualInstance(expectedPrivateCertificate);
    });

    it('should return all the certificates of the user if he has many ordered by creation date DESC', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const { certificationCourseId } = await _buildValidPrivateCertificate({ userId, date: '2021-05-02' });
      const { certificationCourseId: certificationCourseId2 } = await _buildValidPrivateCertificate({
        userId,
        date: '2021-06-02',
      });
      const { certificationCourseId: certificationCourseId3 } = await _buildValidPrivateCertificate({
        userId,
        date: '2021-07-02',
      });
      await databaseBuilder.commit();

      // when
      const privateCertificates = await certificateRepository.findPrivateCertificatesByUserId({ userId });

      // then
      expect(privateCertificates).to.have.length(3);
      expect(privateCertificates[0].id).to.equal(certificationCourseId3);
      expect(privateCertificates[1].id).to.equal(certificationCourseId2);
      expect(privateCertificates[2].id).to.equal(certificationCourseId);
    });

    it('should build from the latest assessment result if validated', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'ABCDE-F',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        commentForCandidate: 'Il aime beaucoup les mangues, et ça se voit !',
        version: SESSIONS_VERSIONS.V3,
      };

      const { certificationCourseId } = await _buildValidPrivateCertificateWithSeveralResults(privateCertificateData);

      // when
      const privateCertificates = await certificateRepository.findPrivateCertificatesByUserId({ userId });

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
        id: certificationCourseId,
        ...privateCertificateData,
      });
      expect(privateCertificates[0]).to.deepEqualInstance(expectedPrivateCertificate);
    });
  });

  describe('#getPrivateCertificate', function () {
    it('should throw a NotFoundError when private certificate does not exist', async function () {
      // when
      const error = await catchErr(certificateRepository.getPrivateCertificate)(123, { locale: 'fr' });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('Certificate not found for ID 123');
    });

    it('should throw a NotFoundError when the certificate has no assessment-result', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        commentForCandidate: 'Il aime beaucoup les mangues, et ça se voit !',
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: privateCertificateData.deliveredAt,
        certificationCenter: privateCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: privateCertificateData.firstName,
        lastName: privateCertificateData.lastName,
        birthdate: privateCertificateData.birthdate,
        birthplace: privateCertificateData.birthplace,
        isPublished: privateCertificateData.isPublished,
        isCancelled: false,
        createdAt: privateCertificateData.date,
        verificationCode: privateCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      databaseBuilder.factory.buildAssessment({ certificationCourseId });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getPrivateCertificate)(certificationCourseId, {
        locale: 'fr',
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`Certificate not found for ID ${certificationCourseId}`);
    });

    it('should throw a NotFoundError when the certificate is cancelled', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        commentForCandidate: 'Il aime beaucoup les mangues, et ça se voit !',
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: privateCertificateData.deliveredAt,
        certificationCenter: privateCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: privateCertificateData.firstName,
        lastName: privateCertificateData.lastName,
        birthdate: privateCertificateData.birthdate,
        birthplace: privateCertificateData.birthplace,
        isPublished: privateCertificateData.isPublished,
        isCancelled: true,
        createdAt: privateCertificateData.date,
        verificationCode: privateCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      databaseBuilder.factory.buildAssessmentResult({
        certificationCourseId,
        pixScore: privateCertificateData.pixScore,
        status: 'validated',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getPrivateCertificate)(certificationCourseId, {
        locale: 'fr',
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`Certificate not found for ID ${certificationCourseId}`);
    });

    it('should throw a NotFoundError when the certificate is not published', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isCancelled: false,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: privateCertificateData.deliveredAt,
        certificationCenter: privateCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: privateCertificateData.firstName,
        lastName: privateCertificateData.lastName,
        birthdate: privateCertificateData.birthdate,
        birthplace: privateCertificateData.birthplace,
        isPublished: false,
        isCancelled: privateCertificateData.isCancelled,
        createdAt: privateCertificateData.date,
        verificationCode: privateCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId,
        pixScore: privateCertificateData.pixScore,
        status: 'validated',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getPrivateCertificate)(certificationCourseId, {
        locale: 'fr',
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`Certificate not found for ID ${certificationCourseId}`);
    });

    it('should throw a NotFoundError when the certificate is rejected', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        isCancelled: false,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: privateCertificateData.deliveredAt,
        certificationCenter: privateCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: privateCertificateData.firstName,
        lastName: privateCertificateData.lastName,
        birthdate: privateCertificateData.birthdate,
        birthplace: privateCertificateData.birthplace,
        isPublished: privateCertificateData.isPublished,
        isCancelled: privateCertificateData.isCancelled,
        createdAt: privateCertificateData.date,
        verificationCode: privateCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId,
        pixScore: privateCertificateData.pixScore,
        status: 'rejected',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getPrivateCertificate)(certificationCourseId, {
        locale: 'fr',
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(`Certificate not found for ID ${certificationCourseId}`);
    });

    it('should return a PrivateCertificate', async function () {
      // given
      const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
      mockLearningContent(learningContentObjects);

      const userId = databaseBuilder.factory.buildUser().id;
      const privateCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        isCancelled: false,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'ABCDE-F',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
        commentForCandidate: 'Il aime beaucoup les mangues, et ça se voit !',
        version: SESSIONS_VERSIONS.V3,
      };

      const { certificationCourseId } = await _buildValidPrivateCertificate(privateCertificateData);

      // when
      const privateCertificate = await certificateRepository.getPrivateCertificate(certificationCourseId);

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
        id: certificationCourseId,
        ...privateCertificateData,
      });
      expect(privateCertificate).to.deepEqualInstanceOmitting(expectedPrivateCertificate, ['resultCompetenceTree']);
    });

    context('when the comment for candidate is automatically set', function () {
      it('should return a PrivateCertificate with matching key', async function () {
        // given
        const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
        mockLearningContent(learningContentObjects);

        const userId = databaseBuilder.factory.buildUser().id;
        const privateCertificateData = {
          firstName: 'Sarah Michelle',
          lastName: 'Gellar',
          birthdate: '1977-04-14',
          birthplace: 'Saint-Ouen',
          isPublished: true,
          isCancelled: false,
          userId,
          date: new Date('2020-01-01'),
          verificationCode: 'ABCDE-F',
          maxReachableLevelOnCertificationDate: 5,
          deliveredAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          pixScore: 51,
          commentForCandidate: 'Il aime beaucoup les mangues, mais il a fraudé :( !',
          commentByAutoJury: AutoJuryCommentKeys.FRAUD,
        };

        const { certificationCourseId } = await _buildValidPrivateCertificate(privateCertificateData);

        // when
        const privateCertificate = await certificateRepository.getPrivateCertificate(certificationCourseId);

        // then
        const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
          id: certificationCourseId,
          ...privateCertificateData,
        });
        expect(privateCertificate).to.deepEqualInstanceOmitting(expectedPrivateCertificate, ['resultCompetenceTree']);
      });
    });

    describe('when "locale" is french', function () {
      it('should return a PrivateCertificate with french resultCompetenceTree', async function () {
        // given

        const userId = databaseBuilder.factory.buildUser().id;
        const privateCertificateData = {
          firstName: 'Sarah Michelle',
          lastName: 'Gellar',
          birthdate: '1977-04-14',
          birthplace: 'Saint-Ouen',
          isPublished: true,
          userId,
          date: new Date('2020-01-01'),
          verificationCode: 'ABCDE-F',
          maxReachableLevelOnCertificationDate: 5,
          deliveredAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          pixScore: 51,
          commentForCandidate: 'Il aime beaucoup les mangues, et ça se voit !',
        };

        const { certificationCourseId, assessmentResultId } = await _buildValidPrivateCertificate(
          privateCertificateData,
          false,
        );

        const competenceMarks1 = domainBuilder.buildCompetenceMark({
          id: 1234,
          level: 4,
          score: 32,
          area_code: '1',
          competence_code: '1.1',
          competenceId: 'recComp1',
          assessmentResultId,
        });
        databaseBuilder.factory.buildCompetenceMark(competenceMarks1);

        const competenceMarks2 = domainBuilder.buildCompetenceMark({
          id: 4567,
          level: 5,
          score: 40,
          area_code: '1',
          competence_code: '1.2',
          competenceId: 'recComp2',
          assessmentResultId,
        });
        databaseBuilder.factory.buildCompetenceMark(competenceMarks2);

        await databaseBuilder.commit();

        const competence1 = domainBuilder.buildCompetence({
          id: 'recComp1',
          index: '1.1',
          name: 'Traiter des données',
        });
        const competence2 = domainBuilder.buildCompetence({
          id: 'recComp2',
          index: '1.2',
          name: 'Traiter des choux',
        });
        const area1 = domainBuilder.buildArea({
          id: 'recArea1',
          code: '1',
          title: 'titre test',
          competences: [competence1, competence2],
          framework: null,
        });

        const learningContentObjects = learningContentBuilder.fromAreas([
          {
            ...area1,
            title_i18n: { fr: area1.title, en: 'title en' },
            competences: [
              {
                id: 'recComp1',
                index: '1.1',
                name_i18n: { fr: 'Traiter des données', en: 'Process data' },
                description_i18n: { fr: 'competence1DescriptionFr', en: 'competence1DescriptionEn' },
              },
              {
                id: 'recComp2',
                index: '1.2',
                name_i18n: { fr: 'Traiter des choux', en: 'Process sprouts' },
                description_i18n: { fr: 'competence2DescriptionFr', en: 'competence2DescriptionEn' },
              },
            ],
          },
        ]);
        mockLearningContent(learningContentObjects);

        // when
        const privateCertificate = await certificateRepository.getPrivateCertificate(certificationCourseId, {
          locale: 'fr',
        });

        // then
        const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({
          id: `${certificationCourseId}-${assessmentResultId}`,
          competenceMarks: [competenceMarks1, competenceMarks2],
          competenceTree: domainBuilder.buildCompetenceTree({ areas: [area1] }),
        });
        const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
          id: certificationCourseId,
          resultCompetenceTree,
          ...privateCertificateData,
        });
        expect(privateCertificate).to.deepEqualInstance(expectedPrivateCertificate);
      });
    });

    describe('when "locale" is english', function () {
      it('should return a PrivateCertificate with english resultCompetenceTree', async function () {
        // given

        const userId = databaseBuilder.factory.buildUser().id;
        const privateCertificateData = {
          firstName: 'Sarah Michelle',
          lastName: 'Gellar',
          birthdate: '1977-04-14',
          birthplace: 'Saint-Ouen',
          isPublished: true,
          isCancelled: false,
          userId,
          date: new Date('2020-01-01'),
          verificationCode: 'ABCDE-F',
          maxReachableLevelOnCertificationDate: 5,
          deliveredAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          pixScore: 51,
          commentForCandidate: 'Il aime beaucoup les mangues, et ça se voit !',
        };

        const { certificationCourseId, assessmentResultId } = await _buildValidPrivateCertificate(
          privateCertificateData,
          false,
        );

        const competenceMarks1 = domainBuilder.buildCompetenceMark({
          id: 1234,
          level: 4,
          score: 32,
          area_code: '1',
          competence_code: '1.1',
          competenceId: 'recComp1',
          assessmentResultId,
        });
        databaseBuilder.factory.buildCompetenceMark(competenceMarks1);

        const competenceMarks2 = domainBuilder.buildCompetenceMark({
          id: 4567,
          level: 5,
          score: 40,
          area_code: '1',
          competence_code: '1.2',
          competenceId: 'recComp2',
          assessmentResultId,
        });
        databaseBuilder.factory.buildCompetenceMark(competenceMarks2);

        await databaseBuilder.commit();

        const competence1 = domainBuilder.buildCompetence({
          id: 'recComp1',
          index: '1.1',
          name: 'Traiter des données',
        });
        const competence2 = domainBuilder.buildCompetence({
          id: 'recComp2',
          index: '1.2',
          name: 'Traiter des choux',
        });
        const area1 = domainBuilder.buildArea({
          id: 'recArea1',
          code: '1',
          title: 'titre test',
          competences: [competence1, competence2],
          framework: null,
        });

        const learningContentObjects = learningContentBuilder.fromAreas([
          {
            ...area1,
            title_i18n: { fr: area1.title, en: 'title en' },
            competences: [
              {
                id: 'recComp1',
                index: '1.1',
                name_i18n: { fr: 'Traiter des données', en: 'Process data' },
                description_i18n: { fr: 'competence1DescriptionFr', en: 'competence1DescriptionEn' },
              },
              {
                id: 'recComp2',
                index: '1.2',
                name_i18n: { fr: 'Traiter des choux', en: 'Process sprouts' },
                description_i18n: { fr: 'competence2DescriptionFr', en: 'competence2DescriptionEn' },
              },
            ],
          },
        ]);
        mockLearningContent(learningContentObjects);

        // when
        const privateCertificate = await certificateRepository.getPrivateCertificate(certificationCourseId, {
          locale: 'en',
        });

        // then
        const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({
          id: `${certificationCourseId}-${assessmentResultId}`,
          competenceMarks: [competenceMarks1, competenceMarks2],
          competenceTree: domainBuilder.buildCompetenceTree({
            areas: [
              {
                ...area1,
                title: 'title en',
                competences: [
                  { ...area1.competences[0], name: 'Process data' },
                  { ...area1.competences[1], name: 'Process sprouts' },
                ],
              },
            ],
          }),
        });
        const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
          id: certificationCourseId,
          resultCompetenceTree,
          ...privateCertificateData,
        });
        expect(privateCertificate).to.deepEqualInstance(expectedPrivateCertificate);
      });
    });

    context('acquired certifiable badges', function () {
      it('should get the certified badge images when the certifications were acquired', async function () {
        // given
        const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
          name: 'Pix+ test',
          hasExternalJury: false,
          key: 'A',
        }).id;
        const complementaryCertificationWithJuryId = databaseBuilder.factory.buildComplementaryCertification({
          name: 'Pix+ test with Jury',
          hasExternalJury: true,
          key: 'WITH_JURY',
        }).id;

        const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
        mockLearningContent(learningContentObjects);

        const userId = databaseBuilder.factory.buildUser().id;
        const privateCertificateData = {
          firstName: 'Sarah Michelle',
          lastName: 'Gellar',
          birthdate: '1977-04-14',
          birthplace: 'Saint-Ouen',
          isPublished: true,
          isCancelled: false,
          userId,
          date: new Date('2020-01-01'),
          verificationCode: 'ABCDF-G',
          maxReachableLevelOnCertificationDate: 5,
          deliveredAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          pixScore: null,
          commentForCandidate: null,
          certifiedBadgeImages: [
            {
              imageUrl: 'https://images.pix.fr/badge1.svg',
              stickerUrl: 'https://images.pix.fr/skicker1.pdf',
              isTemporaryBadge: false,
              label: 'Pix+ test',
              message: 'message badge 1',
            },
            {
              imageUrl: 'https://images.pix.fr/badge2.svg',
              stickerUrl: 'https://images.pix.fr/skicker2.pdf',
              isTemporaryBadge: true,
              label: 'Pix+ test',
              message: 'temporary message badge 2',
            },
          ],
          version: SESSIONS_VERSIONS.V3,
        };

        const { certificationCourseId } = await _buildValidPrivateCertificateWithAcquiredAndNotAcquiredBadges({
          privateCertificateData,
          acquiredBadges: [
            {
              key: 'PIX_TEST_1',
              label: 'Pix+ test',
              imageUrl: 'https://images.pix.fr/badge1.svg',
              stickerUrl: 'https://images.pix.fr/skicker1.pdf',
              complementaryCertificationId,
              certificateMessage: 'message badge 1',
            },
            {
              key: 'PIX_TEST_2',
              label: 'Pix+ test',
              imageUrl: 'https://images.pix.fr/badge2.svg',
              stickerUrl: 'https://images.pix.fr/skicker2.pdf',
              complementaryCertificationId: complementaryCertificationWithJuryId,
              temporaryCertificateMessage: 'temporary message badge 2',
            },
          ],
        });

        await databaseBuilder.commit();

        // when
        const privateCertificate = await certificateRepository.getPrivateCertificate(certificationCourseId);

        // then
        const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated({
          id: certificationCourseId,
          ...privateCertificateData,
        });

        expect(privateCertificate).to.deepEqualInstanceOmitting(expectedPrivateCertificate, ['resultCompetenceTree']);
      });
    });
  });

  describe('#getShareableCertificateByVerificationCode', function () {
    const minimalLearningContent = [
      {
        id: 'recArea0',
        code: '1',
        competences: [
          {
            id: 'recNv8qhaY887jQb2',
            index: '1.3',
            name: 'Traiter des données',
          },
        ],
      },
    ];

    it('should throw a NotFoundError when shareable certificate does not exist', async function () {
      // when
      const error = await catchErr(certificateRepository.getShareableCertificateByVerificationCode)('P-SOMECODE');

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with verification code "P-SOMECODE"');
    });

    it('should throw a NotFoundError when certificate has no assessment-result', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const shareableCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: shareableCertificateData.deliveredAt,
        certificationCenter: shareableCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: shareableCertificateData.firstName,
        lastName: shareableCertificateData.lastName,
        birthdate: shareableCertificateData.birthdate,
        birthplace: shareableCertificateData.birthplace,
        isPublished: shareableCertificateData.isPublished,
        isCancelled: false,
        createdAt: shareableCertificateData.date,
        verificationCode: shareableCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: shareableCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      databaseBuilder.factory.buildAssessment({ certificationCourseId });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getShareableCertificateByVerificationCode)('P-SOMECODE');

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with verification code "P-SOMECODE"');
    });

    it('should throw a NotFoundError when certificate is cancelled', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const shareableCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: shareableCertificateData.deliveredAt,
        certificationCenter: shareableCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: shareableCertificateData.firstName,
        lastName: shareableCertificateData.lastName,
        birthdate: shareableCertificateData.birthdate,
        birthplace: shareableCertificateData.birthplace,
        isPublished: shareableCertificateData.isPublished,
        isCancelled: true,
        createdAt: shareableCertificateData.date,
        verificationCode: shareableCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: shareableCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: shareableCertificateData.pixScore,
        status: 'validated',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getShareableCertificateByVerificationCode)('P-SOMECODE');

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with verification code "P-SOMECODE"');
    });

    it('should throw a NotFoundError when certificate is not published', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const shareableCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: false,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: shareableCertificateData.deliveredAt,
        certificationCenter: shareableCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: shareableCertificateData.firstName,
        lastName: shareableCertificateData.lastName,
        birthdate: shareableCertificateData.birthdate,
        birthplace: shareableCertificateData.birthplace,
        isPublished: shareableCertificateData.isPublished,
        isCancelled: false,
        createdAt: shareableCertificateData.date,
        verificationCode: shareableCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: shareableCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: shareableCertificateData.pixScore,
        status: 'validated',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getShareableCertificateByVerificationCode)('P-SOMECODE');

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with verification code "P-SOMECODE"');
    });

    it('should throw a NotFoundError when certificate is rejected', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const shareableCertificateData = {
        firstName: 'Sarah Michelle',
        lastName: 'Gellar',
        birthdate: '1977-04-14',
        birthplace: 'Saint-Ouen',
        isPublished: true,
        userId,
        date: new Date('2020-01-01'),
        verificationCode: 'P-SOMECODE',
        maxReachableLevelOnCertificationDate: 5,
        deliveredAt: new Date('2021-05-05'),
        certificationCenter: 'Centre des poules bien dodues',
        pixScore: 51,
      };
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const sessionId = databaseBuilder.factory.buildSession({
        publishedAt: shareableCertificateData.deliveredAt,
        certificationCenter: shareableCertificateData.certificationCenter,
        certificationCenterId,
      }).id;
      const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
        firstName: shareableCertificateData.firstName,
        lastName: shareableCertificateData.lastName,
        birthdate: shareableCertificateData.birthdate,
        birthplace: shareableCertificateData.birthplace,
        isPublished: shareableCertificateData.isPublished,
        isCancelled: false,
        createdAt: shareableCertificateData.date,
        verificationCode: shareableCertificateData.verificationCode,
        maxReachableLevelOnCertificationDate: shareableCertificateData.maxReachableLevelOnCertificationDate,
        sessionId,
        userId,
      }).id;
      const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId }).id;
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId,
        pixScore: shareableCertificateData.pixScore,
        status: 'rejected',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(certificateRepository.getShareableCertificateByVerificationCode)('P-SOMECODE');

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('There is no certification course with verification code "P-SOMECODE"');
    });

    describe('when "locale" is french', function () {
      it('should return a french ShareableCertificate', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const shareableCertificateData = {
          id: 123,
          firstName: 'Sarah Michelle',
          lastName: 'Gellar',
          birthdate: '1977-04-14',
          birthplace: 'Saint-Ouen',
          isPublished: true,
          userId,
          date: new Date('2020-01-01'),
          verificationCode: 'P-SOMECODE',
          maxReachableLevelOnCertificationDate: 5,
          deliveredAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          pixScore: 51,
          version: SESSIONS_VERSIONS.V3,
        };

        const { certificationCourseId, assessmentResultId } = await _buildValidShareableCertificate(
          shareableCertificateData,
          false,
        );

        const competenceMarks1 = domainBuilder.buildCompetenceMark({
          id: 1234,
          level: 4,
          score: 32,
          area_code: '1',
          competence_code: '1.1',
          competenceId: 'recComp1',
          assessmentResultId,
        });
        databaseBuilder.factory.buildCompetenceMark(competenceMarks1);

        const competenceMarks2 = domainBuilder.buildCompetenceMark({
          id: 4567,
          level: 5,
          score: 40,
          area_code: '1',
          competence_code: '1.2',
          competenceId: 'recComp2',
          assessmentResultId,
        });
        databaseBuilder.factory.buildCompetenceMark(competenceMarks2);

        await databaseBuilder.commit();

        const competence1 = domainBuilder.buildCompetence({
          id: 'recComp1',
          index: '1.1',
          name: 'Traiter des données',
        });
        const competence2 = domainBuilder.buildCompetence({
          id: 'recComp2',
          index: '1.2',
          name: 'Traiter des choux',
        });
        const area1 = domainBuilder.buildArea({
          id: 'recArea1',
          code: '1',
          competences: [competence1, competence2],
          title: 'titre test',
          framework: null,
        });

        const learningContentObjects = learningContentBuilder.fromAreas([
          {
            ...area1,
            title_i18n: { fr: area1.title, en: 'title en' },
            competences: [
              {
                id: 'recComp1',
                index: '1.1',
                name_i18n: { fr: 'Traiter des données', en: 'Process data' },
                description_i18n: { fr: 'competence1DescriptionFr', en: 'competence1DescriptionEn' },
              },
              {
                id: 'recComp2',
                index: '1.2',
                name_i18n: { fr: 'Traiter des choux', en: 'Process sprouts' },
                description_i18n: { fr: 'competence2DescriptionFr', en: 'competence2DescriptionEn' },
              },
            ],
          },
        ]);
        mockLearningContent(learningContentObjects);

        // when
        const shareableCertificate = await certificateRepository.getShareableCertificateByVerificationCode(
          'P-SOMECODE',
          {
            locale: 'fr',
          },
        );

        // then
        const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({
          id: `${certificationCourseId}-${assessmentResultId}`,
          competenceMarks: [competenceMarks1, competenceMarks2],
          competenceTree: domainBuilder.buildCompetenceTree({ areas: [area1] }),
        });
        const expectedShareableCertificate = domainBuilder.buildShareableCertificate({
          id: certificationCourseId,
          ...shareableCertificateData,
          resultCompetenceTree,
        });
        expect(shareableCertificate).to.deepEqualInstance(expectedShareableCertificate);
      });
    });

    describe('when "locale" is english', function () {
      it('should return an english ShareableCertificate', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const shareableCertificateData = {
          id: 123,
          firstName: 'Sarah Michelle',
          lastName: 'Gellar',
          birthdate: '1977-04-14',
          birthplace: 'Saint-Ouen',
          isPublished: true,
          userId,
          date: new Date('2020-01-01'),
          verificationCode: 'P-SOMECODE',
          maxReachableLevelOnCertificationDate: 5,
          deliveredAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          pixScore: 51,
          version: SESSIONS_VERSIONS.V3,
        };

        const { certificationCourseId, assessmentResultId } = await _buildValidShareableCertificate(
          shareableCertificateData,
          false,
        );

        const competenceMarks1 = domainBuilder.buildCompetenceMark({
          id: 1234,
          level: 4,
          score: 32,
          area_code: '1',
          competence_code: '1.1',
          competenceId: 'recComp1',
          assessmentResultId,
        });
        databaseBuilder.factory.buildCompetenceMark(competenceMarks1);

        const competenceMarks2 = domainBuilder.buildCompetenceMark({
          id: 4567,
          level: 5,
          score: 40,
          area_code: '1',
          competence_code: '1.2',
          competenceId: 'recComp2',
          assessmentResultId,
        });
        databaseBuilder.factory.buildCompetenceMark(competenceMarks2);

        await databaseBuilder.commit();

        const competence1 = domainBuilder.buildCompetence({
          id: 'recComp1',
          index: '1.1',
          name: 'Traiter des données',
        });
        const competence2 = domainBuilder.buildCompetence({
          id: 'recComp2',
          index: '1.2',
          name: 'Traiter des choux',
        });
        const area1 = domainBuilder.buildArea({
          id: 'recArea1',
          code: '1',
          competences: [competence1, competence2],
          title: 'titre test',
          framework: null,
        });

        const learningContentObjects = learningContentBuilder.fromAreas([
          {
            ...area1,
            title_i18n: { fr: area1.title, en: 'title en' },
            competences: [
              {
                id: 'recComp1',
                index: '1.1',
                name_i18n: { fr: 'Traiter des données', en: 'Process data' },
                description_i18n: { fr: 'competence1DescriptionFr', en: 'competence1DescriptionEn' },
              },
              {
                id: 'recComp2',
                index: '1.2',
                name_i18n: { fr: 'Traiter des choux', en: 'Process sprouts' },
                description_i18n: { fr: 'competence2DescriptionFr', en: 'competence2DescriptionEn' },
              },
            ],
          },
        ]);
        mockLearningContent(learningContentObjects);

        // when
        const shareableCertificate = await certificateRepository.getShareableCertificateByVerificationCode(
          'P-SOMECODE',
          {
            locale: 'en',
          },
        );

        // then
        const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({
          id: `${certificationCourseId}-${assessmentResultId}`,
          competenceMarks: [competenceMarks1, competenceMarks2],
          competenceTree: domainBuilder.buildCompetenceTree({
            areas: [
              {
                ...area1,
                title: 'title en',
                competences: [
                  { ...area1.competences[0], name: 'Process data' },
                  { ...area1.competences[1], name: 'Process sprouts' },
                ],
              },
            ],
          }),
        });
        const expectedShareableCertificate = domainBuilder.buildShareableCertificate({
          id: certificationCourseId,
          ...shareableCertificateData,
          resultCompetenceTree,
        });
        expect(shareableCertificate).to.deepEqualInstance(expectedShareableCertificate);
      });
    });

    context('acquired certifiable badges', function () {
      it('should get the certified badge images when the certifications were acquired', async function () {
        // given
        const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Test',
          hasExternalJury: false,
          key: 'TEST_1',
        }).id;
        const complementaryCertificationWithJuryId = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+ Test 2',
          hasExternalJury: true,
          key: 'TEST_2',
        }).id;

        const learningContentObjects = learningContentBuilder.fromAreas(minimalLearningContent);
        mockLearningContent(learningContentObjects);
        const userId = databaseBuilder.factory.buildUser().id;
        const shareableCertificateData = {
          id: 123,
          firstName: 'Sarah Michelle',
          lastName: 'Gellar',
          birthdate: '1977-04-14',
          birthplace: 'Saint-Ouen',
          isPublished: true,
          userId,
          date: new Date('2020-01-01'),
          verificationCode: 'P-SOMECODE',
          maxReachableLevelOnCertificationDate: 5,
          deliveredAt: new Date('2021-05-05'),
          certificationCenter: 'Centre des poules bien dodues',
          pixScore: 51,
          version: SESSIONS_VERSIONS.V3,
          certifiedBadgeImages: [
            {
              imageUrl: 'https://images.pix.fr/badge1.svg',
              stickerUrl: 'https://images.pix.fr/skicker1.pdf',
              isTemporaryBadge: false,
              label: 'Pix+ test',
              message: 'message badge 1',
            },
            {
              imageUrl: 'https://images.pix.fr/badge2.svg',
              stickerUrl: 'https://images.pix.fr/skicker2.pdf',
              isTemporaryBadge: true,
              label: 'Pix+ test',
              message: 'temporary message badge 2',
            },
          ],
        };

        const { certificationCourseId } = await _buildValidShareableCertificateWithAcquiredBadges({
          shareableCertificateData,
          acquiredBadges: [
            {
              key: 'PIX_TEST_1',
              imageUrl: 'https://images.pix.fr/badge1.svg',
              stickerUrl: 'https://images.pix.fr/skicker1.pdf',
              label: 'Pix+ test',
              complementaryCertificationId,
              certificateMessage: 'message badge 1',
            },
            {
              key: 'PIX_TEST_2',
              imageUrl: 'https://images.pix.fr/badge2.svg',
              stickerUrl: 'https://images.pix.fr/skicker2.pdf',
              label: 'Pix+ test',
              complementaryCertificationId: complementaryCertificationWithJuryId,
              temporaryCertificateMessage: 'temporary message badge 2',
            },
          ],
        });

        await databaseBuilder.commit();

        // when
        const shareableCertificate =
          await certificateRepository.getShareableCertificateByVerificationCode('P-SOMECODE');

        // then
        const expectedShareableCertificate = domainBuilder.buildShareableCertificate({
          id: certificationCourseId,
          ...shareableCertificateData,
        });
        expect(shareableCertificate).to.deepEqualInstanceOmitting(expectedShareableCertificate, [
          'resultCompetenceTree',
        ]);
      });
    });
  });
});

function _buildIncomplete(certificationAttestationData) {
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationAttestationData.id,
    firstName: certificationAttestationData.firstName,
    lastName: certificationAttestationData.lastName,
    birthdate: certificationAttestationData.birthdate,
    birthplace: certificationAttestationData.birthplace,
    isPublished: certificationAttestationData.isPublished,
    isCancelled: false,
    createdAt: certificationAttestationData.date,
    verificationCode: certificationAttestationData.verificationCode,
    maxReachableLevelOnCertificationDate: certificationAttestationData.maxReachableLevelOnCertificationDate,
    sessionId: certificationAttestationData.sessionId,
    userId: certificationAttestationData.userId,
  });
  databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationAttestationData.id });
}

function _buildRejected(certificationAttestationData) {
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationAttestationData.id,
    firstName: certificationAttestationData.firstName,
    lastName: certificationAttestationData.lastName,
    birthdate: certificationAttestationData.birthdate,
    birthplace: certificationAttestationData.birthplace,
    isPublished: certificationAttestationData.isPublished,
    isCancelled: false,
    createdAt: certificationAttestationData.date,
    verificationCode: certificationAttestationData.verificationCode,
    maxReachableLevelOnCertificationDate: certificationAttestationData.maxReachableLevelOnCertificationDate,
    sessionId: certificationAttestationData.sessionId,
    userId: certificationAttestationData.userId,
  });

  databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId: certificationAttestationData.id,
    pixScore: certificationAttestationData.pixScore,
    status: 'rejected',
  });
}

function _buildCancelled(certificationAttestationData) {
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationAttestationData.id,
    firstName: certificationAttestationData.firstName,
    lastName: certificationAttestationData.lastName,
    birthdate: certificationAttestationData.birthdate,
    birthplace: certificationAttestationData.birthplace,
    isPublished: certificationAttestationData.isPublished,
    isCancelled: true,
    createdAt: certificationAttestationData.date,
    verificationCode: certificationAttestationData.verificationCode,
    maxReachableLevelOnCertificationDate: certificationAttestationData.maxReachableLevelOnCertificationDate,
    sessionId: certificationAttestationData.sessionId,
    userId: certificationAttestationData.userId,
  });
  databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId: certificationAttestationData.id,
    pixScore: certificationAttestationData.pixScore,
    status: 'validated',
  });
}

async function _buildValidPrivateCertificate(privateCertificateData, buildCompetenceMark = true) {
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  const sessionId = databaseBuilder.factory.buildSession({
    publishedAt: privateCertificateData.deliveredAt,
    certificationCenter: privateCertificateData.certificationCenter,
    certificationCenterId,
    version: SESSIONS_VERSIONS.V3,
  }).id;
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    firstName: privateCertificateData.firstName,
    lastName: privateCertificateData.lastName,
    birthdate: privateCertificateData.birthdate,
    birthplace: privateCertificateData.birthplace,
    isPublished: privateCertificateData.isPublished,
    isCancelled: false,
    createdAt: privateCertificateData.date,
    verificationCode: privateCertificateData.verificationCode,
    maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
    sessionId,
    userId: privateCertificateData.userId,
  }).id;
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId,
    pixScore: privateCertificateData.pixScore,
    status: 'validated',
    commentForCandidate: privateCertificateData.commentForCandidate,
    commentByAutoJury: privateCertificateData.commentByAutoJury,
    createdAt: new Date('2021-01-01'),
  }).id;

  if (buildCompetenceMark) {
    databaseBuilder.factory.buildCompetenceMark({
      assessmentResultId,
    });
  }

  await databaseBuilder.commit();

  return { certificationCourseId, assessmentResultId };
}

async function _buildValidPrivateCertificateWithSeveralResults(privateCertificateData) {
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  const sessionId = databaseBuilder.factory.buildSession({
    publishedAt: privateCertificateData.deliveredAt,
    certificationCenter: privateCertificateData.certificationCenter,
    certificationCenterId,
    version: SESSIONS_VERSIONS.V3,
  }).id;
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    firstName: privateCertificateData.firstName,
    lastName: privateCertificateData.lastName,
    birthdate: privateCertificateData.birthdate,
    birthplace: privateCertificateData.birthplace,
    isPublished: privateCertificateData.isPublished,
    isCancelled: false,
    createdAt: privateCertificateData.date,
    verificationCode: privateCertificateData.verificationCode,
    maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
    sessionId,
    userId: privateCertificateData.userId,
  }).id;
  const { id: lastAssessmentResultId } = databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId,
    pixScore: privateCertificateData.pixScore,
    status: 'validated',
    commentForCandidate: privateCertificateData.commentForCandidate,
    createdAt: new Date('2021-03-01'),
  });

  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId: lastAssessmentResultId,
  });

  await databaseBuilder.commit();

  return { certificationCourseId };
}

function _buildValidCertificationAttestation(certificationAttestationData, buildCompetenceMark = true) {
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationAttestationData.id,
    firstName: certificationAttestationData.firstName,
    lastName: certificationAttestationData.lastName,
    birthdate: certificationAttestationData.birthdate,
    birthplace: certificationAttestationData.birthplace,
    isPublished: certificationAttestationData.isPublished,
    isCancelled: false,
    createdAt: certificationAttestationData.date,
    verificationCode: certificationAttestationData.verificationCode,
    maxReachableLevelOnCertificationDate: certificationAttestationData.maxReachableLevelOnCertificationDate,
    sessionId: certificationAttestationData.sessionId,
    userId: certificationAttestationData.userId,
  });
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId: certificationAttestationData.id,
    pixScore: certificationAttestationData.pixScore,
    status: 'validated',
    createdAt: new Date('2020-01-02'),
  }).id;

  if (buildCompetenceMark) {
    databaseBuilder.factory.buildCompetenceMark({
      assessmentResultId,
    });
  }

  return assessmentResultId;
}

function _buildSession({ userId, sessionId, publishedAt, certificationCenter }) {
  databaseBuilder.factory.buildUser({ id: userId });
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  databaseBuilder.factory.buildSession({
    id: sessionId,
    publishedAt,
    certificationCenter: certificationCenter,
    certificationCenterId,
    version: SESSIONS_VERSIONS.V3,
  });
}

function _buildCertificationAttestationWithSeveralResults(certificationAttestationData, status = 'validated') {
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationAttestationData.id,
    firstName: certificationAttestationData.firstName,
    lastName: certificationAttestationData.lastName,
    birthdate: certificationAttestationData.birthdate,
    birthplace: certificationAttestationData.birthplace,
    isPublished: certificationAttestationData.isPublished,
    isCancelled: false,
    createdAt: certificationAttestationData.date,
    verificationCode: certificationAttestationData.verificationCode,
    maxReachableLevelOnCertificationDate: certificationAttestationData.maxReachableLevelOnCertificationDate,
    sessionId: certificationAttestationData.sessionId,
    userId: certificationAttestationData.userId,
  }).id;
  const assessmentId = databaseBuilder.factory.buildAssessment({
    certificationCourseId: certificationAttestationData.id,
  }).id;
  const assessmentResultId1 = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    pixScore: certificationAttestationData.pixScore,
    status: 'rejected',
    createdAt: new Date('2019-01-01'),
  }).id;
  const assessmentResultId2 = databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId: certificationAttestationData.id,
    assessmentId,
    pixScore: certificationAttestationData.pixScore,
    status,
    createdAt: new Date('2019-01-02'),
  }).id;

  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId: assessmentResultId1,
  });
  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId: assessmentResultId2,
  });
}

function _linkCertificationAttestationToOrganization({
  certificationAttestationData,
  organizationId,
  division,
  organizationLearnerId = null,
  isDisabled = false,
}) {
  const srId =
    organizationLearnerId ||
    databaseBuilder.factory.buildOrganizationLearner({
      organizationId,
      userId: certificationAttestationData.userId,
      division,
      isDisabled,
    }).id;
  const candidate = databaseBuilder.factory.buildCertificationCandidate({
    userId: certificationAttestationData.userId,
    sessionId: certificationAttestationData.sessionId,
    organizationLearnerId: srId,
  });
  databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
}

async function _buildValidPrivateCertificateWithAcquiredAndNotAcquiredBadges({
  privateCertificateData,
  acquiredBadges,
}) {
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  const sessionId = databaseBuilder.factory.buildSession({
    publishedAt: privateCertificateData.deliveredAt,
    certificationCenter: privateCertificateData.certificationCenter,
    certificationCenterId,
    version: SESSIONS_VERSIONS.V3,
  }).id;
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    firstName: privateCertificateData.firstName,
    lastName: privateCertificateData.lastName,
    birthdate: privateCertificateData.birthdate,
    birthplace: privateCertificateData.birthplace,
    isPublished: privateCertificateData.isPublished,
    isCancelled: privateCertificateData.isCancelled,
    createdAt: privateCertificateData.date,
    verificationCode: privateCertificateData.verificationCode,
    maxReachableLevelOnCertificationDate: privateCertificateData.maxReachableLevelOnCertificationDate,
    sessionId,
    userId: privateCertificateData.userId,
  }).id;
  databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId,
    pixScore: privateCertificateData.pixScore,
    status: 'validated',
    commentForCandidate: privateCertificateData.commentForCandidate,
    createdAt: new Date('2021-01-01'),
  });

  acquiredBadges?.forEach(
    ({
      key,
      imageUrl,
      complementaryCertificationId,
      label,
      certificateMessage,
      temporaryCertificateMessage,
      stickerUrl,
    }) => {
      const badgeId = databaseBuilder.factory.buildBadge({ key }).id;
      const acquiredComplementaryBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId,
        complementaryCertificationId,
        imageUrl,
        stickerUrl,
        label,
        certificateMessage,
        temporaryCertificateMessage,
      }).id;
      const { id: complementaryCertificationCourseId } = databaseBuilder.factory.buildComplementaryCertificationCourse({
        certificationCourseId,
        complementaryCertificationId,
        complementaryCertificationBadgeId: acquiredComplementaryBadgeId,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId,
        complementaryCertificationBadgeId: acquiredComplementaryBadgeId,
        acquired: true,
      });
    },
  );
  await databaseBuilder.commit();
  return { certificationCourseId };
}

async function _buildValidShareableCertificate(shareableCertificateData, buildCompetenceMark = true) {
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  const sessionId = databaseBuilder.factory.buildSession({
    version: shareableCertificateData.version,
    id: shareableCertificateData.sessionId,
    publishedAt: shareableCertificateData.deliveredAt,
    certificationCenter: shareableCertificateData.certificationCenter,
    certificationCenterId,
  }).id;
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    id: shareableCertificateData.id,
    firstName: shareableCertificateData.firstName,
    lastName: shareableCertificateData.lastName,
    birthdate: shareableCertificateData.birthdate,
    birthplace: shareableCertificateData.birthplace,
    isPublished: shareableCertificateData.isPublished,
    isCancelled: false,
    createdAt: shareableCertificateData.date,
    verificationCode: shareableCertificateData.verificationCode,
    maxReachableLevelOnCertificationDate: shareableCertificateData.maxReachableLevelOnCertificationDate,
    sessionId,
    userId: shareableCertificateData.userId,
    version: shareableCertificateData.version,
  }).id;

  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId: shareableCertificateData.id,
    pixScore: shareableCertificateData.pixScore,
    status: 'validated',
    createdAt: new Date('2020-01-02'),
  }).id;

  if (buildCompetenceMark) {
    databaseBuilder.factory.buildCompetenceMark({
      assessmentResultId,
    });
  }

  await databaseBuilder.commit();

  return { certificationCourseId, assessmentResultId };
}

async function _buildValidShareableCertificateWithAcquiredBadges({ shareableCertificateData, acquiredBadges }) {
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  const sessionId = databaseBuilder.factory.buildSession({
    version: shareableCertificateData.version,
    publishedAt: shareableCertificateData.deliveredAt,
    certificationCenter: shareableCertificateData.certificationCenter,
    certificationCenterId,
  }).id;
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    id: shareableCertificateData.id,
    firstName: shareableCertificateData.firstName,
    lastName: shareableCertificateData.lastName,
    birthdate: shareableCertificateData.birthdate,
    birthplace: shareableCertificateData.birthplace,
    isPublished: shareableCertificateData.isPublished,
    isCancelled: false,
    createdAt: shareableCertificateData.date,
    verificationCode: shareableCertificateData.verificationCode,
    maxReachableLevelOnCertificationDate: shareableCertificateData.maxReachableLevelOnCertificationDate,
    sessionId,
    userId: shareableCertificateData.userId,
  }).id;
  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult.last({
    certificationCourseId,
    pixScore: shareableCertificateData.pixScore,
    status: 'validated',
  }).id;

  acquiredBadges?.forEach(
    ({
      key,
      imageUrl,
      label,
      complementaryCertificationId,
      certificateMessage,
      temporaryCertificateMessage,
      stickerUrl,
    }) => {
      const badgeId = databaseBuilder.factory.buildBadge({ key }).id;

      const complementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId,
        complementaryCertificationId,
        imageUrl,
        stickerUrl,
        label,
        certificateMessage,
        temporaryCertificateMessage,
      }).id;
      const { id: complementaryCertificationCourseId } = databaseBuilder.factory.buildComplementaryCertificationCourse({
        certificationCourseId,
        complementaryCertificationId,
        complementaryCertificationBadgeId,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId,
        complementaryCertificationBadgeId,
        acquired: true,
      });
    },
  );

  databaseBuilder.factory.buildCompetenceMark({
    assessmentResultId,
  });
  await databaseBuilder.commit();
  return { certificationCourseId };
}
