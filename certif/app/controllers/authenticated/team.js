import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class Team extends Controller {
  @service featureToggles;
  @tracked shouldShowRefererSelectionModal = false;
  @tracked selectedReferer = '';

  get shouldDisplayNoRefererSection() {
    return (
      this.model.hasCleaHabilitation &&
      _hasNoReferer(this.model.members) &&
      this.featureToggles.featureToggles.isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled
    );
  }

  get membersSelectOptionsSortedByLastName() {
    return this.model.members
      .toArray()
      .sort((member1, member2) => member1.lastName.localeCompare(member2.lastName, 'fr-FR', { sensitivity: 'base' }))
      .map((member) => ({ value: member.id, label: `${member.firstName} ${member.lastName}` }));
  }

  @action
  onSelectReferer(event) {
    this.selectedReferer = event.target.value;
  }

  @action
  toggleRefererModal() {
    this.shouldShowRefererSelectionModal = !this.shouldShowRefererSelectionModal;
  }
}

function _hasNoReferer(members) {
  return !members.toArray().some((member) => member.isReferer);
}
