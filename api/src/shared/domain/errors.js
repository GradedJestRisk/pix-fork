import { VALIDATION_ERRORS } from './constants.js';

class DomainError extends Error {
  constructor(message, code, meta) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.meta = meta;
  }
}

class AlreadyExistingEntityError extends DomainError {
  constructor(message = 'L’entité existe déjà.', code, meta) {
    super(message, code);
    if (meta) this.meta = meta;
  }
}

class AlreadyRegisteredEmailError extends DomainError {
  constructor(message = 'Cette adresse e-mail est déjà utilisée.', code = 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS') {
    super(message, code);
  }
}

class AssessmentEndedError extends DomainError {
  constructor(message = 'Evaluation terminée.') {
    super(message);
  }

  getErrorMessage() {
    return {
      data: {
        error: ["L'évaluation est terminée. Nous n'avons plus de questions à vous poser."],
      },
    };
  }
}

class AssessmentResultNotCreatedError extends DomainError {
  constructor(message = "L'assessment result n'a pas pu être généré.") {
    super(message);
  }
}

class AutonomousCourseRequiresATargetProfileWithSimplifiedAccessError extends DomainError {
  constructor() {
    super('Autonomous course requires a target profile with simplified access.');
  }
}

class CancelledInvitationError extends DomainError {
  constructor(
    message = "L'invitation à cette organisation a été annulée.",
    code = 'CANCELLED_ORGANIZATION_INVITATION_CODE',
  ) {
    super(message, code);
  }
}

class CantImproveCampaignParticipationError extends DomainError {
  constructor(message = 'Une campagne de collecte de profils ne peut pas être retentée.') {
    super(message);
  }
}

class CantCalculateCampaignParticipationResultError extends DomainError {
  constructor(message = `Impossible de calculer le résultat de la participation car elle n'a pas été partagée.`) {
    super(message);
  }
}

class CampaignCodeError extends DomainError {
  constructor(message = "Le code campagne n'existe pas.") {
    super(message);
  }
}

class CertificateVerificationCodeGenerationTooManyTrials extends DomainError {
  constructor(numberOfTrials) {
    super(`Could not find an available certificate verification code after ${numberOfTrials} trials`);
  }
}

class CertificationEndedBySupervisorError extends DomainError {
  constructor(message = 'Le surveillant a mis fin à votre test de certification.') {
    super(message);
  }
}

class CertificationEndedByFinalizationError extends DomainError {
  constructor(message = 'La session a été finalisée par votre centre de certification.') {
    super(message);
  }
}

class CertificationCandidateOnFinalizedSessionError extends DomainError {
  constructor(message = "Cette session a déjà été finalisée, l'ajout de candidat n'est pas autorisé") {
    super(message);
    this.code = 'CANDIDATE_NOT_ALLOWED_FOR_FINALIZED_SESSION';
  }
}

class CandidateAlreadyLinkedToUserError extends DomainError {
  constructor(message = 'At least one candidate is already linked to a user.') {
    super(message);
    this.code = 'SESSION_STARTED_CANDIDATE_ALREADY_LINKED_TO_USER';
  }
}

class CertificationCandidateByPersonalInfoNotFoundError extends DomainError {
  constructor(message = "Aucun candidat de certification n'a été trouvé avec ces informations.") {
    super(message);
  }
}

class CertificationCandidateNotFoundError extends DomainError {
  constructor(message = 'No candidate found') {
    super(message);
    this.code = 'CANDIDATE_NOT_FOUND';
  }
}

class CertificationAttestationGenerationError extends DomainError {
  constructor(message = "Une erreur est survenue durant la génération de l'attestation.") {
    super(message);
  }
}

class CsvImportError extends DomainError {
  constructor(code, meta) {
    super('An error occurred during CSV import');
    this.code = code;
    this.meta = meta;
  }
}

class CertificationCandidateByPersonalInfoTooManyMatchesError extends DomainError {
  constructor(message = "Plus d'un candidat de certification a été trouvé avec ces informations.") {
    super(message);
  }
}

class CertificationCandidateDeletionError extends DomainError {
  constructor(message = 'Echec lors de la suppression du candidat de certification.') {
    super(message);
  }
}

class CertificationCandidatePersonalInfoFieldMissingError extends DomainError {
  constructor(message = 'Information obligatoire manquante du candidat de certification.') {
    super(message);
  }
}

class CertificationCandidatePersonalInfoWrongFormat extends DomainError {
  constructor(message = 'Information transmise par le candidat de certification au mauvais format.') {
    super(message);
  }
}

