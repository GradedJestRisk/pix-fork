import Joi from 'joi';

import { handlerWithDependencies } from '../../infrastructure/utils/handlerWithDependencies.js';
import { modulesController } from './controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/modules/{slug}',
      config: {
        auth: false,
        handler: handlerWithDependencies(modulesController.getBySlug),
        validate: {
          params: Joi.object({ slug: Joi.string().required() }),
        },
        notes: ['- Permet de récupérer un module grâce à son titre slugifié'],
        tags: ['api', 'modules'],
      },
    },
  ]);
};

const name = 'modules-api';
export { name, register };
