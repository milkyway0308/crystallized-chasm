import { Nullable } from "./generic-types";

export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export type FutureResult<T> = Promise<Result<T>>;

export function success<T>(data: T): Result<T> {
  return { ok: true, value: data };
}

export function fail<T, E>(error: E): Result<T, E> {
  return { ok: false, error: error };
}

export function unwrap<T, E>(result: Result<T, E>): T {
  if (!result.ok) {
    throw result.error;
  }
  return result.value;
}

export function deconstruct<T, E>(result: Result<T, E>): T | E {
  if (!result.ok) {
    throw result.error;
  }
  return result.value;
}

export function toFlow<T>(t: Nullable<T>): Result<T, Error> {
  if (t === null) return { ok: false, error: new Error("Value is null") };
  return { ok: true, value: t };
}

export function handleFlow<T = void>(task: () => T): Result<T> {
  try {
    return success(task());
  } catch (err) {
    return fail(err instanceof Error ? err : new Error("Unknown error occured", { cause: err }));
  }
}

export async function asyncHandleFlow<T = void>(task: () => Promise<T>): Promise<Result<T>> {
  try {
    return success(await task());
  } catch (err) {
    return fail(err instanceof Error ? err : new Error("Unknown error occured", { cause: err }));
  }
}

export function handleResult<T>(task: () => Result<T>): Result<T> {
  try {
    return task();
  } catch (err) {
    return fail(
      new Error(`Unexpected error occured: ${err instanceof Error ? err.message : JSON.stringify(err)}`, {
        cause: err,
      }),
    );
  }
}

export async function asyncHandleResult<T>(task: () => Promise<Result<T>>): Promise<Result<T>> {
  try {
    return await task();
  } catch (err) {
    return fail(
      new Error(`Unexpected error occured: ${err instanceof Error ? err.message : JSON.stringify(err)}`, {
        cause: err,
      }),
    );
  }
}