class CertificationCandidatesError extends DomainError {
  constructor({ message = "Quelque chose s'est mal passé. Veuillez réessayer", code = null, meta = null } = {}) {
    super(message, code, meta);
  }
}

class CertificationComputeError extends DomainError {
  constructor(message = 'Erreur lors du calcul de la certification.') {
    super(message);
  }
}

class CertificationCenterMembershipCreationError extends DomainError {
  constructor(message = 'Erreur lors de la création du membership de centre de certification.') {
    super(message);
  }
}

class CertificationCenterMembershipDisableError extends DomainError {
  constructor(message = 'Erreur lors de la mise à jour du membership de centre de certification.') {
    super(message);
  }
}

class ChallengeAlreadyAnsweredError extends DomainError {
  constructor(message = 'La question a déjà été répondue.') {
    super(message);
  }
}

class ChallengeNotAskedError extends DomainError {
  constructor(message = 'La question à laquelle vous essayez de répondre ne vous a pas été proposée.') {
    super(message);
  }
}

class CsvParsingError extends DomainError {
  constructor(message = "Les données n'ont pas pu être parsées.") {
    super(message);
  }
}

class CandidateNotAuthorizedToJoinSessionError extends DomainError {
  constructor(
    message = 'Votre surveillant n’a pas confirmé votre présence dans la salle de test. Vous ne pouvez donc pas encore commencer votre test de certification. Merci de prévenir votre surveillant.',
    code = 'CANDIDATE_NOT_AUTHORIZED_TO_JOIN_SESSION',
  ) {
    super(message, code);
  }
}

class CandidateNotAuthorizedToResumeCertificationTestError extends DomainError {
  constructor(
    message = "Merci de contacter votre surveillant afin qu'il autorise la reprise de votre test.",
    code = 'CANDIDATE_NOT_AUTHORIZED_TO_RESUME_SESSION',
  ) {
    super(message, code);
  }
}

class CertificationBadgeForbiddenDeletionError extends DomainError {
  constructor(message = 'Il est interdit de supprimer un résultat thématique lié à une certification.') {
    super(message);
  }
}

class CampaignTypeError extends DomainError {
  constructor(message = "Ce type de campagne n'est pas autorisé.") {
    super(message);
  }
}

class CertificationCourseNotPublishableError extends DomainError {
  constructor(
    sessionId,
    message = `Publication de la session ${sessionId}: Une Certification avec le statut 'started' ou 'error' ne peut-être publiée.`,
  ) {
    super(message);
  }
}

class ImportLearnerConfigurationError extends DomainError {
  constructor(message, code) {
    super(message);

    this.code = code;
  }
}

class EntityValidationError extends DomainError {
  constructor({ invalidAttributes }) {
    super("Échec de validation de l'entité.");
    this.invalidAttributes = invalidAttributes;
  }

  static fromJoiError(joiError) {
    const invalidAttributes = { attribute: joiError.context.key, message: joiError.message };

    return new EntityValidationError({ invalidAttributes });
  }

  static fromJoiErrors(joiErrors) {
    const invalidAttributes = joiErrors.map((error) => {
      return { attribute: error.context.key, message: error.message };
    });
    return new EntityValidationError({ invalidAttributes });
  }

  static fromMultipleEntityValidationErrors(entityValidationErrors) {
    const invalidAttributes = entityValidationErrors.reduce((invalidAttributes, entityValidationError) => {
      invalidAttributes.push(...entityValidationError.invalidAttributes);
      return invalidAttributes;
    }, []);
    return new EntityValidationError({ invalidAttributes });
  }
}

class EmailModificationDemandNotFoundOrExpiredError extends DomainError {
  constructor(
    message = "La demande de modification d'adresse e-mail n'existe pas ou est expirée.",
    code = 'EXPIRED_OR_NULL_EMAIL_MODIFICATION_DEMAND',
  ) {
    super(message, code);
  }
}

class ModelValidationError extends DomainError {
  constructor({ code, key, format, valids }) {
    super("Échec de validation de l'entité.");

    if (code === VALIDATION_ERRORS.PROPERTY_NOT_UNIQ) {
      this.why = 'uniqueness';
    }

    if (code === VALIDATION_ERRORS.FIELD_DATE_FORMAT) {
      this.why = 'date_format';
      this.acceptedFormat = format;
    }

    if (code === VALIDATION_ERRORS.FIELD_BAD_VALUES) {
      this.why = 'field_bad_values';
      this.valids = valids;
    }

    if (code === VALIDATION_ERRORS.FIELD_REQUIRED) {
      this.why = 'field_required';
    }

    if (code === VALIDATION_ERRORS.FIELD_NOT_STRING) {
      this.why = 'not_a_string';
    }

    if (code === VALIDATION_ERRORS.FIELD_STRING_MIN) {
      this.why = 'string_too_short';
      this.acceptedFormat = format;
    }

    if (code === VALIDATION_ERRORS.FIELD_STRING_MAX) {
      this.why = 'string_too_long';
      this.acceptedFormat = format;
    }

    this.key = key;
    this.code = code;
  }

