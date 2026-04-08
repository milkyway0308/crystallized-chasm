import { FutureResult, Result, success } from "../../utils/flow-handler";
import { CrackChattingLog } from "./types/types-chatting-log";
import { CrackNetworkApi } from "./network-util";
import { CrackChatSession } from "./types/types-session";
import { Nullable } from "../../utils/generic-types";

export type ChatExportOption = {
  /** 최대로 가져올 메시지 개수. -1로 입력시, 모든 메시지를 가져옵니다. */
  max?: number;
  /** 각 요청마다 대기할 간격입니다. 이 옵션이 없는 경우, 크랙의 API 서버에서 레이트리밋을 반환할 가능성이 존재합니다. */
  delay?: number;
  /** 각 요청마다 가져올 최대 페이지입니다. 특별한 상황이 아닌 경우, 기본 값 사용을 권장합니다. 20개를 초과할 경우, 크랙 API가 작동하지 않을 수 있습니다. */
  itemPerPage?: number;
};

export type ChatExportBulkOption = {
  /** 최대로 가져올 메시지 개수. -1로 입력시, 모든 메시지를 가져옵니다. */
  max?: number;
  /** 각 요청마다 대기할 간격입니다. 이 옵션이 없는 경우, 크랙의 API 서버에서 레이트리밋을 반환할 가능성이 존재합니다. */
  delay?: number;
  /** 어느 순서로 메시지를 가져올지의 여부입니다. true일 경우, 시간 흐름대로 반환합니다(오래된 메시지 -> 최신 메시지). false일 경우, 역순으로 반환합니다(최신 메시지 -> 오래된 메시지). */
  naturalOrder?: boolean;
  /** Fast-Fail을 허용할지의 여부입니다. true일 경우, 한번이라도 실패한다면 이전 요청값을 버리고 마지막 오류를 반환합니다. false일 경우, 이전 요청값을 보내고 오류 데이터를 버립니다. */
  allowFastFail?: boolean;
};

/**
 * 지정한 ID의 메시지 데이터를 가져옵니다.
 * @param chatId 채팅방 ID
 * @param messageId 메시지 ID
 */
async function getMessage(chatId: string, messageId: string): FutureResult<CrackChattingLog> {
  const result = await CrackNetworkApi.authFetch("GET", `https://crack-api.wrtn.ai/crack-gen/v3/chats/${chatId}/messages/${messageId}`);
  if (!result.ok) return result;
  return success(CrackChattingLog.of(result.value.data));
}

/**
 * 지정한 세션의 현재 데이터를 가져옵니다.
 * @param chatId 채팅방 ID
 * @returns 채팅 세션의 현재 시점 데이터 혹은 오류
 */
async function getSession(chatId: string): FutureResult<CrackChatSession> {
  const result = await CrackNetworkApi.authFetch("GET", `https://crack-api.wrtn.ai/crack-gen/v3/chats/${chatId}`);
  if (!result.ok) {
    return result;
  }
  return success(CrackChatSession.of(result.value.data));
}

/**
 * 채팅 로그를 추출합니다.
 * **이 펑션은 항상 최신 메시지부터 오래된 메시지까지 역순으로 반환합니다.**
 * @generator
 * @param chatId 채팅 로그를 가져올 채팅방 ID입니다.
 * @yields {CrackChattingLog} 추출된 채팅 로그
 * @returns 생성된 제너레이터
 */
async function* iterateLogs(chatId: string, { max = -1, delay = 20, itemPerPage = 20 }: ChatExportOption = {}): AsyncGenerator<Result<CrackChattingLog>, void, void> {
  let amount = 0;
  let cursor = undefined;
  while (max === -1 || amount < max) {
    const baseUrl = `https://contents-api.wrtn.ai/character-chat/v3/chats/${chatId}/messages`;
    const nextUrl: string = cursor ? `${baseUrl}?limit=${itemPerPage}&cursor=${cursor}` : `${baseUrl}?limit=${itemPerPage}`;
    const result = await CrackNetworkApi.authFetch("GET", nextUrl);
    if (!result.ok) {
      yield result;
      break;
    }
    for (let message of result.value.messages) {
      if ((message.content?.length ?? 0) === 0) continue;
      yield success(CrackChattingLog.of(message));
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

async function extractLogs(chatId: string, options?: ChatExportBulkOption & { allowFastFail: true }): FutureResult<CrackChattingLog[]>;
async function extractLogs(chatId: string, options: ChatExportBulkOption & { allowFastFail: false }): Promise<CrackChattingLog[]>;
async function extractLogs(chatId: string, options?: ChatExportBulkOption): FutureResult<CrackChattingLog[]>;
/**
 * 채팅 로그를 추출합니다.
 * @param chatId 채팅 로그를 가져올 채팅방 ID입니다.
 * @returns 채팅 로그 목록 혹은 오류
 */
async function extractLogs(chatId: string, options: ChatExportBulkOption = {}): Promise<CrackChattingLog[] | Result<CrackChattingLog[], Error>> {
  const { max = -1, delay = 20, naturalOrder = true, allowFastFail = true } = options;
  const logs: CrackChattingLog[] = [];
  for await (let log of iterateLogs(chatId, {
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

/**
 * 지정된 채팅의 마지막 메시지를 역할에 맞춰 찾아 가져옵니다.
 * @param chatId 세션 ID
 * @returns 마지막 메시지
 */
async function fetchLastMessage(chatId: string): FutureResult<Nullable<CrackChattingLog>> {
  const next = await iterateLogs(chatId, { max: 1 }).next();
  return next.value ? (next.value.ok ? success(next.value.value ?? null) : next.value) : success(null);
}
/**
 * 지정된 채팅의 마지막 메시지를 역할에 맞춰 찾아 가져옵니다.
 * @param chatId
 * @param requireRole
 * @returns 찾은 역할에 일치하는 메시지, 혹은 null
 */
async function findLastMessageId(chatId: string, requireRole: string = "assistant"): FutureResult<Nullable<CrackChattingLog>> {
  for await (let item of iterateLogs(chatId)) {
    if (!item.ok) return item;
    if (item.value.role === requireRole) {
      return success(item.value);
    }
  }
  return success(null);
}

async function findLastBotMessage(chatId: string): FutureResult<Nullable<CrackChattingLog>> {
  return findLastMessageId(chatId, "assistant");
}

async function findLastUserMessage(chatId: string): FutureResult<Nullable<CrackChattingLog>> {
  return findLastMessageId(chatId, "user");
}

export const CrackSessionFetcherApi = {
  getMessage,
  getSession,
  iterateLogs,
  extractLogs,
  fetchLastMessage,
  findLastMessageId,
  findLastBotMessage,
  findLastUserMessage
} as const;