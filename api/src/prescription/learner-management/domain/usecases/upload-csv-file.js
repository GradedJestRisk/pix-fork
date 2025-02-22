import { OrganizationImport } from '../models/OrganizationImport.js';

const uploadCsvFile = async function ({
  payload,
  userId,
  organizationId,
  i18n,
  organizationImportRepository,
  importStorage,
  Parser,
}) {
  const organizationImport = OrganizationImport.create({ organizationId, createdBy: userId });
  let filename;
  let encoding;
  const errors = [];

  // Sending File
  try {
    filename = await importStorage.sendFile({ filepath: payload.path });

    const parserEncoding = await importStorage.getParser({ Parser, filename }, organizationId, i18n);
    encoding = parserEncoding.getFileEncoding();
  } catch (error) {
    errors.push(error);
    throw error;
  } finally {
    organizationImport.upload({ filename, encoding, errors });
    await organizationImportRepository.save(organizationImport);
  }
};

export { uploadCsvFile };