  static unicityError({ key }) {
    return new ModelValidationError({ code: VALIDATION_ERRORS.PROPERTY_NOT_UNIQ, key });
  }

  static fromJoiError(joiError) {
    let code, key, format, valids;
    if (joiError.type === 'date.format') {
      code = VALIDATION_ERRORS.FIELD_DATE_FORMAT;
      key = joiError.context.key;
      format = joiError.context.format;
    }

    if (joiError.type === 'any.required') {
      code = VALIDATION_ERRORS.FIELD_REQUIRED;
      key = joiError.context.key;
    }

    if (joiError.type === 'any.only') {
      code = VALIDATION_ERRORS.FIELD_BAD_VALUES;
      key = joiError.context.key;
      valids = joiError.context.valids;
    }

    if (joiError.type === 'string.base') {
      code = VALIDATION_ERRORS.FIELD_NOT_STRING;
      key = joiError.context.key;
    }

    if (joiError.type === 'string.min') {
      code = VALIDATION_ERRORS.FIELD_STRING_MIN;
      key = joiError.context.key;
      format = joiError.context.limit;
    }

    if (joiError.type === 'string.max') {
      code = VALIDATION_ERRORS.FIELD_STRING_MAX;
      key = joiError.context.key;
      format = joiError.context.limit;
    }

    return new ModelValidationError({ code, key, format, valids });
  }
}

class ForbiddenAccess extends DomainError {
  constructor(message = 'Accès non autorisé.', code) {
    super(message);
    this.code = code;
  }
}

class InvalidInputDataError extends DomainError {
  constructor({ code = 'INVALID_INPUT_DATA', message = 'Provided input data is invalid', meta } = {}) {
    super(message);

    this.code = code;
    if (meta) this.meta = meta;
  }
}

class InvalidExternalUserTokenError extends DomainError {
  constructor(message = 'L’idToken de l’utilisateur externe est invalide.') {
    super(message);
  }
}

class InvalidPasswordForUpdateEmailError extends DomainError {
  constructor(message = 'Le mot de passe que vous avez saisi est invalide.') {
    super(message);
  }
}

class InvalidResultRecipientTokenError extends DomainError {
  constructor(message = 'Le token de récupération des résultats de la session de certification est invalide.') {
    super(message);
  }
}

class InvalidSessionResultTokenError extends DomainError {
  constructor(message = 'Le token de récupération des résultats de la session de certification est invalide.') {
    super(message);
  }
}

class InvalidTemporaryKeyError extends DomainError {
  constructor(message = 'Demande de réinitialisation invalide.') {
    super(message);
  }

  getErrorMessage() {
    return {
      data: {
        temporaryKey: ['Cette demande de réinitialisation n’est pas valide.'],
      },
    };
  }
}

class InvalidVerificationCodeError extends DomainError {
  constructor(
    message = 'Le code de vérification renseigné ne correspond pas à celui enregistré.',
    code = 'INVALID_VERIFICATION_CODE',
  ) {
    super(message, code);
  }
}

class LanguageNotSupportedError extends DomainError {
  constructor(languageCode) {
    super(`Given language is not supported : "${languageCode}"`);
    this.code = 'LANGUAGE_NOT_SUPPORTED';
    this.meta = { languageCode };
  }
}

class LocaleFormatError extends DomainError {
  constructor(locale) {
    super(`Given locale is in invalid format: "${locale}"`);
    this.code = 'INVALID_LOCALE_FORMAT';
    this.meta = { locale };
  }
}

class LocaleNotSupportedError extends DomainError {
  constructor(locale) {
    super(`Given locale is not supported : "${locale}"`);
    this.code = 'LOCALE_NOT_SUPPORTED';
    this.meta = { locale };
  }
}

class MissingAssessmentId extends DomainError {
  constructor(message = 'AssessmentId manquant ou incorrect') {
    super(message);
  }
}

