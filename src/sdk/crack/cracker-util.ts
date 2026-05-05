import { FutureResult, success, unwrap } from "../../utils/flow-handler";
import { Nullable } from "../../utils/generic-types";
import { CrackNetworkApi } from "./network-util";
import { CrackerModel } from "./types/types-cracker.ts";


/**
 * 크랙 서버에서 현재 접속한 계정의 크래커 개수를 받아와 반환합니다.
 * @returns 크래커 개수 혹은 오류
 */
async function current(): FutureResult<number> {
  const origin = await CrackNetworkApi.authFetch<{ data?: { quantity?: number } }>("GET", "https://crack-api.wrtn.ai/crack-cash/crackers");
  if (!origin.ok) {
    return origin;
  }
  const result = unwrap(origin);
  return success(result.data?.quantity ?? 0);
}

/**
 * 크랙 서버에 등록된 크래커 모델 목록을 반환합니다.
 * @returns 모델 목록 혹은 오류
 */
async function crackerModelList(): FutureResult<CrackerModel[]> {
  const origin = await CrackNetworkApi.authFetch("GET", "https://crack-api.wrtn.ai/crack-gen/v3/chat-models");
  if (!origin.ok) {
    return origin;
  }
  const rawModels: any[] = origin.value?.models ?? [];
  return success(rawModels.map((model) => new CrackerModel(model._id, model.name, model.crackerQuantity, model.serviceType)));
}

/**
 * 크랙 서버에 등록된 크래커 모델 목록을 이름 기반 맵으로 반환합니다.
 * @returns 매핑된 모델 맵 혹은 오류
 */
async function crackerModelMap(): FutureResult<Map<string, CrackerModel>> {
  const array = await crackerModelList();
  if (!array.ok) return array;
  return success(new Map(array.value.map((model) => [model.name, model])));
}

/**
 * 지정한 크래커 모델의 정보를 가져옵니다.
 * @param name 크래커 모델 이름
 * @returns 크래커 모델 정보 혹은 오류
 */
async function crackerModel(name: string): FutureResult<Nullable<CrackerModel>> {
  const result = await crackerModelMap();
  if (!result.ok) return result;
  return success(result.value.get(name) ?? null);
}

export const CrackCrackerApi = {
  current,
  crackerModelList,
  crackerModelMap,
  crackerModel,
} as const;
