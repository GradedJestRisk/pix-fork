import { SupOrganizationLearnerParser } from '../../infrastructure/serializers/csv/sup-organization-learner-parser.js';

const importSupOrganizationLearners = async function ({
  payload,
  organizationId,
  i18n,
  supOrganizationLearnerRepository,
  importStorage,
  dependencies = { getDataBuffer },
}) {
  const filename = await importStorage.sendFile({ filepath: payload.path });

  try {
    const readableStream = await importStorage.readFile({ filename });

    const buffer = await dependencies.getDataBuffer(readableStream);
    const parser = new SupOrganizationLearnerParser(buffer, organizationId, i18n);

    const { learners, warnings } = parser.parse();

    await supOrganizationLearnerRepository.addStudents(learners);

    return warnings;
  } finally {
    await importStorage.deleteFile({ filename });
  }
};

function getDataBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data);
    });
    readableStream.on('error', (err) => reject(err));
    readableStream.once('end', () => {
      resolve(Buffer.concat(chunks));
    });
  });
}

export { importSupOrganizationLearners };
