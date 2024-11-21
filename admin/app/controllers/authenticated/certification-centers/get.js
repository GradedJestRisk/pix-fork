import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

import { types } from '../../../models/certification-center';

export default class AuthenticatedCertificationCentersGetController extends Controller {
  certificationCenterTypes = types;

  @service pixToast;
  @service store;
  @service intl;

  @tracked isEditMode = false;
  @tracked selectedCertificationCenterType;

  @action
  selectCertificationCenterType(event) {
    this.model.certificationCenter.type = event.target.value;
  }

  @action
  async updateCertificationCenter() {
    try {
      await this.model.certificationCenter.save();
      this.pixToast.sendSuccessNotification({ message: 'Centre de certification mis à jour avec succès.' });
    } catch (error) {
      if (get(error, 'errors[0].code') === 'PILOT_FEATURES_CONFLICT') {
        return this.pixToast.sendErrorNotification({
          message: this.intl.t(
            'pages.certification-centers.notifications.update.errors.pilot-features-incompatibilities',
          ),
        });
      }
      this.pixToast.sendErrorNotification({
        message: "Une erreur est survenue, le centre de certification n'a pas été mis à jour.",
      });
    }
  }
}
