import { Nullable } from "./generic-types";

function getElement<T extends Element = HTMLElement>(selector: string): Nullable<T> {
  return document.querySelector<T>(selector);
}

function getElements<T extends Element = HTMLElement>(selector: string): T[] {
  return Array.from(document.querySelectorAll<T>(selector));
}

function onElement<T extends Element, R = void>(selector: string, requireExists: true, runner: (element: T) => R): Nullable<R>;
function onElement<T extends Element, R = void>(selector: string, requireExists: false, runner: (element: Nullable<T>) => R): R;
function onElement<T extends Element, R = void>(selector: string, requireExists: boolean, runner: (element: any) => R): any {
  const element = getElement<T>(selector);
  if (requireExists) {
    return element ? runner(element) : null;
  }
  return runner(element);
}

function onElements<T extends Element, R = void>(selector: string, requireNonEmpty: true, runner: (elements: T[]) => R): Nullable<R>;
function onElements<T extends Element, R = void>(selector: string, requireNonEmpty: false, runner: (elements: T[]) => R): R;
function onElements<T extends Element, R = void>(selector: string, requireNonEmpty: boolean, runner: (elements: T[]) => R): any {
  const elements = getElements<T>(selector);
  if (requireNonEmpty) {
    return elements.length > 0 ? runner(elements) : null;
  }
  return runner(elements);
}

export const NodeLocator = {
  getElement,
  getElements,
  onElement,
  onElements,
} as const;
