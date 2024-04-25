import { HttpErrors } from '../../shared/application/http-errors.js';
import { DomainErrorMappingConfiguration } from '../../shared/application/models/domain-error-mapping-configuration.js';
import { CompetenceResetError, EmptyAnswerError, ImproveCompetenceEvaluationForbiddenError, AcquiredBadgeForbiddenUpdateError } from '../domain/errors.js';

const evaluationDomainErrorMappingConfiguration = [
  {
    name: EmptyAnswerError.name,
    httpErrorFn: (error) => {
      return new HttpErrors.BadRequestError(error.message, error.code);
    },
  },
  {
    name: ImproveCompetenceEvaluationForbiddenError.name,
    httpErrorFn: (error) => {
      return new HttpErrors.ForbiddenError(error.message, error.code);
    },
  },
  {
    name: CompetenceResetError.name,
    httpErrorFn: (error) => {
      return new HttpErrors.PreconditionFailedError(error.message);
    },
  },
  {
    name: AcquiredBadgeForbiddenUpdateError.name,
    httpErrorFn: (error) => {
      return new HttpErrors.ForbiddenError(error.message);
    },
  },
].map((domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration));

export { evaluationDomainErrorMappingConfiguration };
