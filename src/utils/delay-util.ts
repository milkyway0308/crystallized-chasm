import { AsyncRunnable, Nullable, Runnable, Undeclarable } from "./generic-types";

/**
 * BackOff 클래스용 예외입니다.
 * 이 예외는 스택트레이스를 발생시키지 않으며, 다음 주기로 실행을 넘깁니다.
 */
export class BackoffFriendlyError extends Error {
  constructor() {
    super();
  }
}
export class Debouncer {
  private lastTaskId: Nullable<ReturnType<typeof setTimeout>> = null;
  constructor(private readonly runner: Runnable) {}

  runDebouncer(delay: number) {
    if (this.lastTaskId) clearTimeout(this.lastTaskId);
    this.lastTaskId = setTimeout(this.runner, delay);
  }
}

export class BackOff {
  private currentDelay: number;
  private lastTaskId: Nullable<ReturnType<typeof setTimeout>> = null;
  private started = false;

  constructor(
    private readonly minDelay: number,
    private readonly maxDelay: number,
    private readonly task: AsyncRunnable | Runnable,
  ) {
    this.currentDelay = minDelay;
  }

  start() {
    if (this.started) return;
    this.started = true;
    this.schedule();
  }

  stop() {
    this.started = false;
    if (this.lastTaskId) {
      clearTimeout(this.lastTaskId);
    }
  }

  private async schedule() {
    if (!this.started) return;
    try {
      await this.task();
      this.currentDelay = this.minDelay;
    } catch (err) {
      this.currentDelay = Math.min(this.maxDelay, this.currentDelay * 2);
      if (!(err instanceof BackoffFriendlyError)) {
        console.error(err);
      }
    } finally {
      if (this.started) {
        this.lastTaskId = setTimeout(() => this.schedule(), this.currentDelay);
      }
    }
  }
}

function debouncer(runnable: Runnable): Debouncer {
  return new Debouncer(runnable);
}

function backoff(minDelay: number, maxDelay: number, task: AsyncRunnable | Runnable): BackOff {
  return new BackOff(minDelay, maxDelay, task);
}
export const DelayUtil = {
  debouncer,
  backoff,
} as const;
