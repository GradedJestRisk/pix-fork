import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CERTIFICATION_FEATURES } from '../../../shared/domain/constants.js';
import { Center } from '../../domain/models/Center.js';

const getById = async ({ id }) => {
  const center = await knex
    .select({
      id: 'certification-centers.id',
      name: 'certification-centers.name',
      type: 'certification-centers.type',
      externalId: 'certification-centers.externalId',
      habilitations: knex.raw(
        'array_remove(array_agg("complementary-certification-habilitations"."complementaryCertificationId" order by "complementary-certification-habilitations"."complementaryCertificationId"), NULL)',
      ),
      features: knex.raw('array_remove(array_agg("certificationCenterFeatures"."key"), NULL)'),
      createdAt: 'certification-centers.createdAt',
      updatedAt: 'certification-centers.updatedAt',
      isV3Pilot: 'certification-centers.isV3Pilot',
      isComplementaryAlonePilot: knex.raw(
        'CASE WHEN count("complementaryCertificationAloneFeature"."certificationCenterId") > 0 THEN TRUE ELSE FALSE END',
      ),
    })
    .from('certification-centers')
    .leftJoin(
      'complementary-certification-habilitations',
      'certification-centers.id',
      'complementary-certification-habilitations.certificationCenterId',
    )
    .leftJoin(
      _getCertificationCenterFeatures({ id }),
      'certification-centers.id',
      'certificationCenterFeatures.certificationCenterId',
    )
    .leftJoin(
      function () {
        this.select('certificationCenterId')
          .from('certification-center-features')
          .innerJoin('features', function () {
            this.on('certification-center-features.featureId', 'features.id').andOnVal(
              'features.key',
              CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key,
            );
          })
          .as('complementaryCertificationAloneFeature');
      },
      'complementaryCertificationAloneFeature.certificationCenterId',
      'certification-centers.id',
    )
    .where('certification-centers.id', '=', id)
    .groupBy('certification-centers.id')
    .first();

  if (!center) {
    throw new NotFoundError('Center not found');
  }

  return _toDomain(center);
};

export { getById };

function _toDomain(row) {
  return new Center(row);
}

function _getCertificationCenterFeatures({ id }) {
  return (builder) => {
    return builder
      .select('certification-center-features.certificationCenterId', 'features.key')
      .from('certification-center-features')
      .innerJoin('features', 'features.id', 'certification-center-features.featureId')
      .where('certification-center-features.certificationCenterId', '=', id)
      .as('certificationCenterFeatures');
  };
}
