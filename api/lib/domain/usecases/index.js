const updateCertification = require('./update-certification');
const getCorrectionForAnswerWhenAssessmentEnded = require('./get-correction-for-answer-when-assessment-ended');
const getNextChallengeForPreview = require('./get-next-challenge-for-preview');
const getNextChallengeForCertification = require('./get-next-challenge-for-certification');
const getNextChallengeForDemo = require('./get-next-challenge-for-demo');
const getNextChallengeForPlacement = require('./get-next-challenge-for-placement');
const getNextChallengeForSmartPlacement = require('./get-next-challenge-for-smart-placement');
const findCompletedUserCertifications = require('./find-completed-user-certifications');
const createUser = require('./create-user');

module.exports = {
  updateCertification,
  findCompletedUserCertifications,
  getCorrectionForAnswerWhenAssessmentEnded,
  getNextChallengeForPreview,
  getNextChallengeForCertification,
  getNextChallengeForDemo,
  getNextChallengeForPlacement,
  getNextChallengeForSmartPlacement,
  createUser
};
