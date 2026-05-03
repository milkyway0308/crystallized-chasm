import { fail, Result, success } from "../../../utils/flow-handler";
import { BiConsumer, Processor } from "../../../utils/generic-types";

export type ReactFormerOptionalParameter = {
  shouldDirty: boolean;
};
export type ReactFormer = {
  getValues: Processor<string, any>;
  setValue: (key: string, value: any, parameter?: ReactFormerOptionalParameter) => void;
};

function extractReactFormer(targetComponent: Element): Result<ReactFormer> {
  if (!targetComponent) return fail(new Error("대상 업로드 컴포넌트를 찾을 수 없습니다."));
  const fiberKey = Object.keys(targetComponent).find((k) => k.startsWith("__reactFiber$"));
  if (!fiberKey) return fail(new Error("리액트 데이터 추출에 실패하였습니다."));
  let fiber = (targetComponent as any)[fiberKey];
  let formMethods = undefined;

  while (fiber && !formMethods) {
    if (fiber.dependencies && fiber.dependencies.firstContext) {
      let ctx = fiber.dependencies.firstContext;
      while (ctx) {
        if (ctx.memoizedValue && ctx.memoizedValue.setValue && ctx.memoizedValue.getValues) {
          formMethods = ctx.memoizedValue;
          break;
        }
        ctx = ctx.next;
      }
    }
    if (!formMethods && fiber.memoizedState) {
      let hook = fiber.memoizedState;
      while (hook) {
        if (hook.memoizedState && hook.memoizedState.setValue && hook.memoizedState.getValues) {
          formMethods = hook.memoizedState;
          break;
        }
        hook = hook.next;
      }
    }
    fiber = fiber.return;
  }

  if (!formMethods) {
    return fail(new Error("컴포넌트에서 리액트 데이터 추출에 실패하였습니다."));
  }
  return success(formMethods as ReactFormer);
}

export const CrackReactUtil = { extractReactFormer } as const;
