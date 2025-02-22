import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

const ERROR_MESSAGE = {
  INVALID_EMAIL: 'pages.fill-in-participant-external-id.errors.invalid-external-id-email',
  INVALID_EXTERNAL_ID: 'pages.fill-in-participant-external-id.errors.invalid-external-id',
  MISSING_EXTERNAL_ID: 'pages.fill-in-participant-external-id.errors.missing-external-id',
};
export default class FillInParticipantExternalId extends Component {
  @service intl;
  @service campaignStorage;

  @tracked participantExternalId = this.previousParticipantExternalId || null;
  @tracked isLoading = false;
  @tracked errorMessage = ERROR_MESSAGE[this.previousError] ? this.intl.t(ERROR_MESSAGE[this.previousError]) : null;

  get previousError() {
    return this.campaignStorage.get(this.args.campaign.code, 'error');
  }
  get previousParticipantExternalId() {
    return this.campaignStorage.get(this.args.campaign.code, 'previousParticipantExternalId');
  }

  @action
  submit(event) {
    event.preventDefault();

    if (!this.participantExternalId) {
      this.errorMessage = this.intl.t('pages.fill-in-participant-external-id.errors.missing-external-id', {
        idPixLabel: this.args.campaign.idPixLabel,
      });
      return;
    }

    if (this.participantExternalId.length > 255) {
      this.errorMessage = this.intl.t('pages.fill-in-participant-external-id.errors.max-length-external-id', {
        idPixLabel: this.args.campaign.idPixLabel,
      });
      return;
    }

    this.errorMessage = null;
    return this.args.onSubmit(this.participantExternalId);
  }

  @action
  updateParticipantExternalId(event) {
    this.participantExternalId = event.target.value;
  }

  @action
  cancel() {
    this.errorMessage = null;
    return this.args.onCancel();
  }

  get idPixInputType() {
    if (this.args.campaign.idPixType === 'EMAIL') {
      return 'email';
    } else if (this.args.campaign.idPixType === 'STRING') {
      return 'text';
    }
    return null;
  }

  get idPixInputSubLabel() {
    if (this.args.campaign.idPixType === 'EMAIL') {
      return this.intl.t('pages.sign-up.fields.email.help');
    } else if (this.args.campaign.idPixInputType === 'STRING') {
      return '';
    }
    return null;
  }
}
