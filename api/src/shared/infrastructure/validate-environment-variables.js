import Joi from 'joi';

const schema = Joi.object({
  AUTH_SECRET: Joi.string().required(),
  AUTONOMOUS_COURSES_ORGANIZATION_ID: Joi.number().required(),
  BREVO_ACCOUNT_CREATION_TEMPLATE_ID: Joi.number().optional(),
  BREVO_API_KEY: Joi.string().optional(),
  BREVO_ORGANIZATION_INVITATION_SCO_TEMPLATE_ID: Joi.number().optional(),
  BREVO_ORGANIZATION_INVITATION_TEMPLATE_ID: Joi.number().optional(),
  BREVO_PASSWORD_RESET_TEMPLATE_ID: Joi.number().optional(),
  BREVO_SELF_ACCOUNT_DELETION_TEMPLATE_ID: Joi.number().optional(),
  CONTAINER_VERSION: Joi.string().optional(),
  CPF_EXPORTS_STORAGE_ACCESS_KEY_ID: Joi.string().optional(),
  CPF_EXPORTS_STORAGE_BUCKET_NAME: Joi.string().optional(),
  CPF_EXPORTS_STORAGE_ENDPOINT: Joi.string().optional(),
  CPF_EXPORTS_STORAGE_PRE_SIGNED_EXPIRES_IN: Joi.number().optional(),
  CPF_EXPORTS_STORAGE_REGION: Joi.string().optional(),
  CPF_EXPORTS_STORAGE_SECRET_ACCESS_KEY: Joi.string().optional(),
  CPF_PLANNER_JOB_CHUNK_SIZE: Joi.number().optional(),
  CPF_PLANNER_JOB_CRON: Joi.string().optional(),
  CPF_PLANNER_JOB_MINIMUM_RELIABILITY_PERIOD: Joi.number().optional(),
  CPF_PLANNER_JOB_MONTHS_TO_PROCESS: Joi.number().optional(),
  CPF_RECEIPTS_STORAGE_ACCESS_KEY_ID: Joi.string().optional(),
  CPF_RECEIPTS_STORAGE_BUCKET_NAME: Joi.string().optional(),
  CPF_RECEIPTS_STORAGE_ENDPOINT: Joi.string().optional(),
  CPF_RECEIPTS_STORAGE_REGION: Joi.string().optional(),
  CPF_RECEIPTS_STORAGE_SECRET_ACCESS_KEY: Joi.string().optional(),
  CPF_SEND_EMAIL_JOB_CRON: Joi.string().optional(),
  CPF_SEND_EMAIL_JOB_RECIPIENT: Joi.string().optional(),
  DATABASE_CONNECTION_POOL_MAX_SIZE: Joi.number().integer().min(0).optional(),
  DATABASE_CONNECTION_POOL_MIN_SIZE: Joi.number().integer().min(0).optional(),
  DATABASE_URL: Joi.string().uri().optional(),
  DOMAIN_PIX: Joi.string().optional(),
  DOMAIN_PIX_APP: Joi.string().optional(),
  DOMAIN_PIX_ORGA: Joi.string().optional(),
  EMAIL_VALIDATION_DEMAND_TEMPORARY_STORAGE_LIFESPAN: Joi.string().optional().default('3d'),
  ENABLE_KNEX_PERFORMANCE_MONITORING: Joi.string().optional().valid('true', 'false'),
  FORCE_DROP_DATABASE: Joi.string().optional().valid('true', 'false'),
  FT_ALWAYS_OK_VALIDATE_NEXT_CHALLENGE: Joi.string().optional().valid('true', 'false'),
  FT_ENABLE_NEED_TO_ADJUST_CERTIFICATION_ACCESSIBILITY: Joi.string().optional().valid('true', 'false'),
  FT_ENABLE_TEXT_TO_SPEECH_BUTTON: Joi.string().optional().valid('true', 'false'),
  FT_PIX_COMPANION_ENABLED: Joi.string().optional().valid('true', 'false'),
  KNEX_ASYNC_STACKTRACE_ENABLED: Joi.string().optional().valid('true', 'false'),
  LCMS_API_KEY: Joi.string().required(),
  LCMS_API_URL: Joi.string().uri().required(),
  LOG_ENABLED: Joi.string().required().valid('true', 'false'),
  LOG_FOR_HUMANS: Joi.string().optional().valid('true', 'false'),
  LOG_LEVEL: Joi.string().optional().valid('silent', 'fatal', 'error', 'warn', 'info', 'debug', 'trace'),
  LOG_OPS_METRICS: Joi.string().optional().valid('true', 'false'),
  MAILING_ENABLED: Joi.string().optional().valid('true', 'false'),
  MAILING_PROVIDER: Joi.string().optional().valid('brevo', 'mailpit'),
  NODE_ENV: Joi.string().optional().valid('development', 'test', 'production'),
  POLE_EMPLOI_CLIENT_ID: Joi.string().optional(),
  POLE_EMPLOI_CLIENT_SECRET: Joi.string().optional(),
  POLE_EMPLOI_SENDING_URL: Joi.string().uri().optional(),
  POLE_EMPLOI_TOKEN_URL: Joi.string().uri().optional(),
  REDIS_URL: Joi.string().uri().optional(),
  SCO_ACCOUNT_RECOVERY_KEY_LIFETIME_MINUTES: Joi.number().integer().min(1).optional(),
  TEST_DATABASE_URL: Joi.string().optional(),
  TEST_LOG_ENABLED: Joi.string().optional().valid('true', 'false'),
  TEST_REDIS_URL: Joi.string().optional(),
  TLD_FR: Joi.string().optional(),
  TLD_ORG: Joi.string().optional(),
}).options({ allowUnknown: true });

const validateEnvironmentVariables = function () {
  // eslint-disable-next-line n/no-process-env
  const { error } = schema.validate(process.env);
  if (error) {
    throw new Error('Configuration is invalid: ' + error.message + ', but was: ' + error.details[0].context.value);
  }
};

export { validateEnvironmentVariables };
