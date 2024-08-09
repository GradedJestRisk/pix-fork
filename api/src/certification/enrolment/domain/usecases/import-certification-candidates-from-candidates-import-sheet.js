import bluebird from 'bluebird';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CandidateAlreadyLinkedToUserError } from '../../../../shared/domain/errors.js';

const importCertificationCandidatesFromCandidatesImportSheet = async function ({
  sessionId,
  odsBuffer,
  i18n,
  candidateRepository,
  certificationCpfCountryRepository,
  certificationCpfCityRepository,
  complementaryCertificationRepository,
  centerRepository,
  sessionRepository,
  certificationCandidatesOdsService,
  certificationCpfService,
  isCompatibilityEnabled,
}) {
  const candidatesInSession = await candidateRepository.findBySessionId({ sessionId });
  const session = await sessionRepository.get({ id: sessionId });

  if (session.hasLinkedCandidate({ candidates: candidatesInSession })) {
    throw new CandidateAlreadyLinkedToUserError('At least one candidate is already linked to a user');
  }

  const candidates = await certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet({
    i18n,
    session,
    isSco: session.isSco,
    odsBuffer,
    certificationCpfService,
    certificationCpfCountryRepository,
    certificationCpfCityRepository,
    complementaryCertificationRepository,
    centerRepository,
    isCompatibilityEnabled,
  });

  await DomainTransaction.execute(async () => {
    await candidateRepository.deleteBySessionId({ sessionId });
    await bluebird.mapSeries(candidates, function (candidate) {
      return candidateRepository.saveInSession({
        candidate,
        sessionId,
      });
    });
  });
};

export { importCertificationCandidatesFromCandidatesImportSheet };
