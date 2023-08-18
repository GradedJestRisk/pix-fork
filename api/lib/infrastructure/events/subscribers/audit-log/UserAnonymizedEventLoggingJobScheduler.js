import { UserAnonymized } from '../../../../domain/events/UserAnonymized.js';

export class UserAnonymizedEventLoggingJobScheduler {
  constructor({ userAnonymizedEventLoggingJob }) {
    this.userAnonymizedEventLoggingJob = userAnonymizedEventLoggingJob;
  }

  static event = UserAnonymized;

  get name() {
    return this.constructor.name;
  }

  async handle(event) {
    await this.userAnonymizedEventLoggingJob.schedule(event);
  }
}