class MissingBadgeCriterionError extends DomainError {
  constructor(message = 'Vous devez définir au moins un critère pour créer ce résultat thématique.') {
    super(message);
  }
}

class NoCertificationAttestationForDivisionError extends DomainError {
  constructor(division) {
    const message = `Aucune attestation de certification pour la classe ${division}.`;
    super(message);
  }
}

class NotFoundError extends DomainError {
  constructor(message = 'Erreur, ressource introuvable.', code) {
    super(message);
    this.code = code;
  }
}

class OidcError extends DomainError {
  constructor({ code = 'OIDC_GENERIC_ERROR', message }) {
    super(message);
    this.code = code;
  }
}

class TargetProfileRequiresToBeLinkedToAutonomousCourseOrganization extends DomainError {
  constructor() {
    super('Target profile requires to be linked to autonomous course organization.');
  }
}

class UserAlreadyExistsWithAuthenticationMethodError extends DomainError {
  constructor(message = 'Il existe déjà un compte qui possède cette méthode d‘authentification.') {
    super(message);
  }
}

class UserAlreadyLinkedToCandidateInSessionError extends DomainError {
  constructor(message = 'Cet utilisateur est déjà lié à un candidat de certification au sein de cette session.') {
    super(message);
  }
}

class UserCouldNotBeReconciledError extends DomainError {
  constructor(message = "Cet utilisateur n'a pas pu être rattaché à une organisation.") {
    super(message);
  }
}

class UserHasAlreadyLeftSCO extends DomainError {
  constructor(message = 'User has already left SCO.') {
    super(message);
  }
}

class UserIsTemporaryBlocked extends DomainError {
  constructor(message = 'User has been temporary blocked.', code = 'USER_IS_TEMPORARY_BLOCKED') {
    super(message, code);
  }
}

class UserIsBlocked extends DomainError {
  constructor(message = 'User has been blocked.', code = 'USER_IS_BLOCKED') {
    super(message, code);
  }
}

class UserNotAuthorizedToAccessEntityError extends DomainError {
  constructor(message = 'User is not authorized to access ressource') {
    super(message);
  }
}

class UserNotAuthorizedToUpdateEmailError extends DomainError {
  constructor(message = 'User is not authorized to update email') {
    super(message);
  }
}

class UserNotAuthorizedToUpdatePasswordError extends DomainError {
  constructor(
    message = "L'utilisateur n'est pas autorisé à mettre à jour ce mot de passe.",
    code = 'USER_NOT_AUTHORIZED_TO_UPDATE_PASSWORD',
  ) {
    super(message, code);
  }
}

class CertificationCenterPilotFeaturesConflictError extends DomainError {
  constructor(message = 'Certification center pilot features incompatibility', code = 'PILOT_FEATURES_CONFLICT') {
    super(message);
    this.code = code;
  }
}

class UserNotFoundError extends NotFoundError {
  constructor(message = 'Ce compte est introuvable.', code = 'USER_ACCOUNT_NOT_FOUND') {
    super(message, code);
  }

  getErrorMessage() {
    return {
      data: {
        id: ['Ce compte est introuvable.'],
      },
    };
  }
}

class YamlParsingError extends DomainError {
  constructor(message = "Une erreur s'est produite lors de l'interprétation des réponses.") {
    super(message);
  }
}

class AlreadyExistingMembershipError extends DomainError {
  constructor(message = 'Le membership existe déjà.') {
    super(message);
  }
}

class ApplicationWithInvalidClientIdError extends DomainError {
  constructor(message = 'The client ID or secret are invalid.') {
    super(message);
  }
}

class ApplicationWithInvalidClientSecretError extends DomainError {
  constructor(message = 'The client secret is invalid.') {
    super(message);
  }
}

class ApplicationScopeNotAllowedError extends DomainError {
  constructor(message = 'The scope is invalid.') {
    super(message);
  }
}

class AuthenticationMethodNotFoundError extends DomainError {
  constructor(message = 'Authentication method not found.') {
    super(message);
  }
}

class AuthenticationMethodAlreadyExistsError extends DomainError {
  constructor(message = 'Authentication method already exists.') {
    super(message);
  }
}

class OrganizationNotFoundError extends DomainError {
  constructor(message = 'Organisation non trouvée.') {
    super(message);
  }
}

class OrganizationWithoutEmailError extends DomainError {
  constructor(message = 'Organisation sans email renseigné.') {
    super(message);
  }
}

class ManyOrganizationsFoundError extends DomainError {
  constructor(message = 'Plusieurs organisations ont été retrouvées.') {
    super(message);
  }
}

