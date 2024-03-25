import { IMPORT_STATUSES } from '../../../../../../src/prescription/learner-management/domain/constants.js';
import { OrganizationImport } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationImport.js';
import * as organizationImportRepository from '../../../../../../src/prescription/learner-management/infrastructure/repositories/organization-import-repository.js';
import { catchErr, databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Repository | Organization Learner Management | Organization Import', function () {
  describe('#save', function () {
    it('should save import state', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const organizationImport = OrganizationImport.create({ organizationId, createdBy: userId });
      organizationImport.upload({ filename: 'test.csv', encoding: 'utf8' });

      await organizationImportRepository.save(organizationImport);

      const savedImport = await organizationImportRepository.getLastByOrganizationId(organizationId);
      expect(savedImport.createdBy).to.equal(userId);
    });

    it('should save import state with errors', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const organizationImport = OrganizationImport.create({ organizationId, createdBy: userId });
      organizationImport.upload({
        filename: undefined,
        encoding: undefined,
        errors: [new Error('Something went wrong')],
      });

      await organizationImportRepository.save(organizationImport);

      const savedImport = await organizationImportRepository.getLastByOrganizationId(organizationId);
      expect(savedImport.errors[0].message).to.equal('Something went wrong');
    });

    it('should update import state', async function () {
      const organizationId = databaseBuilder.factory.buildOrganizationImport().organizationId;
      await databaseBuilder.commit();

      const organizationImport = await organizationImportRepository.getLastByOrganizationId(organizationId);
      organizationImport.process({ errors: undefined });

      await organizationImportRepository.save(organizationImport);

      const savedImport = await organizationImportRepository.getLastByOrganizationId(organizationId);
      expect(savedImport.status).to.equal(IMPORT_STATUSES.IMPORTED);
    });

    it('should not create inexisting import state ids', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const organizationImport = OrganizationImport.create({ organizationId, createdBy: userId });
      organizationImport.upload({ filename: 'test.csv', encoding: 'utf8' });
      organizationImport.id = 123;

      const error = await catchErr(organizationImportRepository.save)(organizationImport);

      expect(error).to.be.ok;
    });
  });

  describe('#get', function () {
    it('should return import state', async function () {
      const expectedResult = databaseBuilder.factory.buildOrganizationImport();
      await databaseBuilder.commit();

      const result = await organizationImportRepository.get(expectedResult.id);

      expect(result).to.be.deep.equal({ ...expectedResult, errors: null });
    });

    it('should return null if nothing was found', async function () {
      const result = await organizationImportRepository.get(1);

      expect(result).to.equal(null);
    });
  });

  describe('#getByOrganizationId', function () {
    it('should return import state', async function () {
      const expectedResult = databaseBuilder.factory.buildOrganizationImport();
      await databaseBuilder.commit();

      const result = await organizationImportRepository.getLastByOrganizationId(expectedResult.organizationId);

      expect(result).to.be.deep.equal({ ...expectedResult, errors: null });
    });

    it('should return most recent import state', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildOrganizationImport({ organizationId, createdAt: new Date('2023-01-01') });
      const expectedResult = databaseBuilder.factory.buildOrganizationImport({
        organizationId,
        createdAt: new Date('2023-02-10'),
      });
      await databaseBuilder.commit();

      const result = await organizationImportRepository.getLastByOrganizationId(expectedResult.organizationId);

      expect(result).to.be.deep.equal({ ...expectedResult, errors: null });
    });

    it('should return null if nothing was found', async function () {
      const result = await organizationImportRepository.getLastByOrganizationId(1);

      expect(result).to.equal(null);
    });
  });
});
