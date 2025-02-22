import * as answersRoutes from './application/answers/index.js';
import * as autonomousCoursesRoutes from './application/autonomous-courses/index.js';
import * as badgeCriteriaRoutes from './application/badge-criteria/index.js';
import * as badgesRoutes from './application/badges/index.js';
import * as competenceEvaluationsRoutes from './application/competence-evaluations/index.js';
import * as feedbacksRoutes from './application/feedbacks/index.js';
import * as progressionsRoutes from './application/progressions/index.js';
import * as scorecardsRoutes from './application/scorecards/index.js';
import * as smartRandomSimulatorRoutes from './application/smart-random-simulator/index.js';
import * as stageCollectionRoutes from './application/stage-collections/index.js';
import * as stagesRoutes from './application/stages/index.js';
import * as usersRoutes from './application/users/index.js';

const evaluationRoutes = [
  answersRoutes,
  autonomousCoursesRoutes,
  badgeCriteriaRoutes,
  badgesRoutes,
  competenceEvaluationsRoutes,
  stageCollectionRoutes,
  feedbacksRoutes,
  progressionsRoutes,
  scorecardsRoutes,
  smartRandomSimulatorRoutes,
  stagesRoutes,
  usersRoutes,
];

export { evaluationRoutes };