class AlreadyExistingInvitationError extends DomainError {
  constructor(message = "L'invitation de l'organisation existe déjà.") {
    super(message);
  }
}

class AlreadyRatedAssessmentError extends DomainError {
  constructor(message = 'Cette évaluation a déjà été évaluée.') {
    super(message);
  }
}

class AlreadyRegisteredEmailAndUsernameError extends DomainError {
  constructor(message = 'Cette adresse e-mail et cet identifiant sont déjà utilisés.') {
    super(message);
  }
}

class AlreadyRegisteredUsernameError extends DomainError {
  constructor(message = 'Cet identifiant est déjà utilisé.') {
    super(message);
  }
}

class AlreadyExistingCampaignParticipationError extends DomainError {
  constructor(message = 'Une participation à cette campagne existe déjà.') {
    super(message);
  }
}

class AlreadySharedCampaignParticipationError extends DomainError {
  constructor(message = 'Ces résultats de campagne ont déjà été partagés.') {
    super(message);
  }
}

class NoCampaignParticipationForUserAndCampaign extends DomainError {
  constructor(message = "L'utilisateur n'a pas encore participé à la campagne") {
    super(message);
  }
}

class NoStagesForCampaign extends DomainError {
  constructor(message = 'The campaign does not have stages.') {
    super(message);
  }
}

class AccountRecoveryDemandExpired extends DomainError {
  constructor(message = 'This account recovery demand has expired.') {
    super(message);
  }
}

class AccountRecoveryUserAlreadyConfirmEmail extends DomainError {
  constructor(message = 'This user has already a confirmed email.') {
    super(message);
  }
}

class OrganizationLearnersCouldNotBeSavedError extends DomainError {
  constructor(message = 'An error occurred during process') {
    super(message);
  }
}

class OrganizationLearnersConstraintError extends DomainError {
  constructor(message = 'Constraint during inserting organization learners') {
    super(message);
  }
}

class MultipleOrganizationLearnersWithDifferentNationalStudentIdError extends DomainError {
  constructor(message = 'Multiple organization learners with different INE') {
    super(message);
  }
}

class UserNotAuthorizedToUpdateCampaignError extends DomainError {
  constructor(message = "Cet utilisateur n'est pas autorisé à modifier cette campagne.") {
    super(message);
  }
}

class UserNotAuthorizedToCreateCampaignError extends DomainError {
  constructor(message = "Cet utilisateur n'est pas autorisé à créer une campagne.") {
    super(message);
  }
}

class OrganizationNotAuthorizedMultipleSendingAssessmentToCreateCampaignError extends DomainError {
  constructor(organizationId) {
    const message = `L'organisation ${organizationId}, n'est pas autorisée à créer une campagne d'évaluation à envoi multiple.`;
    super(message);
  }
}

class UserNotAuthorizedToUpdateResourceError extends DomainError {
  constructor(message = "Cet utilisateur n'est pas autorisé à mettre à jour la ressource.") {
    super(message);
  }
}

class UserNotAuthorizedToGetCampaignResultsError extends DomainError {
  constructor(message = "Cet utilisateur n'est pas autorisé à récupérer les résultats de la campagne.") {
    super(message);
  }
}

class UserNotAuthorizedToGenerateUsernamePasswordError extends DomainError {
  constructor(message = "Cet utilisateur n'est pas autorisé à générer un identifiant et un mot de passe.") {
    super(message);
  }
}

