import { FutureResult, Result, success } from "../../utils/flow-handler";
import { CrackNetworkApi } from "./network-util";
import { CrackLongTermMemory } from "./types/types-long-term-memory";

export type SummaryExportOption = {
  /** 최대로 가져올 요약 메시지 개수. -1로 입력시, 모든 메시지를 가져옵니다. */
  max?: number;
  /** 각 요청마다 대기할 간격입니다. 이 옵션이 없는 경우, 크랙의 API 서버에서 레이트리밋을 반환할 가능성이 존재합니다. */
  delay?: number;
  /** 각 요청마다 가져올 최대 페이지입니다. 특별한 상황이 아닌 경우, 기본 값 사용을 권장합니다. 20개를 초과할 경우, 크랙 API가 작동하지 않을 수 있습니다. */
  itemPerPage?: number;
};

export type SummaryExportBulkOption = {
  /** 최대로 가져올 요약 메시지 개수. -1로 입력시, 모든 메시지를 가져옵니다. */
  max?: number;
  /** 각 요청마다 대기할 간격입니다. 이 옵션이 없는 경우, 크랙의 API 서버에서 레이트리밋을 반환할 가능성이 존재합니다. */
  delay?: number;
  /** 어느 순서로 메시지를 가져올지의 여부입니다. true일 경우, 시간 흐름대로 반환합니다(오래된 메시지 -> 최신 메시지). false일 경우, 역순으로 반환합니다(최신 메시지 -> 오래된 메시지). */
  naturalOrder?: boolean;
  /** Fast-Fail을 허용할지의 여부입니다. true일 경우, 한번이라도 실패한다면 이전 요청값을 버리고 마지막 오류를 반환합니다. false일 경우, 이전 요청값을 보내고 오류 데이터를 버립니다. */
  allowFastFail?: boolean;
};

/**
 * 장기 기억을 추출합니다.
 * **이 펑션은 항상 최신 메시지부터 오래된 메시지까지 역순으로 반환합니다.**
 * @generator
 * @param sessionId 장기 기억을 가져올 채팅방 ID입니다.
 * @yields {CrackLongTermMemory} 추출된 장기 기억
 * @returns 생성된 제너레이터
 */
async function* iterateLongTerm(sessionId: string, { max = -1, delay = 20, itemPerPage = 20 }: SummaryExportOption = {}): AsyncGenerator<Result<CrackLongTermMemory>, void, void> {
  let amount = 0;
  let cursor = undefined;
  while (max === -1 || amount < max) {
    const baseUrl = `https://crack-api.wrtn.ai/crack-gen/v3/chats/${sessionId}/summaries?type=longTerm&orderBy=newest&filter=all`;
    const nextUrl: string = cursor ? `${baseUrl}&limit=${itemPerPage}&cursor=${cursor}` : `${baseUrl}&limit=${itemPerPage}`;
    const result = await CrackNetworkApi.authFetch("GET", nextUrl);
    if (!result.ok) {
      yield result;
      break;
    }
    for (let message of result.value.data.summaries) {
      yield success(CrackLongTermMemory.from(message));
      if (max !== -1 && ++amount >= max) {
        break;
      }
    }
    if (result.value.nextCursor) {
      cursor = result.value.nextCursor;
    } else {
      break;
    }
    delay > 0 && (await new Promise((resolve) => setTimeout(resolve, delay)));
  }
}

async function extractLongTerm(sessionId: string, options?: SummaryExportBulkOption & { allowFastFail: true }): FutureResult<CrackLongTermMemory[]>;
async function extractLongTerm(sessionId: string, options: SummaryExportBulkOption & { allowFastFail: false }): Promise<CrackLongTermMemory[]>;
async function extractLongTerm(sessionId: string, options?: SummaryExportBulkOption): FutureResult<CrackLongTermMemory[]>;
/**
 * 장기 기억을 추출합니다.
 * @param sessionId 장기 기억을 가져올 채팅방 ID입니다.
 * @returns 장기 기억 목록 혹은 오류
 */
async function extractLongTerm(sessionId: string, options: SummaryExportBulkOption = {}): Promise<CrackLongTermMemory[] | Result<CrackLongTermMemory[], Error>> {
  const { max = -1, delay = 20, naturalOrder = true, allowFastFail = true } = options;
  const logs: CrackLongTermMemory[] = [];
  for await (let log of iterateLongTerm(sessionId, {
    max: max,
    delay: delay,
  })) {
    if (!log.ok) {
      if (allowFastFail) return log;
      break;
    }
    logs.push(log.value);
  }
  if (naturalOrder) {
    logs.reverse();
  }
  return allowFastFail ? success(logs) : logs;
}

async function createLongTerm(sessionId: string, title: string, summary: string): FutureResult<CrackLongTermMemory> {
  const result = await CrackNetworkApi.authFetch("POST", `https://crack-api.wrtn.ai/crack-gen/v3/chats/${sessionId}/summaries`, {
    summary: summary,
    title: title,
    type: "longTerm",
  });
  if (!result.ok) {
    return result;
  }
  return success(CrackLongTermMemory.from(result.value.data));
}

async function deleteLongTerm(sessionId: string, longTerm: string | CrackLongTermMemory): FutureResult<boolean> {
  const result = await CrackNetworkApi.authFetch("DELETE", `https://crack-api.wrtn.ai/crack-gen/v3/chats/${sessionId}/summaries/${typeof longTerm === "string" ? longTerm : longTerm.id}`);
  if (!result.ok) {
    return result;
  }
  return success(result.value.success);
}

export const CrackSummaryApi = {
  iterateLongTerm,
  extractLongTerm,
  createLongTerm,
  deleteLongTerm,
} as const;
