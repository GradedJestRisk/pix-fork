import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import _get from 'lodash/get';

function _pad(num, size) {
  let s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
}

function _isMatchingReconciledStudentNotFoundError(err) {
  return _get(err, 'errors[0].code') === 'MATCHING_RECONCILED_STUDENT_NOT_FOUND';
}

function _isWrongAccount(err) {
  return _get(err, 'errors[0].status') === '409' && _get(err, 'errors[0].code') === 'UNEXPECTED_USER_ACCOUNT';
}

function _isSessionNotAccessibleError(err) {
  return _get(err, 'errors[0].status') === '412';
}

function _isLanguageNotSupported(err) {
  return _get(err, 'errors[0].code') === 'LANGUAGE_NOT_SUPPORTED';
}

function _isCandidateNotEligibleError(err) {
  return _get(err, 'errors[0].code') === 'CERTIFICATION_CANDIDATE_ELIGIBILITY_ERROR';
}

export default class CertificationJoiner extends Component {
  @service store;
  @service intl;

  SESSION_ID_VALIDATION_PATTERN = '^[0-9]*$';
  V3_CERTIFICATION_SUPPORTED_LANGUAGES = ['en', 'fr'];

  @tracked errorMessage = null;
  @tracked errorDetailList = [];
  @tracked errorMessageLink = null;
  @tracked sessionIdIsNotANumberMessage = null;
  @tracked sessionIdStatus = 'default';
  @tracked validationClassName = '';
  @tracked sessionId = null;
  @tracked firstName = null;
  @tracked lastName = null;
  @tracked dayOfBirth = null;
  @tracked monthOfBirth = null;
  @tracked yearOfBirth = null;

  get birthdate() {
    const monthOfBirth = _pad(this.monthOfBirth, 2);
    const dayOfBirth = _pad(this.dayOfBirth, 2);
    return [this.yearOfBirth, monthOfBirth, dayOfBirth].join('-');
  }

  createCertificationCandidate() {
    const { firstName, lastName, birthdate, sessionId } = this;

    return this.store.createRecord('certification-candidate', {
      sessionId,
      birthdate,
      firstName: firstName ? firstName.trim() : null,
      lastName: lastName ? lastName.trim() : null,
    });
  }

  _isANumber(value) {
    return new RegExp(this.SESSION_ID_VALIDATION_PATTERN).test(value);
  }

  @action
  checkSessionIdIsValid(event) {
    const { value } = event.target;

    this.sessionIdIsNotANumberMessage = null;
    this.sessionIdStatus = 'default';

    if (value && !this._isANumber(value)) {
      this.sessionIdIsNotANumberMessage = this.intl.t(
        'pages.certification-joiner.form.fields-validation.session-number-error',
      );
      this.sessionIdStatus = 'error';
    }
  }

  @action
  setSessionId(event) {
    this.sessionId = event.target.value;
  }

  @action
  setFirstName(event) {
    this.firstName = event.target.value;
  }

  @action
  setLastName(event) {
    this.lastName = event.target.value;
  }

  @action
  async attemptNext(e) {
    e.preventDefault();
    this._resetErrorMessages();
    let currentCertificationCandidate = null;
    if (this.sessionId && !this._isANumber(this.sessionId)) {
      this.sessionIdIsNotANumberError = this.intl.t(
        'pages.certification-joiner.form.fields-validation.session-number-error',
      );
      document.querySelector('#certificationJoinerSessionId').focus();
      return;
    }
    try {
      currentCertificationCandidate = this.createCertificationCandidate();
      await currentCertificationCandidate.save({ adapterOptions: { joinSession: true, sessionId: this.sessionId } });
      this.args.onStepChange(currentCertificationCandidate.id);
    } catch (error) {
      if (currentCertificationCandidate) {
        currentCertificationCandidate.deleteRecord();
      }

      if (_isLanguageNotSupported(error)) {
        const [currentError] = error.errors;
        const { languageCode } = currentError.meta;
        const userLanguage = this.intl.t(`common.languages.${languageCode}`);
        const NO_BREAK_SPACE = String.fromCharCode(160);
        const availableLanguages = this.V3_CERTIFICATION_SUPPORTED_LANGUAGES.map((code) =>
          this.intl.t(`common.languages.${code}`),
        ).join(`, ${NO_BREAK_SPACE}`);

        this.errorMessage = this.intl.t('pages.certification-joiner.error-messages.language-not-supported', {
          userLanguage,
          availableLanguages,
          htmlSafe: true,
        });
        this.errorMessageLink = {
          label: this.intl.t('pages.certification-joiner.error-messages.language-not-supported-link'),
          url: 'https://app.pix.org/mon-compte/langue',
        };
      } else if (_isMatchingReconciledStudentNotFoundError(error)) {
        this.errorMessage = this.intl.t('pages.certification-joiner.error-messages.wrong-account-sco');
        this.errorMessageLink = {
          label: this.intl.t('pages.certification-joiner.error-messages.wrong-account-sco-link.label'),
          url: this.intl.t('pages.certification-joiner.error-messages.wrong-account-sco-link.url'),
        };
      } else if (_isWrongAccount(error)) {
        this.errorMessage = this.intl.t('pages.certification-joiner.error-messages.wrong-account');
      } else if (_isSessionNotAccessibleError(error)) {
        this.errorMessage = this.intl.t('pages.certification-joiner.error-messages.session-not-accessible');
      } else if (_isCandidateNotEligibleError(error)) {
        this.errorMessage = this.intl.t('pages.certification-joiner.error-messages.candidate-not-eligible', {
          htmlSafe: true,
        });
      } else {
        this.errorMessage = this.intl.t('pages.certification-joiner.error-messages.generic.disclaimer');
        this.errorDetailList = [
          this.intl.t('pages.certification-joiner.error-messages.generic.check-session-number'),
          this.intl.t('pages.certification-joiner.error-messages.generic.check-personal-info'),
        ];
      }
    }
  }

  @action
  handleDayInputChange(event) {
    const { value } = event.target;

    if (value.length === 2) {
      document.getElementById('certificationJoinerMonthOfBirth').focus();
    }
  }

  @action
  setDayOfBirth(event) {
    this.dayOfBirth = event.target.value;
  }

  @action
  setMonthOfBirth(event) {
    this.monthOfBirth = event.target.value;
  }

  @action
  setYearOfBirth(event) {
    this.yearOfBirth = event.target.value;
  }

  @action
  handleMonthInputChange(event) {
    const { value } = event.target;

    if (value.length === 2) {
      document.getElementById('certificationJoinerYearOfBirth').focus();
    }
  }

  @action
  handleInputFocus(value, event) {
    event.target.select();
  }

  _resetErrorMessages() {
    this.errorMessage = null;
    this.errorDetailList = [];
    this.errorMessageLink = null;
  }
}
