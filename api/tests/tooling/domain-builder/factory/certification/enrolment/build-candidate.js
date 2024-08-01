import { Candidate } from '../../../../../../src/certification/enrolment/domain/models/Candidate.js';

const buildCandidate = function ({
  id = 123,
  createdAt = new Date(),
  firstName = 'Poison',
  lastName = 'Ivy',
  sex = 'F',
  birthPostalCode = null,
  birthINSEECode = '75101',
  birthCity = 'Perpignan',
  birthProvinceCode = '66',
  birthCountry = 'France',
  email = 'poison.ivy@example.net',
  resultRecipientEmail = 'napoleon@example.net',
  birthdate = '1990-05-06',
  extraTimePercentage = 0.3,
  externalId = 'externalId',
  userId = 789,
  sessionId = 456,
  organizationLearnerId,
  authorizedToStart = false,
  complementaryCertificationId = null,
  billingMode = null,
  prepaymentCode = null,
  hasSeenCertificationInstructions = false,
  subscriptions = [],
} = {}) {
  return new Candidate({
    id,
    createdAt,
    firstName,
    lastName,
    sex,
    birthPostalCode,
    birthINSEECode,
    birthCity,
    birthProvinceCode,
    birthCountry,
    email,
    resultRecipientEmail,
    birthdate,
    extraTimePercentage,
    externalId,
    userId,
    sessionId,
    organizationLearnerId,
    authorizedToStart,
    complementaryCertificationId,
    billingMode,
    prepaymentCode,
    hasSeenCertificationInstructions,
    subscriptions,
  });
};

export { buildCandidate };
