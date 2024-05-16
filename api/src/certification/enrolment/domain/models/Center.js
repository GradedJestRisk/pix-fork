import { assertEnumValue } from '../../../../shared/domain/models/asserts.js';
import { CERTIFICATION_FEATURES } from '../../../shared/domain/constants.js';
import { CenterTypes } from './CenterTypes.js';

export class Center {
  /**
   * @param {Object} props
   * @param {number} props.id
   * @param {CenterTypes} props.type
   * @param {Array<number>} props.habilitations List of complementary certification id
   * @param {Array<string>} props.features List of center features
   */
  constructor({ id, name, type, habilitations = [], features = [] } = {}) {
    assertEnumValue(CenterTypes, type);

    this.id = id;
    this.name = name;
    this.type = type;
    this.habilitations = habilitations;
    this.features = features;
  }

  get hasBillingMode() {
    return this.type !== CenterTypes.SCO;
  }

  get isComplementaryAlonePilot() {
    return this.features.includes(CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key);
  }
}
