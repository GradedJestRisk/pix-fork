import { JobController, JobGroup } from '../../../shared/application/jobs/job-controller.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { temporaryStorage } from '../../../shared/infrastructure/temporary-storage/index.js';
import { AnswerJob } from '../../domain/models/AnwserJob.js';
import { usecases } from '../../domain/usecases/index.js';

const profileRewardTemporaryStorage = temporaryStorage.withPrefix('profile-rewards:');

export class AnswerJobController extends JobController {
  #profileRewardTemporaryStorage;

  constructor({ dependencies = { profileRewardTemporaryStorage } } = {}) {
    super(AnswerJob.name, { jobGroup: JobGroup.FAST });
    this.#profileRewardTemporaryStorage = dependencies.profileRewardTemporaryStorage;
  }

  async handle({ data }) {
    const { userId } = data;
    DomainTransaction.execute(async () => {
      await usecases.rewardUser({ userId });

      await this.#profileRewardTemporaryStorage.decrement(userId);
    });
  }
}
