import { fail, FutureResult, success } from "../../utils/flow-handler";
import { Nullable } from "../../utils/generic-types";
import { CrackNetworkApi } from "./network-util";
import { ReadonlyDetailedStoryInfo, WritableStoryInfo } from "./types/types-story";
async function getDetail(id: string): FutureResult<ReadonlyDetailedStoryInfo>;
async function getDetail(id: string, raw: true): FutureResult<any>;
async function getDetail(id: string, raw: false): FutureResult<ReadonlyDetailedStoryInfo>;
/**
 * 소유한 스토리의 상세 정보를 불러옵니다.
 * 권한이 없는 경우, 데이터를 가져올 수 없습니다.
 * @param id 작품 ID
 * @returns 작품 정보 혹은 오류
 */
async function getDetail(id: string, raw: boolean = false): FutureResult<ReadonlyDetailedStoryInfo | any> {
  const fetched = await CrackNetworkApi.authFetch("GET", `https://crack-api.wrtn.ai/crack-api/stories/me/${id}`);
  if (!fetched.ok) return fetched;
  try {
    if (raw) {
      return success(fetched.value.data);
    }
    return success(ReadonlyDetailedStoryInfo.from(fetched.value.data));
  } catch (err) {
    return fail(err as Error);
  }
}

/**
 * 새 스토리 작품에 사용할 수 있는 다음 ID를 크랙 서버에서 가져옵니다.
 * 이 ID는 {@link edit} 으로 수정되지 않는 한 계정에 반영되지 않습니다.
 * @returns 새 작품 ID
 */
async function pullNewId(): FutureResult<string> {
  const fetched = await CrackNetworkApi.authFetch("POST", "https://crack-api.wrtn.ai/crack-api/temp-stories");
  if (!fetched.ok) {
    return fetched;
  }
  return success(fetched.value.data);
}

/**
 * 스토리 작품의 데이터를 수정하여 덮어씌웁니다.
 * @param id 스토리 ID
 * @param data 작품 데이터
 * @returns 성공 여부
 */
async function edit(id: string, data: WritableStoryInfo, includeSetId: boolean): FutureResult<boolean> {
  const fetched = await CrackNetworkApi.authFetch("PATCH", `https://crack-api.wrtn.ai/crack-api/stories/${id}/v2`, data.stringify(includeSetId));
  if (!fetched.ok) return fetched;
  return success(true);
}

/**
 * 스토리 작품을 생성합니다. 존재하는 ID에 시도하는 경우, 오류가 발생할 수 있습니다.
 * @param id 스토리 ID
 * @param data 작품 데이터
 * @returns 성공 여부
 */
async function create(data: WritableStoryInfo, includeSetId: boolean, isAdult?: Nullable<boolean>): FutureResult<boolean> {
  const fetched = await CrackNetworkApi.authFetch("POST", `https://crack-api.wrtn.ai/crack-api/stories/v2`, data.stringify(includeSetId, null, isAdult));
  if (!fetched.ok) return fetched;
  return success(true);
}

export const CrackStoryApi = {
  getDetail,
  edit,
  create,
  pullNewId,
} as const;