class UserShouldNotBeReconciledOnAnotherAccountError extends DomainError {
  constructor({ message = "Cet utilisateur n'est pas autorisé à se réconcilier avec ce compte", code, meta }) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

class InvalidCertificationIssueReportForSaving extends DomainError {
  constructor(message = 'Échec lors de la validation du signalement') {
    super(message);
  }
}

class DeprecatedCertificationIssueReportCategoryError extends DomainError {
  constructor(message = 'La catégorie de signalement choisie est dépréciée.') {
    super(message);
  }
}

class DeprecatedCertificationIssueReportSubcategoryError extends DomainError {
  constructor(message = 'La sous-catégorie de signalement choisie est dépréciée.') {
    super(message);
  }
}

class SendingEmailError extends DomainError {
  constructor(emailAddress) {
    super(`Failed to send email to "${emailAddress}" for some unknown reason.`);
    this.code = 'SENDING_EMAIL_FAILED';
  }
}

class SendingEmailToInvalidDomainError extends DomainError {
  constructor(emailAddress) {
    super(`Failed to send email to "${emailAddress}" because domain seems to be invalid.`);
    this.code = 'INVALID_EMAIL_DOMAIN';
  }
}

class SendingEmailToInvalidEmailAddressError extends DomainError {
  constructor(emailAddress, errorMessage) {
    super(`Failed to send email to "${emailAddress}" because email address seems to be invalid.`);
    this.code = 'INVALID_EMAIL_ADDRESS_FORMAT';
    this.meta = {
      emailAddress,
      errorMessage,
    };
  }
}

class SendingEmailToRefererError extends DomainError {
  constructor(failedEmailReferers) {
    super(
      `Échec lors de l'envoi du mail au(x) référent(s) du centre de certification : ${failedEmailReferers.join(', ')}`,
    );
  }
}

class SendingEmailToResultRecipientError extends DomainError {
  constructor(failedEmailsRecipients) {
    super(`Échec lors de l'envoi des résultats au(x) destinataire(s) : ${failedEmailsRecipients.join(', ')}`);
  }
}

class NotEnoughDaysPassedBeforeResetCampaignParticipationError extends DomainError {
  constructor() {
    super(`Il n'est pas possible de remettre à zéro votre parcours pour le moment.`);
  }
}

class MatchingReconciledStudentNotFoundError extends DomainError {
  constructor(message = "Le candidat de certification ne correspond pas à l'étudiant trouvé avec ces informations.") {
    super(message);
    this.code = 'MATCHING_RECONCILED_STUDENT_NOT_FOUND';
  }
}

class UnexpectedUserAccountError extends DomainError {
  constructor({
    message = "Ce compte utilisateur n'est pas celui qui est attendu.",
    code = 'UNEXPECTED_USER_ACCOUNT',
    meta,
  }) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

class MembershipCreationError extends DomainError {
  constructor(message = 'Erreur lors de la création du membership à une organisation.') {
    super(message);
  }
}

class MembershipUpdateError extends DomainError {
  constructor(message = 'Erreur lors de la mise à jour du membership à une organisation.') {
    super(message);
  }
}

class MissingAttributesError extends DomainError {
  constructor(message = 'Attributs manquants.') {
    super(message);
  }
}

class AssessmentNotCompletedError extends DomainError {
  constructor(message = "Cette évaluation n'est pas terminée.") {
    super(message);
  }
}

class DeletedError extends DomainError {
  constructor(message = 'Erreur, ressource supprimée.', code) {
    super(message);
    this.code = code;
  }
}

class ObjectValidationError extends DomainError {
  constructor(message = 'Erreur, objet non valide.') {
    super(message);
  }
}

class OrganizationLearnerAlreadyLinkedToUserError extends DomainError {
  constructor(message = "L'élève est déjà rattaché à un compte utilisateur.", code, meta) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

class OrganizationLearnerAlreadyLinkedToInvalidUserError extends DomainError {
  constructor(message = 'Élève rattaché avec un compte invalide.') {
    super(message);
  }
}

class UserNotAuthorizedToCreateResourceError extends DomainError {
  constructor(message = "Cet utilisateur n'est pas autorisé à créer la ressource.") {
    super(message);
  }
}

class UserOrgaSettingsCreationError extends DomainError {
  constructor(message = 'Erreur lors de la création des paramètres utilisateur relatifs à Pix Orga.') {
    super(message);
  }
}

class UserNotMemberOfOrganizationError extends DomainError {
  constructor(message = "L'utilisateur n'est pas membre de l'organisation.") {
    super(message);
  }
}

class FileValidationError extends DomainError {
  constructor(code, meta) {
    super('An error occurred, file is invalid');
    this.code = code;
    this.meta = meta;
  }
}

class TargetProfileInvalidError extends DomainError {
  constructor(message = 'Le profil cible ne possède aucun acquis ciblé.') {
    super(message);
  }
}

class OrganizationTagNotFound extends DomainError {
  constructor(message = 'Le tag de l’organization n’existe pas.') {
    super(message);
  }
}

class UserNotAuthorizedToCertifyError extends DomainError {
  constructor(message = 'User is not certifiable') {
    super(message);
  }

  getErrorMessage() {
    return {
      data: {
        authorization: ['Vous n’êtes pas autorisé à passer un test de certification.'],
      },
    };
  }
}

class UserNotAuthorizedToRemoveAuthenticationMethod extends DomainError {
  constructor(message = "L'utilisateur n'est pas autorisé à supprimer cette méthode de connexion.") {
    super(message);
  }
}

class OrganizationLearnerDisabledError extends DomainError {
  constructor(message = "L'inscription de l'élève est désactivée dans l'organisation.") {
    super(message);
  }
}

class OrganizationLearnerNotFound extends NotFoundError {
  constructor(message = 'Aucune inscription d‘élève n‘a été trouvée.') {
    super(message);
  }
}

class WrongDateFormatError extends DomainError {
  constructor(message = 'Format de date invalide.') {
    super(message);
  }

