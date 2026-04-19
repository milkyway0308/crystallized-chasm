import Dexie, { EntityTable } from "dexie";
import { readonlyLazy } from "../../utils/lazy-util";
import { LogUtil } from "../../utils/log-utils";
import { CrackSdk } from "../../sdk/crack-sdk";
import { configure } from "../../utils/flow-handler";
import { ScriptMetaUtil } from "../../utils/script-meta-util";
import { CRACK_VERSION_RULE } from "../../constants/script-constants";
import { BrowserInitUtil } from "../../utils/init-util";
import { BackoffFriendlyError, DelayUtil } from "../../utils/delay-util";
import { Nullable } from "../../utils/generic-types";
import { HttpError } from "../../sdk/crack/network-util";

export const scriptMeta = ScriptMetaUtil.construct("crack", "local-seismometer.user.js", undefined, (meta) => {
  meta.name = "Chasm Crystallized Local Sesimometer (캐즘 국소지진계)";
  meta.version = "CRCK-LSEM-v2.0.0" satisfies CRACK_VERSION_RULE;
  meta.author = "milkyway0308";
  meta.defaulticon = "요약 메모리가 변경될 때 마다 알림 전송. 이 기능은 결정화 캐즘 오리지널 패치입니다.";
});

const logger = readonlyLazy(() => new LogUtil("Chasm Crystallized Local Sesimometer", false));
let lastTokenUsed: Nullable<string> = null;

interface LocalSesimometerTable {
  roomId: string;
  summaryId: string;
}

const db = readonlyLazy(() =>
  configure(
    new Dexie("chasm-local-seismometer") as Dexie & {
      cache: EntityTable<LocalSesimometerTable, "roomId">;
    },
    (dexie) => {
      dexie.version(1).stores({
        cache: `roomId, summaryId`,
      });
    },
  ),
);

async function check() {
  const sessionId = CrackSdk.path().chatRoom();
  if (!sessionId || CrackSdk.cookie().getAuthToken() === lastTokenUsed) return;
  const fetched = await CrackSdk.summary().extractLongTerm(sessionId);
  if (!fetched.ok) {
    if (fetched.error instanceof HttpError && fetched.error.code === 401) {
      lastTokenUsed = CrackSdk.cookie().getAuthToken();
      logger.log("인증 토큰 만료로 인해 요청에 실패하여 다음 토큰 교체까지 요약 메모리 감시 태스크를 뒤로 미룹니다.");
      return;
    } else {
      logger.log("크랙 API에서 알 수 없는 오류가 발생하여 요약 메모리 감시 태스크를 뒤로 미룹니다.");
    }
    throw new BackoffFriendlyError();
  }
  if (fetched.value.length <= 0) {
    return;
  }
  const result = await db.cache.where("roomId").anyOf(sessionId).toArray();
  if (result.length > 0) {
    if (result[0].summaryId === fetched.value[0].id) {
      return;
    }
  }
  await db.cache.put({
    roomId: sessionId,
    summaryId: fetched.value[0].id,
  });
  CrackSdk.toastify().doToastifyAlert("요약 메모리의 변경이 감지되었어요.");
}

BrowserInitUtil.init(() => {
  DelayUtil.backoff(1500, 30_000, check).start();
});
