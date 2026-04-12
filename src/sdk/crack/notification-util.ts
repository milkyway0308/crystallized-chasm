import { FutureResult, Result, success } from "../../utils/flow-handler";
import { CrackNetworkApi } from "./network-util";
import { CrackNotification } from "./types/types-notification";

export type NotificationExportOption = {
  /** 최대로 가져올 알림 개수. -1로 입력시, 모든 메시지를 가져옵니다. */
  max?: number;
  /** 각 요청마다 대기할 간격입니다. 이 옵션이 없는 경우, 크랙의 API 서버에서 레이트리밋을 반환할 가능성이 존재합니다. */
  delay?: number;
  /** 각 요청마다 가져올 최대 페이지입니다. 특별한 상황이 아닌 경우, 기본 값 사용을 권장합니다. 20개를 초과할 경우, 크랙 API가 작동하지 않을 수 있습니다. */
  itemPerPage?: number;
};

export type NotificationExportBulkOption = {
  /** 최대로 가져올 알림 개수. -1로 입력시, 모든 메시지를 가져옵니다. */
  max?: number;
  /** 각 요청마다 대기할 간격입니다. 이 옵션이 없는 경우, 크랙의 API 서버에서 레이트리밋을 반환할 가능성이 존재합니다. */
  delay?: number;
  /** 어느 순서로 메시지를 가져올지의 여부입니다. true일 경우, 시간 흐름대로 반환합니다(오래된 메시지 -> 최신 메시지). false일 경우, 역순으로 반환합니다(최신 메시지 -> 오래된 메시지). */
  naturalOrder?: boolean;
  /** Fast-Fail을 허용할지의 여부입니다. true일 경우, 한번이라도 실패한다면 이전 요청값을 버리고 마지막 오류를 반환합니다. false일 경우, 이전 요청값을 보내고 오류 데이터를 버립니다. */
  allowFastFail?: boolean;
};

/**
 * 현재 계정의 알림을 받아옵니다.
 * **알람은 기본값일 경우 최신부터 오래된 순서로 반환됩니다.**
 * @generator
 * @yields 추출된 알림
 * @returns 생성된 제너레이터
 */
async function* iterator({ max = -1, delay = 20, itemPerPage = 20 }: NotificationExportOption = {}): AsyncGenerator<Result<CrackNotification>, void, void> {
  let amount = 0;
  let cursor = undefined;
  while (max === -1 || amount < max) {
    const baseUrl = `https://crack-api.wrtn.ai/crack-api/alarm`;
    const nextUrl: string = cursor ? `${baseUrl}?limit=${itemPerPage}&cursor=${cursor}` : `${baseUrl}?limit=${itemPerPage}`;
    const result = await CrackNetworkApi.authFetch("GET", nextUrl);
    if (!result.ok) {
      yield result;
      break;
    }
    for (let message of result.value.messages) {
      if ((message.content?.length ?? 0) === 0) continue;
      yield success(CrackNotification.of(message));
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

async function current(options?: NotificationExportOption & { allowFastFail: true }): FutureResult<CrackNotification[]>;
async function current(options: NotificationExportOption & { allowFastFail: false }): Promise<CrackNotification[]>;
async function current(options?: NotificationExportOption): FutureResult<CrackNotification[]>;

/**
 * 알람 목록을 추출합니다.
 * @returns 채팅 로그 목록 혹은 오류
 */
async function current(options: NotificationExportBulkOption = {}): Promise<CrackNotification[] | Result<CrackNotification[], Error>> {
  const { max = -1, delay = 20, naturalOrder = true, allowFastFail = true } = options;
  const logs: CrackNotification[] = [];
  for await (let log of iterator({
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

export const CrackNotificationApi = {
  iterator,
  current,
} as const;
