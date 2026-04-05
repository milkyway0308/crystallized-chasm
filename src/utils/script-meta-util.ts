import { AllowedType, BABECHAT_URL_WILDCARDS, CRACK_URL_WILDCARD, DEFAULT_USERSCRIPT_NAMESPACE, PlatformType, SCRIPT_DOWNLOAD_URL, SCRIPT_UPDATE_URL, ScriptMeta } from "../constants/script-constants";

export class ScriptMetaUtil {
  private static readonly constructors: {
    [K in PlatformType]: () => ScriptMeta[K];
  } = {
    crack: () => {
      return {
        downloadUrl: SCRIPT_DOWNLOAD_URL,
        updateUrl: SCRIPT_UPDATE_URL,
        platformSuffix: "/crack",
        match: [CRACK_URL_WILDCARD],
        namespace: DEFAULT_USERSCRIPT_NAMESPACE,
        matchRule: CRACK_URL_WILDCARD,
      } satisfies ScriptMeta["crack"];
    },
    babechat: () => {
      return {
        downloadUrl: SCRIPT_DOWNLOAD_URL,
        updateUrl: SCRIPT_UPDATE_URL,
        platformSuffix: "/babechat",
        match: [...BABECHAT_URL_WILDCARDS],
        namespace: DEFAULT_USERSCRIPT_NAMESPACE,
        matchRule: BABECHAT_URL_WILDCARDS[0],
      } satisfies ScriptMeta["babechat"];
    },
  };
  static construct<K extends PlatformType>(type: K, fileName: string, matchSuffix: AllowedType<K>[] | undefined, editor: (meta: ScriptMeta[K]) => void): ScriptMeta[K] {
    const constructed = this.constructors[type]();
    if (matchSuffix) {
      constructed.match = matchSuffix as any;
    }
    constructed.downloadURL = constructed.updateURL = `${SCRIPT_DOWNLOAD_URL}${constructed.platformSuffix}/${fileName}`;
    editor(constructed);
    return constructed;
  }
}
