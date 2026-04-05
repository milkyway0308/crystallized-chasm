export function lazy<T extends object>(initializer: () => T): T {
  let instance: T | null = null;
  return new Proxy({} as T, {
    get(_target, prop) {
      if (instance === null) {
        instance = initializer();
      }

      const value = (instance as any)[prop];
      return typeof value === "function" ? value.bind(instance) : value;
    },
    set(_target, prop, value) {
      if (instance === null) {
        instance = initializer();
      }
      (instance as any)[prop] = value;
      return true;
    },
  });
}
