import { LOCALE } from '../../../shared/domain/constants.js';
import { getTranslatedKey } from '../../../shared/domain/services/get-translated-text.js';
import { Mission } from '../../domain/models/Mission.js';
import { MissionNotFoundError } from '../../domain/school-errors.js';
import { missionDatasource } from '../datasources/learning-content/mission-datasource.js';

const { FRENCH_FRANCE } = LOCALE;

function _toDomain(data, locale) {
  const translatedName = getTranslatedKey(data.name_i18n, locale);
  const translatedLearningObjectives = getTranslatedKey(data.learningObjectives_i18n, locale);
  const translatedValidatedObjectives = getTranslatedKey(data.validatedObjectives_i18n, locale);
  return new Mission({
    id: data.id,
    name: translatedName,
    competenceId: data.competenceId,
    thematicId: data.thematicId,
    learningObjectives: translatedLearningObjectives,
    validatedObjectives: translatedValidatedObjectives,
    status: data.status,
  });
}

async function get(id, locale = { locale: FRENCH_FRANCE }) {
  try {
    // Les missions sont stockées en tant que thématiques dans PixEditor :)
    const missionData = await missionDatasource.get(id);
    return _toDomain(missionData, locale);
  } catch (error) {
    throw new MissionNotFoundError(id);
  }
}

async function findAllMissions(locale = { locale: FRENCH_FRANCE }) {
  const missionDataList = await missionDatasource.list();
  return missionDataList.map((missionData) => _toDomain(missionData, locale));
}

export { findAllMissions, get };
