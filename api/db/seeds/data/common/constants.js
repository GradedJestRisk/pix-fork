import { Tag } from '../../../../src/organizational-entities/domain/models/Tag.js';

const DEFAULT_PASSWORD = 'pix123';
const COMMON_OFFSET_ID = 1000;

//USERS
const USER_ID_ADMIN_ORGANIZATION = COMMON_OFFSET_ID;
const USER_ID_MEMBER_ORGANIZATION = COMMON_OFFSET_ID + 1;

// ADMIN USER ID
const REAL_PIX_SUPER_ADMIN_ID = 90000;

// TARGET PROFILE
const PIX_PUBLIC_TARGET_PROFILE_ID = 76;

// FEATURES TABLE
const FEATURE_COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY_ID = COMMON_OFFSET_ID + 1;
const FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID = COMMON_OFFSET_ID + 2;
const FEATURE_PLACES_MANAGEMENT_ID = COMMON_OFFSET_ID + 3;
const FEATURE_MISSIONS_MANAGEMENT_ID = COMMON_OFFSET_ID + 4;
const FEATURE_LEARNER_IMPORT_ID = COMMON_OFFSET_ID + 5;
const FEATURE_CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE_ID = COMMON_OFFSET_ID + 6;
const FEATURE_CAMPAIGN_EXTERNAL_ID = COMMON_OFFSET_ID + 7;
const FEATURE_ORALIZATION_ID = COMMON_OFFSET_ID + 8;
const FEATURE_ATTESTATIONS_MANAGEMENT_ID = COMMON_OFFSET_ID + 9;

//ORGANIZATIONS
const SCO_MANAGING_ORGANIZATION_ID = COMMON_OFFSET_ID;
const SUP_MANAGING_ORGANIZATION_ID = COMMON_OFFSET_ID + 1;
const SCO_FREGATA_MANAGING_ORGANIZATION_ID = COMMON_OFFSET_ID + 2;
const SCO_ORGANIZATION_ID = COMMON_OFFSET_ID + 3;
const SUP_ORGANIZATION_ID = COMMON_OFFSET_ID + 4;
const PRO_ORGANIZATION_ID = COMMON_OFFSET_ID + 5;
const PRO_MANAGING_ORGANIZATION_ID = COMMON_OFFSET_ID + 6;

// ORGANIZATION FEATURES TABLE
const IMPORT_FORMAT_ONDE_ID = COMMON_OFFSET_ID + 1;
const IMPORT_FORMAT_GENERIC_ID = COMMON_OFFSET_ID + 2;

//TAGS
const AGRICULTURE_TAG = {
  id: 1,
  name: Tag.AGRICULTURE,
};
const PUBLIC_TAG = {
  id: 2,
  name: Tag.PUBLIC,
};
const PRIVE_TAG = {
  id: 3,
  name: Tag.PRIVE,
};
const POLE_EMPLOI_TAG = {
  id: 4,
  name: Tag.POLE_EMPLOI,
};
const CFA_TAG = {
  id: 5,
  name: Tag.CFA,
};
const AEFE_TAG = {
  id: 6,
  name: Tag.AEFE,
};
const MEDNUM_TAG = {
  id: 7,
  name: Tag.MEDIATION_NUMERIQUE,
};
const COLLEGE_TAG = {
  id: 8,
  name: Tag.COLLEGE,
};
const LYCEE_TAG = {
  id: 9,
  name: Tag.LYCEE,
};

export {
  AEFE_TAG,
  AGRICULTURE_TAG,
  CFA_TAG,
  COLLEGE_TAG,
  DEFAULT_PASSWORD,
  FEATURE_ATTESTATIONS_MANAGEMENT_ID,
  FEATURE_CAMPAIGN_EXTERNAL_ID,
  FEATURE_CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE_ID,
  FEATURE_COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY_ID,
  FEATURE_LEARNER_IMPORT_ID,
  FEATURE_MISSIONS_MANAGEMENT_ID,
  FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID,
  FEATURE_ORALIZATION_ID,
  FEATURE_PLACES_MANAGEMENT_ID,
  IMPORT_FORMAT_GENERIC_ID,
  IMPORT_FORMAT_ONDE_ID,
  LYCEE_TAG,
  MEDNUM_TAG,
  PIX_PUBLIC_TARGET_PROFILE_ID,
  POLE_EMPLOI_TAG,
  PRIVE_TAG,
  PRO_MANAGING_ORGANIZATION_ID,
  PRO_ORGANIZATION_ID,
  PUBLIC_TAG,
  REAL_PIX_SUPER_ADMIN_ID,
  SCO_FREGATA_MANAGING_ORGANIZATION_ID,
  SCO_MANAGING_ORGANIZATION_ID,
  SCO_ORGANIZATION_ID,
  SUP_MANAGING_ORGANIZATION_ID,
  SUP_ORGANIZATION_ID,
  USER_ID_ADMIN_ORGANIZATION,
  USER_ID_MEMBER_ORGANIZATION,
};
