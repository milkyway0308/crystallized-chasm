import { fail, FutureResult, success } from "../../utils/flow-handler";
import { CrackNetworkApi } from "./network-util";
import { ReadonlyDetailedStoryInfo, WritableStoryInfo } from "./types/types-story";
async function getDetail(id: string): FutureResult<any>;
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

async function edit(id: string, data: WritableStoryInfo): FutureResult<boolean> {
  const fetched = await CrackNetworkApi.authFetch("PATCH", `https://crack-api.wrtn.ai/crack-api/stories/${id}/v2`, data.stringify());
  if (!fetched.ok) return fetched;
  return success(true);
}

export const CrackStoryApi = {
  getDetail,
  edit,
} as const;
