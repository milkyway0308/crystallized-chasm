import { Nullable, Runnable } from "./generic-types";

export class Debouncer {
  private lastTaskId: Nullable<ReturnType<typeof setTimeout>> = null;
  constructor(private readonly runner: Runnable) {}

  runDebouncer(delay: number) {
    if (this.lastTaskId) clearTimeout(this.lastTaskId);
    this.lastTaskId = setTimeout(this.runner, delay);

  }
}
