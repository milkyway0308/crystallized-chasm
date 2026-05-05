import { Undeclarable } from "./generic-types";

export class MissingComponentError extends Error {
  constructor(message: string) {
    super(message);
  }

  static ensureString(step: string, component: string, json: any): string;
  static ensureString(step: string, component: string, json: any, checkUndefined: true): string;
  static ensureString(step: string, component: string, json: any, checkUndefined: false): Undeclarable<string>;
  static ensureString(step: string, component: string, json: any, checkUndefined: boolean = true): Undeclarable<string> {
    if (checkUndefined && json[component] === undefined) {
      throw new MissingComponentError(`데이터를 분해하는 중 오류가 발생하였습니다 : 진행 절차 ${step}, 문제 발생 요소 ${component} (존재하지 않음)`);
    }
    if (json[component] !== undefined && typeof json[component] !== "string") {
      throw new MissingComponentError(`데이터를 분해하는 중 오류가 발생하였습니다 : 진행 절차 ${step}, 문제 발생 요소 ${component} (타입 불일치 / 원본 ${typeof json[component]}, 필요 string)`);
    }
    return json[component];
  }

  static ensureBool(step: string, component: string, json: any): boolean;
  static ensureBool(step: string, component: string, json: any, checkUndefined: true): boolean;
  static ensureBool(step: string, component: string, json: any, checkUndefined: false): Undeclarable<boolean>;
  static ensureBool(step: string, component: string, json: any, checkUndefined: boolean = true): Undeclarable<boolean> {
    if (checkUndefined && json[component] === undefined) {
      throw new MissingComponentError(`데이터를 분해하는 중 오류가 발생하였습니다 : 진행 절차 ${step}, 문제 발생 요소 ${component} (존재하지 않음)`);
    }
    if (json[component] !== undefined && typeof json[component] !== "boolean") {
      throw new MissingComponentError(`데이터를 분해하는 중 오류가 발생하였습니다 : 진행 절차 ${step}, 문제 발생 요소 ${component} (타입 불일치 / 원본 ${typeof json[component]}, 필요 boolean)`);
    }
    return json[component];
  }

  static ensureNumber(step: string, component: string, json: any): number;
  static ensureNumber(step: string, component: string, json: any, checkUndefined: true): number;
  static ensureNumber(step: string, component: string, json: any, checkUndefined: false): Undeclarable<number>;
  static ensureNumber(step: string, component: string, json: any, checkUndefined: boolean = true): Undeclarable<number> {
    if (checkUndefined && json[component] === undefined) {
      throw new MissingComponentError(`데이터를 분해하는 중 오류가 발생하였습니다 : 진행 절차 ${step}, 문제 발생 요소 ${component} (존재하지 않음)`);
    }
    if (typeof json[component] !== "number") {
      throw new MissingComponentError(`데이터를 분해하는 중 오류가 발생하였습니다 : 진행 절차 ${step}, 문제 발생 요소 ${component} (타입 불일치 / 원본 ${typeof json[component]}, 필요 number)`);
    }
    return json[component];
  }

  static ensureArray<Content>(step: string, component: string, json: any): Content[];
  static ensureArray<Content>(step: string, component: string, json: any, checkUndefined: true): Content[];
  static ensureArray<Content>(step: string, component: string, json: any, checkUndefined: false): Undeclarable<Content[]>;

  static ensureArray<T>(step: string, component: string, json: any, checkUndefined: boolean = true): T[] {
    if (checkUndefined && json[component] === undefined) {
      throw new MissingComponentError(`데이터를 분해하는 중 오류가 발생하였습니다 : 진행 절차 ${step}, 문제 발생 요소 ${component} (존재하지 않음)`);
    }
    if (json[component] !== undefined && !Array.isArray(json[component])) {
      throw new MissingComponentError(`데이터를 분해하는 중 오류가 발생하였습니다 : 진행 절차 ${step}, 문제 발생 요소 ${component} (타입 불일치 / 원본 ${typeof json[component]}, 필요 array)`);
    }
    return json[component];
  }
}