  getErrorMessage() {
    return {
      data: {
        date: ['Veuillez renseigner une date de session au format (jj/mm/yyyy).'],
      },
    };
  }
}

const SIECLE_ERRORS = {
  INE_REQUIRED: 'INE_REQUIRED',
  INE_UNIQUE: 'INE_UNIQUE',
  SEX_CODE_REQUIRED: 'SEX_CODE_REQUIRED',
  BIRTH_CITY_CODE_REQUIRED_FOR_FR_STUDENT: 'BIRTH_CITY_CODE_REQUIRED_FOR_FR_STUDENT',
  BIRTHDATE_REQUIRED: 'BIRTHDATE_REQUIRED',
  INVALID_BIRTHDATE_FORMAT: 'INVALID_BIRTHDATE_FORMAT',
  LAST_NAME_REQUIRED: 'LAST_NAME_REQUIRED',
  FIRST_NAME_REQUIRED: 'FIRST_NAME_REQUIRED',
};

class NotImplementedError extends Error {
  constructor(message = 'Not implemented error.') {
    super(message);
  }
}

class InvalidMembershipOrganizationRoleError extends DomainError {
  constructor(message = 'Le rôle du membre est invalide.') {
    super(message);
  }
}

class OidcMissingFieldsError extends DomainError {
  constructor(
    message = 'Mandatory information returned by the identify provider about the user is missing.',
    code,
    meta,
  ) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

class InvalidIdentityProviderError extends DomainError {
  constructor(identityProvider) {
    const message = `Identity provider ${identityProvider} is not supported.`;
    super(message);
  }
}

class InvalidExternalAPIResponseError extends DomainError {
  constructor(message = "L'API externe a renvoyé une réponse incorrecte.") {
    super(message);
  }
}

class NoOrganizationToAttach extends DomainError {
  constructor(message) {
    super(message);
  }
}

class OrganizationLearnerCannotBeDissociatedError extends DomainError {
  constructor(message = 'Impossible de dissocier') {
    super(message);
  }
}

class AcquiredBadgeForbiddenDeletionError extends DomainError {
  constructor(message = 'Il est interdit de supprimer un résultat thématique déjà acquis par un utilisateur.') {
    super(message);
  }
}

class NoSkillsInCampaignError extends DomainError {
  constructor(message = 'La campagne ne contient aucun acquis opérationnel.') {
    super(message);
  }
}

class InvalidJuryLevelError extends DomainError {
  constructor(message = 'Le niveau jury renseigné est invalide.') {
    super(message);
  }
}

class AuditLoggerApiError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class OrganizationLearnerCertificabilityNotUpdatedError extends DomainError {
  constructor(message) {
    super(message);
  }
}

export {
  AccountRecoveryDemandExpired,
  AccountRecoveryUserAlreadyConfirmEmail,
  AcquiredBadgeForbiddenDeletionError,
  AlreadyExistingCampaignParticipationError,
  AlreadyExistingEntityError,
  AlreadyExistingInvitationError,
  AlreadyExistingMembershipError,
  AlreadyRatedAssessmentError,
  AlreadyRegisteredEmailAndUsernameError,
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
  AlreadySharedCampaignParticipationError,
  ApplicationScopeNotAllowedError,
  ApplicationWithInvalidClientIdError,
  ApplicationWithInvalidClientSecretError,
  AssessmentEndedError,
  AssessmentNotCompletedError,
  AssessmentResultNotCreatedError,
  AuditLoggerApiError,
  AuthenticationMethodAlreadyExistsError,
  AuthenticationMethodNotFoundError,
  AutonomousCourseRequiresATargetProfileWithSimplifiedAccessError,
  CampaignCodeError,
  CampaignTypeError,
  CancelledInvitationError,
  CandidateAlreadyLinkedToUserError,
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
  CantCalculateCampaignParticipationResultError,
  CantImproveCampaignParticipationError,
  CertificateVerificationCodeGenerationTooManyTrials,
  CertificationAttestationGenerationError,
  CertificationBadgeForbiddenDeletionError,
  CertificationCandidateByPersonalInfoNotFoundError,
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CertificationCandidateDeletionError,
  CertificationCandidateNotFoundError,
  CertificationCandidateOnFinalizedSessionError,
  CertificationCandidatePersonalInfoFieldMissingError,
  CertificationCandidatePersonalInfoWrongFormat,
  CertificationCandidatesError,
  CertificationCenterMembershipCreationError,
  CertificationCenterMembershipDisableError,
  CertificationCenterPilotFeaturesConflictError,
  CertificationComputeError,
  CertificationCourseNotPublishableError,
  CertificationEndedByFinalizationError,
  CertificationEndedBySupervisorError,
  ChallengeAlreadyAnsweredError,
  ChallengeNotAskedError,
  CsvImportError,
  CsvParsingError,
  DeletedError,
  DeprecatedCertificationIssueReportCategoryError,
  DeprecatedCertificationIssueReportSubcategoryError,
  DomainError,
  EmailModificationDemandNotFoundOrExpiredError,
  EntityValidationError,
  FileValidationError,
  ForbiddenAccess,
  ImportLearnerConfigurationError,
  InvalidCertificationIssueReportForSaving,
  InvalidExternalAPIResponseError,
  InvalidExternalUserTokenError,
  InvalidIdentityProviderError,
  InvalidInputDataError,
  InvalidJuryLevelError,
  InvalidMembershipOrganizationRoleError,
  InvalidPasswordForUpdateEmailError,
  InvalidResultRecipientTokenError,
  InvalidSessionResultTokenError,
  InvalidTemporaryKeyError,
  InvalidVerificationCodeError,
  LanguageNotSupportedError,
  LocaleFormatError,
  LocaleNotSupportedError,
  ManyOrganizationsFoundError,
  MatchingReconciledStudentNotFoundError,
  MembershipCreationError,
  MembershipUpdateError,
  MissingAssessmentId,
  MissingAttributesError,
  MissingBadgeCriterionError,
  ModelValidationError,
  MultipleOrganizationLearnersWithDifferentNationalStudentIdError,
  NoCampaignParticipationForUserAndCampaign,
  NoCertificationAttestationForDivisionError,
  NoOrganizationToAttach,
  NoSkillsInCampaignError,
  NoStagesForCampaign,
  NotEnoughDaysPassedBeforeResetCampaignParticipationError,
  NotFoundError,
  NotImplementedError,
  ObjectValidationError,
  OidcError,
  OidcMissingFieldsError,
  OrganizationLearnerAlreadyLinkedToInvalidUserError,
  OrganizationLearnerAlreadyLinkedToUserError,
  OrganizationLearnerCannotBeDissociatedError,
  OrganizationLearnerCertificabilityNotUpdatedError,
  OrganizationLearnerDisabledError,
  OrganizationLearnerNotFound,
  OrganizationLearnersConstraintError,
  OrganizationLearnersCouldNotBeSavedError,
  OrganizationNotAuthorizedMultipleSendingAssessmentToCreateCampaignError,
  OrganizationNotFoundError,
  OrganizationTagNotFound,
  OrganizationWithoutEmailError,
  SendingEmailError,
  SendingEmailToInvalidDomainError,
  SendingEmailToInvalidEmailAddressError,
  SendingEmailToRefererError,
  SendingEmailToResultRecipientError,
  SIECLE_ERRORS,
  TargetProfileInvalidError,
  TargetProfileRequiresToBeLinkedToAutonomousCourseOrganization,
  UnexpectedUserAccountError,
  UserAlreadyExistsWithAuthenticationMethodError,
  UserAlreadyLinkedToCandidateInSessionError,
  UserCouldNotBeReconciledError,
  UserHasAlreadyLeftSCO,
  UserIsBlocked,
  UserIsTemporaryBlocked,
  UserNotAuthorizedToAccessEntityError,
  UserNotAuthorizedToCertifyError,
  UserNotAuthorizedToCreateCampaignError,
  UserNotAuthorizedToCreateResourceError,
  UserNotAuthorizedToGenerateUsernamePasswordError,
  UserNotAuthorizedToGetCampaignResultsError,
  UserNotAuthorizedToRemoveAuthenticationMethod,
  UserNotAuthorizedToUpdateCampaignError,
  UserNotAuthorizedToUpdateEmailError,
  UserNotAuthorizedToUpdatePasswordError,
  UserNotAuthorizedToUpdateResourceError,
  UserNotFoundError,
  UserNotMemberOfOrganizationError,
  UserOrgaSettingsCreationError,
  UserShouldNotBeReconciledOnAnotherAccountError,
  WrongDateFormatError,
  YamlParsingError,
};
