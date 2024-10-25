import { config } from '../config.js';

const LEVENSHTEIN_DISTANCE_MAX_RATE = 0.25;

const MAX_FILE_SIZE_UPLOAD = 1048576 * 20;

const LOCALE = {
  ENGLISH_SPOKEN: 'en',
  FRENCH_FRANCE: 'fr-fr',
  FRENCH_SPOKEN: 'fr',
  DUTCH_SPOKEN: 'nl',
  SPANISH_SPOKEN: 'es',
};

const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'fr-BE', 'fr-FR', 'nl-BE'];

const ORGANIZATION_FEATURE = {
  MISSIONS_MANAGEMENT: {
    key: 'MISSIONS_MANAGEMENT',
    description: "Permet l'affichage de la page des missions sur PixOrga",
  },
  LEARNER_IMPORT: {
    key: 'LEARNER_IMPORT',
    description: "Permet l'import de participants sur PixOrga",
    FORMAT: {
      ONDE: 'ONDE',
    },
  },
  PLACES_MANAGEMENT: {
    key: 'PLACES_MANAGEMENT',
    description: "Permet l'affichage de la page de gestion des places sur PixOrga",
  },
  MULTIPLE_SENDING_ASSESSMENT: {
    key: 'MULTIPLE_SENDING_ASSESSMENT',
    description: "Permet d'activer l'envoi multiple sur les campagnes d'évaluation",
  },
  COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY: {
    key: 'COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY',
    description: "Permet d'activer la remontée automatique de la certificabilité des prescrits",
  },
  ORALIZATION: {
    key: 'ORALIZATION',
description: "Permet au prescripteur qui travail sur PixJunior d'activer ou désactiver l'oralisation pour un prescrit depuis pixOrga."
  },
};

const CAMPAIGN_FEATURES = {
  EXTERNAL_ID: {
    key: 'EXTERNAL_ID',
    description: "Permet d'activer la saisie d'un identifiant externe lors de la participation à une campagne",
  },
};

const VALIDATION_ERRORS = {
  FIELD_DATE_FORMAT: 'FIELD_DATE_FORMAT',
  FIELD_BAD_VALUES: 'FIELD_BAD_VALUES',
  FIELD_NOT_STRING: 'FIELD_NOT_STRING',
  FIELD_REQUIRED: 'FIELD_REQUIRED',
  FIELD_STRING_MAX: 'FIELD_STRING_MAX',
  FIELD_STRING_MIN: 'FIELD_STRING_MIN',
  FIRSTNAME_PROPERTY_REQUIRED: 'FIRSTNAME_PROPERTY_REQUIRED',
  LASTNAME_PROPERTY_REQUIRED: 'LASTNAME_PROPERTY_REQUIRED',
  PROPERTY_NOT_UNIQ: 'PROPERTY_NOT_UNIQ',
  UNICITY_COLUMNS_REQUIRED: 'UNICITY_COLUMNS_REQUIRED',
};

const PIX_COUNT_BY_LEVEL = 8;
const COMPETENCES_COUNT = 16;
const MAX_REACHABLE_PIX_BY_COMPETENCE = config.features.maxReachableLevel * PIX_COUNT_BY_LEVEL;

const MAX_REACHABLE_LEVEL = config.features.maxReachableLevel;
const MAX_REACHABLE_PIX_SCORE = MAX_REACHABLE_PIX_BY_COMPETENCE * COMPETENCES_COUNT;
const MAX_CHALLENGES_PER_COMPETENCE_FOR_CERTIFICATION = 3;
const MAX_CHALLENGES_PER_AREA_FOR_CERTIFICATION_PLUS = 4;
const MAX_MASTERY_RATE = 1;
const MINIMUM_DELAY_IN_DAYS_FOR_RESET = config.features.dayBeforeCompetenceResetV2;
const MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING = config.features.dayBeforeImproving;
const MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING = config.features.dayBeforeRetrying;

const MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY = 5;
const MINIMUM_COMPETENCE_LEVEL_FOR_CERTIFIABILITY = 1;
const MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED = 50;
const MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED = 80;

const V3_REPRODUCIBILITY_RATE = 100;
const UNCERTIFIED_LEVEL = -1;

const MAX_LEVEL_TO_BE_AN_EASY_TUBE = 3;
const DEFAULT_LEVEL_FOR_FIRST_CHALLENGE = 2;
const MAX_DIFF_BETWEEN_USER_LEVEL_AND_SKILL_LEVEL = 2;

const ALL_TREATMENTS = ['t1', 't2', 't3'];
const PIX_ORIGIN = 'Pix';

const AUTONOMOUS_COURSES_ORGANIZATION_ID = config.autonomousCourse.autonomousCoursesOrganizationId;

