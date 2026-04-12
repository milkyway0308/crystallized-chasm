export class ValueObserver<T> {
  constructor(
    private value: T,
    private runner: (value: T) => void,
  ) {}

  observe(value: T) {
    if (this.value != value) {
      this.runner((this.value = value));
    }
  }
}
