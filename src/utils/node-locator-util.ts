import { Nullable, Undeclarable } from "./generic-types";

function by<T extends Element = HTMLElement>(origin: Undeclarable<Element>, selector: string): Nullable<T> {
  return origin ? origin.querySelector<T>(selector) : null;
}

function byAll<T extends Element = HTMLElement>(origin: Undeclarable<Element>, selector: string): T[] {
  return origin ? Array.from(origin.querySelectorAll<T>(selector)) : [];
}

function get<T extends Element = HTMLElement>(selector: string): Nullable<T> {
  return document.querySelector<T>(selector);
}

function getAll<T extends Element = HTMLElement>(selector: string): T[] {
  return Array.from(document.querySelectorAll<T>(selector));
}

function on<T extends Element, R = void>(selector: string, requireExists: true, runner: (element: T) => R): Nullable<R>;
function on<T extends Element, R = void>(selector: string, requireExists: false, runner: (element: Nullable<T>) => R): R;
function on<T extends Element, R = void>(selector: string, requireExists: boolean, runner: (element: any) => R): any {
  const element = get<T>(selector);
  if (requireExists) {
    return element ? runner(element) : null;
  }
  return runner(element);
}

function onAll<T extends Element, R = void>(selector: string, requireNonEmpty: true, runner: (elements: T[]) => R): Nullable<R>;
function onAll<T extends Element, R = void>(selector: string, requireNonEmpty: false, runner: (elements: T[]) => R): R;
function onAll<T extends Element, R = void>(selector: string, requireNonEmpty: boolean, runner: (elements: T[]) => R): any {
  const elements = getAll<T>(selector);
  if (requireNonEmpty) {
    return elements.length > 0 ? runner(elements) : null;
  }
  return runner(elements);
}

export const NodeLocator = {
  get,
  getAll,
  on,
  onAll,
  by,
  byAll,
} as const;