const STUDENT_RECONCILIATION_ERRORS = {
  RECONCILIATION: {
    IN_OTHER_ORGANIZATION: {
      email: { shortCode: 'R11', code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION' },
      username: { shortCode: 'R12', code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION' },
      samlId: { shortCode: 'R13', code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION' },
    },
    IN_SAME_ORGANIZATION: {
      email: { shortCode: 'R31', code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION' },
      username: { shortCode: 'R32', code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION' },
      samlId: { shortCode: 'R33', code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION' },
      anotherStudentIsAlreadyReconciled: { shortCode: 'R70', code: 'USER_ALREADY_RECONCILED_IN_THIS_ORGANIZATION' },
    },
    ACCOUNT_BELONGING_TO_ANOTHER_USER: { shortCode: 'R90', code: 'ACCOUNT_SEEMS_TO_BELONGS_TO_ANOTHER_USER' },
  },
  LOGIN_OR_REGISTER: {
    IN_DB: {
      username: { shortCode: 'S50', code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_IN_DB' },
    },
    IN_SAME_ORGANIZATION: {
      email: { shortCode: 'S51', code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION' },
      username: { shortCode: 'S52', code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION' },
      samlId: { shortCode: 'S53', code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION' },
    },
    IN_OTHER_ORGANIZATION: {
      email: { shortCode: 'S61', code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION' },
      username: { shortCode: 'S62', code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION' },
      samlId: { shortCode: 'S63', code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION' },
    },
  },
};

const OIDC_ERRORS = {
  USER_INFO: {
    missingFields: { shortCode: 'OIDC01', code: 'USER_INFO_MISSING_FIELDS' },
    badResponseFormat: { shortCode: 'OIDC02', code: 'USER_INFO_BAD_RESPONSE_FORMAT' },
  },
};

const CERTIFICATION_CENTER_TYPES = {
  SUP: 'SUP',
  SCO: 'SCO',
  PRO: 'PRO',
};

const constants = {
  ALL_TREATMENTS,
  AUTONOMOUS_COURSES_ORGANIZATION_ID,
  CERTIFICATION_CENTER_TYPES,
  COMPETENCES_COUNT,
  DEFAULT_LEVEL_FOR_FIRST_CHALLENGE,
  MAX_CHALLENGES_PER_AREA_FOR_CERTIFICATION_PLUS,
  MAX_CHALLENGES_PER_COMPETENCE_FOR_CERTIFICATION,
  MAX_DIFF_BETWEEN_USER_LEVEL_AND_SKILL_LEVEL,
  MAX_LEVEL_TO_BE_AN_EASY_TUBE,
  MAX_MASTERY_RATE,
  MAX_REACHABLE_LEVEL,
  MAX_REACHABLE_PIX_BY_COMPETENCE,
  MAX_REACHABLE_PIX_SCORE,
  MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY,
  MINIMUM_COMPETENCE_LEVEL_FOR_CERTIFIABILITY,
  MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING,
  MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING,
  MINIMUM_DELAY_IN_DAYS_FOR_RESET,
  MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED,
  MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED,
  OIDC_ERRORS,
  PIX_COUNT_BY_LEVEL,
  PIX_ORIGIN,
  STUDENT_RECONCILIATION_ERRORS,
  UNCERTIFIED_LEVEL,
};

export {
  ALL_TREATMENTS,
  CAMPAIGN_FEATURES,
  CERTIFICATION_CENTER_TYPES,
  COMPETENCES_COUNT,
  constants,
  DEFAULT_LEVEL_FOR_FIRST_CHALLENGE,
  LEVENSHTEIN_DISTANCE_MAX_RATE,
  LOCALE,
  MAX_CHALLENGES_PER_AREA_FOR_CERTIFICATION_PLUS,
  MAX_CHALLENGES_PER_COMPETENCE_FOR_CERTIFICATION,
  MAX_DIFF_BETWEEN_USER_LEVEL_AND_SKILL_LEVEL,
  MAX_FILE_SIZE_UPLOAD,
  MAX_LEVEL_TO_BE_AN_EASY_TUBE,
  MAX_MASTERY_RATE,
  MAX_REACHABLE_LEVEL,
  MAX_REACHABLE_PIX_BY_COMPETENCE,
  MAX_REACHABLE_PIX_SCORE,
  MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY,
  MINIMUM_COMPETENCE_LEVEL_FOR_CERTIFIABILITY,
  MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING,
  MINIMUM_DELAY_IN_DAYS_BEFORE_RETRYING,
  MINIMUM_DELAY_IN_DAYS_FOR_RESET,
  MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED,
  MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED,
  OIDC_ERRORS,
  ORGANIZATION_FEATURE,
  PIX_COUNT_BY_LEVEL,
  PIX_ORIGIN,
  STUDENT_RECONCILIATION_ERRORS,
  SUPPORTED_LOCALES,
  UNCERTIFIED_LEVEL,
  V3_REPRODUCIBILITY_RATE,
  VALIDATION_ERRORS,
};
