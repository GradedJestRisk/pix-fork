const usecases = require('../../domain/usecases');
const userRepository = require('../../infrastructure/repositories/user-repository');
const authenticationService = require('../../../lib/domain/services/authentication/pole-emploi-authentication-service');
const PoleEmploiOidcAuthenticationService = require('../../../lib/domain/services/authentication/pole-emploi-oidc-authentication-service');
const AuthenticationMethod = require('../../domain/models/AuthenticationMethod');

module.exports = {
  async createUser(request, h) {
    const authenticationKey = request.query['authentication-key'];

    const { userId, idToken } = await usecases.createUserFromExternalIdentityProvider({
      authenticationKey,
      identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
    });

    const poleEmploiOidcAuthenticationService = new PoleEmploiOidcAuthenticationService();
    const accessToken = poleEmploiOidcAuthenticationService.createAccessToken(userId);
    await userRepository.updateLastLoggedAt({ userId });

    const response = {
      access_token: accessToken,
      id_token: idToken,
    };
    return h.response(response).code(200);
  },

  async getSendings(request, h) {
    const cursor = request.query.curseur;
    const filters = _extractFilters(request);
    const { sendings, link } = await usecases.getPoleEmploiSendings({ cursor, filters });
    return h.response(sendings).header('link', link).code(200);
  },

  async getAuthUrl(request, h) {
    const result = authenticationService.getAuthUrl({
      redirectUri: request.query['redirect_uri'],
    });
    return h.response(result).code(200);
  },
};

function _extractFilters(request) {
  const filters = {};
  if (Object.keys(request.query).includes('enErreur')) {
    filters.isSuccessful = !request.query.enErreur;
  }
  return filters;
}
