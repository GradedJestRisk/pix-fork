import { NotFoundError } from '../errors.js';
import { Activity } from '../models/Activity.js';
import { getNextActivityLevel } from '../services/algorithm-methods/pix1d.js';

export async function getNextChallengeForPix1d({
  assessmentId,
  assessmentRepository,
  activityAnswerRepository,
  challengeRepository,
  activityRepository,
}) {
  const { missionId } = await assessmentRepository.get(assessmentId);
  let currentActivity;
  let answers = [];
  try {
    currentActivity = await activityRepository.getLastActivity(assessmentId);
    answers = await activityAnswerRepository.findByActivity(currentActivity.id);
    if (_lastAnswerStatus(answers) === 'ok') {
      const challengeNumber = answers.length + 1;
      return await challengeRepository.getForPix1D({
        missionId,
        activityLevel: currentActivity.level,
        challengeNumber,
      });
    }
  } catch (error) {
    if (!(error instanceof NotFoundError)) {
      throw error;
    }
  }
  return _getNextActivityChallenge(
    currentActivity,
    assessmentRepository,
    assessmentId,
    activityRepository,
    challengeRepository,
    missionId,
    _lastAnswerStatus(answers)
  );
}

const _lastAnswerStatus = function (answers) {
  if (answers.length < 1) {
    return undefined;
  }
  const lastAnswerResult = answers[answers.length - 1].result;
  return lastAnswerResult.status;
};

async function _getNextActivityChallenge(
  currentActivity,
  assessmentRepository,
  assessmentId,
  activityRepository,
  challengeRepository,
  missionId,
  lastAnswerStatus
) {
  if (lastAnswerStatus) {
    await activityRepository.updateStatus({ activityId: currentActivity.id, status: status[lastAnswerStatus] });
  }
  const nextActivityLevel = getNextActivityLevel(await activityRepository.getAllByAssessmentId(assessmentId));
  if (nextActivityLevel !== undefined) {
    activityRepository.save(new Activity({ assessmentId, level: nextActivityLevel, status: Activity.status.STARTED }));
    return await challengeRepository.getForPix1D({
      missionId,
      activityLevel: nextActivityLevel,
      challengeNumber: 1,
    });
  }
  assessmentRepository.completeByAssessmentId(assessmentId);
}

const status = {
  aband: Activity.status.SKIPPED,
  ok: Activity.status.SUCCEEDED,
  ko: Activity.status.FAILED,
};
