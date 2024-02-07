import { QCU } from './QCU.js';
import { Feedbacks } from '../Feedbacks.js';
import { assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';
import { ValidatorQCU } from '../validator/ValidatorQCU.js';
import { QcuCorrectionResponse } from '../QcuCorrectionResponse.js';
import Joi from 'joi';
import { EntityValidationError } from '../../../../shared/domain/errors.js';

class QCUForAnswerVerification extends QCU {
  userResponse;
  constructor({ id, instruction, locales, proposals, solution, feedbacks, validator }) {
    super({ id, instruction, locales, proposals });

    assertNotNullOrUndefined(solution, 'La solution est obligatoire pour un QCU de vérification');

    this.solutionValue = solution;

    if (feedbacks) {
      this.feedbacks = new Feedbacks(feedbacks);
    }

    if (validator) {
      this.validator = validator;
    } else {
      this.validator = new ValidatorQCU({ solution: { value: this.solutionValue } });
    }
  }

  setUserResponse(userResponse) {
    this.#validateUserResponseFormat(userResponse);
    this.userResponse = userResponse[0];
  }

  assess() {
    const validation = this.validator.assess({ answer: { value: this.userResponse } });

    return new QcuCorrectionResponse({
      status: validation.result,
      feedback: validation.result.isOK() ? this.feedbacks.valid : this.feedbacks.invalid,
      solution: this.solutionValue,
    });
  }

  #validateUserResponseFormat(userResponse) {
    const qcuResponseSchema = Joi.string()
      .pattern(/^[0-9]+$/)
      .required();

    const validUserResponseSchema = Joi.array().items(qcuResponseSchema).min(1).max(1).required();

    const { error } = validUserResponseSchema.validate(userResponse);
    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}

export { QCUForAnswerVerification };
