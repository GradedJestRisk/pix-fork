import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { buildValidations, validator } from 'ember-cp-validations';
import { getOwner } from '@ember/application';
import Object, { action } from '@ember/object';
import { types } from '../../models/certification-center';

const Validations = buildValidations({
  name: {
    validators: [
      validator('presence', {
        presence: true,
        ignoreBlank: true,
        message: 'Le nom ne peut pas être vide',
      }),
      validator('length', {
        min: 1,
        max: 255,
        message: 'La longueur du nom ne doit pas excéder 255 caractères',
      }),
    ],
  },
  type: {
    validators: [
      validator('presence', {
        presence: true,
        ignoreBlank: true,
        message: 'Le type ne peut pas être vide',
      }),
    ],
  },
  externalId: {
    validators: [
      validator('length', {
        min: 0,
        max: 255,
        message: "La longueur de l'identifiant externe ne doit pas excéder 255 caractères",
      }),
    ],
  },
});

class Form extends Object.extend(Validations) {
  @tracked name;
  @tracked externalId;
  @tracked type;
  @tracked isSupervisorAccessEnabled;
  @tracked habilitations;
}

export default class InformationEdit extends Component {
  certificationCenterTypes = types;

  constructor() {
    super(...arguments);
    this.form = Form.create(getOwner(this).ownerInjection());
    this._initForm();
  }

  get availableHabilitations() {
    return this.args.availableHabilitations?.sortBy('id');
  }

  @action
  selectCertificationCenterType(event) {
    this.form.type = event.target.value;
  }

  @action
  updateGrantedHabilitation(habilitation) {
    const habilitations = this.form.habilitations;
    if (habilitations.includes(habilitation)) {
      this.form.habilitations.removeObject(habilitation);
    } else {
      this.form.habilitations.addObject(habilitation);
    }
  }

  @action
  async updateCertificationCenter(event) {
    event.preventDefault();

    const { validations } = await this.form.validate();
    if (!validations.isValid) {
      return;
    }

    this.args.certificationCenter.set('name', this.form.name.trim());
    this.args.certificationCenter.set('externalId', !this.form.externalId ? null : this.form.externalId.trim());
    this.args.certificationCenter.set('type', this.form.type.trim());
    this.args.certificationCenter.set('isSupervisorAccessEnabled', this.form.isSupervisorAccessEnabled);
    this.args.certificationCenter.set('habilitations', this.form.habilitations);

    this.args.toggleEditMode();
    return this.args.onSubmit();
  }

  _initForm() {
    const { habilitations, name, externalId, type, isSupervisorAccessEnabled } =
      this.args.certificationCenter.getProperties(
        'habilitations',
        'name',
        'externalId',
        'type',
        'isSupervisorAccessEnabled'
      );

    this.form.name = name;
    this.form.habilitations = habilitations ? habilitations.toArray() : [];
    this.form.externalId = externalId;
    this.form.type = type;
    this.form.isSupervisorAccessEnabled = isSupervisorAccessEnabled;
  }
}
