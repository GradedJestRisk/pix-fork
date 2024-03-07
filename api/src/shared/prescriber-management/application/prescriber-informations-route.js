import Joi from 'joi';

import { identifiersType } from '../../../../src/shared/domain/types/identifiers-type.js';
import { securityPreHandlers } from '../../application/security-pre-handlers.js';
import { prescriberController } from './prescriber-informations-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/prescription/prescribers/{userId}',
      config: {
        validate: {
          params: Joi.object({
            userId: identifiersType.userId,
          }),
        },
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        handler: prescriberController.get,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            '- Récupération d’un prescripteur.\n' +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
        ],
        tags: ['api', 'user', 'prescription'],
      },
    },
  ]);
};

const name = 'prescribers-api';
export { name, register };
