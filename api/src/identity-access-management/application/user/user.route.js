import Joi from 'joi';
import XRegExp from 'xregexp';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { config } from '../../../shared/config.js';
import { EntityValidationError } from '../../../shared/domain/errors.js';
import { AVAILABLE_LANGUAGES } from '../../../shared/domain/services/language-service.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { userController } from './user.controller.js';
import { userVerification } from './user-existence-verification-pre-handler.js';

const { passwordValidationPattern } = config.account;

export const userRoutes = [
  {
    method: 'PUT',
    path: '/api/users/{id}/email/verification-code',
    config: {
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
        payload: Joi.object({
          data: {
            type: Joi.string().valid('email-verification-codes').required(),
            attributes: {
              'new-email': Joi.string().email().required(),
              password: Joi.string().required(),
            },
          },
        }),
        failAction: (request, h, error) => {
          return EntityValidationError.fromJoiErrors(error.details);
        },
      },
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, h),
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      handler: (request, h) => userController.sendVerificationCode(request, h),
      notes: ['- Permet à un utilisateur de recevoir un code de vérification pour la validation de son adresse mail.'],
      tags: ['api', 'user', 'verification-code'],
    },
  },

  {
    method: 'POST',
    path: '/api/users',
    config: {
      auth: false,
      validate: {
        payload: Joi.object({
          data: Joi.object({
            type: Joi.string(),
            attributes: Joi.object().required(),
            relationships: Joi.object(),
          }).required(),
          meta: Joi.object(),
        }).required(),
        options: {
          allowUnknown: true,
        },
      },
      handler: (request, h) => userController.createUser(request, h),
      notes: ['- **Cette route est publique**\n' + '- Crée un compte utilisateur'],
      tags: ['identity-access-management', 'api', 'user'],
    },
  },
  {
    method: 'GET',
    path: '/api/users/me',
    config: {
      handler: (request, h) => userController.getCurrentUser(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          '- Récupération de l’utilisateur courant\n',
      ],
      tags: ['identity-access-management', 'api', 'user'],
    },
  },
  {
    method: 'GET',
    path: '/api/users/{id}/authentication-methods',
    config: {
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
      },
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, h),
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      handler: (request, h) => userController.getUserAuthenticationMethods(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          "- Elle permet la récupération des noms des méthodes de connexion de l'utilisateur.",
      ],
      tags: ['identity-access-management', 'api', 'user', 'authentication-methods'],
    },
  },
  {
    method: 'PATCH',
    path: '/api/users/{id}/password-update',
    config: {
      auth: false,
      pre: [
        {
          method: (request, h) => userVerification.verifyById(request, h),
          assign: 'user',
        },
      ],
      handler: (request, h) => userController.updatePassword(request, h),
      validate: {
        options: {
          allowUnknown: true,
        },
        params: Joi.object({
          id: identifiersType.userId,
        }),
        payload: Joi.object({
          data: {
            attributes: {
              password: Joi.string().pattern(XRegExp(passwordValidationPattern)).required(),
            },
          },
        }),
      },
      notes: [
        "- Met à jour le mot de passe d'un utilisateur identifié par son id\n" +
          "- Une clé d'identification temporaire permet de vérifier l'identité du demandeur",
      ],
      tags: ['identity-access-managements', 'api', 'user'],
    },
  },
  {
    method: 'PATCH',
    path: '/api/users/{id}/pix-terms-of-service-acceptance',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, h),
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
      },
      handler: (request, h) => userController.acceptPixLastTermsOfService(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          "- Sauvegarde le fait que l'utilisateur a accepté les dernières Conditions Générales d'Utilisation de Pix App\n" +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié\n' +
          "- Le contenu de la requête n'est pas pris en compte.",
      ],
      tags: ['identity-access-management', 'api', 'user'],
    },
  },
  {
    method: 'PATCH',
    path: '/api/users/{id}/pix-orga-terms-of-service-acceptance',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, h),
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
      },
      handler: (request, h) => userController.acceptPixOrgaTermsOfService(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          "- Sauvegarde le fait que l'utilisateur a accepté les Conditions Générales d'Utilisation de Pix Orga\n" +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié\n' +
          "- Le contenu de la requête n'est pas pris en compte.",
      ],
      tags: ['identity-access-management', 'api', 'user'],
    },
  },
  {
    method: 'PATCH',
    path: '/api/users/{id}/pix-certif-terms-of-service-acceptance',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, h),
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
      },
      handler: (request, h) => userController.acceptPixCertifTermsOfService(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          "- Sauvegarde le fait que l'utilisateur a accepté les Conditions Générales d'Utilisation de Pix Certif\n" +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié\n' +
          "- Le contenu de la requête n'est pas pris en compte.",
      ],
      tags: ['identity-access-management', 'api', 'user'],
    },
  },
  {
    method: 'PATCH',
    path: '/api/users/{id}/lang/{lang}',
    config: {
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
          lang: Joi.string().valid(...AVAILABLE_LANGUAGES),
        }),
      },
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, h),
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      handler: (request, h) => userController.changeUserLanguage(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          "- Modifie la langue de l'utilisateur\n" +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié\n' +
          '- La lang contient les deux lettres de la langue choisie.',
      ],
      tags: ['identity-access-management', 'api', 'user'],
    },
  },
  {
    method: 'PATCH',
    path: '/api/users/{id}/has-seen-last-data-protection-policy-information',
    config: {
      pre: [
        {
          method: (request, h) => securityPreHandlers.checkRequestedUserIsAuthenticatedUser(request, h),
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
      },
      handler: (request, h) => userController.rememberUserHasSeenLastDataProtectionPolicyInformation(request, h),
      notes: [
        '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
          "- Sauvegarde le fait que l'utilisateur ait vu la nouvelle politique de confidentialité Pix" +
          '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
      ],
      tags: ['identity-access-management', 'api', 'user'],
    },
  },
  {
    method: 'GET',
    path: '/api/users/validate-email',
    config: {
      auth: false,
      validate: {
        query: Joi.object({
          token: Joi.string().uuid().optional(),
          redirect_url: Joi.string()
            .uri({ scheme: ['https'] })
            .optional(),
        }),
      },
      handler: (request, h) => userController.validateUserAccountEmail(request, h),
      notes: [
        '- **Cette route est publique**\n' +
          "- Valide l'email du compte utilisateur puis le redirige vers la redirect_url\n" +
          '- Le token de validation en paramètre doit correspondre à celui de l’utilisateur',
      ],
      tags: ['identity-access-management', 'api', 'user'],
    },
  },
  {
    method: 'POST',
    path: '/api/users/{id}/update-email',
    config: {
      pre: [
        {
          method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
          assign: 'requestedUserIsAuthenticatedUser',
        },
      ],
      handler: userController.updateUserEmailWithValidation,
      validate: {
        params: Joi.object({
          id: identifiersType.userId,
        }),
        options: {
          allowUnknown: true,
        },
        payload: Joi.object({
          data: {
            type: Joi.string().valid('email-verification-codes').required(),
            attributes: {
              code: Joi.string()
                .regex(/^[1-9]{6}$/)
                .required(),
            },
          },
        }),
        failAction: (request, h, error) => {
          return EntityValidationError.fromJoiErrors(error.details);
        },
      },
      notes: [
        "- Suite à une demande de changement d'adresse e-mail, met à jour cette dernière pour l'utilisateur identifié par son id.",
      ],
      tags: ['api', 'user', 'update-email'],
    },
  },
];
