import { MonkeyUserScript } from "vite-plugin-monkey";

// URL CONSTANTS
export const DEFAULT_USERSCRIPT_NAMESPACE = "https://github.com/milkyway0308" as const;
export const SCRIPT_DOWNLOAD_URL = "https://github.com/milkyway0308/crystallized-chasm/dist" as const;
export const SCRIPT_UPDATE_URL = "https://github.com/milkyway0308/crystallized-chasm/dist" as const;

export type CRACK_URL_BASE = `https://crack.wrtn.ai/${string}`;
export const CRACK_URL_WILDCARD = "https://crack.wrtn.ai/*" as const satisfies CRACK_URL_BASE;

export type BABECHAT_URL_BASE = `https://babechat.ai/${string}` | `https://www.babechat.ai/${string}`;
export const BABECHAT_URL_WILDCARDS = ["https://babechat.ai/*", "https://www.babechat.ai/*"] as const satisfies readonly BABECHAT_URL_BASE[];


// VERSIONING CONSTANTS
export type VERSION_RULE = `v${number}.${number}.${number}`

export type BASIC_VERSION_RULE = `${string}-${string}-${VERSION_RULE}`
export type CRACK_VERSION_RULE = `CRCK-${string}-${VERSION_RULE}`;
export type BABECHAT_VERSION_RULE = `BABE-${string}-${VERSION_RULE}`;


// PLATFORM CONSTANTS
export const PATH_PLATFORM_CRACK = "/crack" as const;
export const PATH_PLATFORM_BABECHAT = "/babechat" as const;

export interface ScriptMeta {
  crack: MonkeyUserScript & {
    downloadUrl: typeof SCRIPT_DOWNLOAD_URL;
    updateUrl: typeof SCRIPT_UPDATE_URL;
    platformSuffix: typeof PATH_PLATFORM_CRACK;
    match: CRACK_URL_BASE[];
    namespace: typeof DEFAULT_USERSCRIPT_NAMESPACE;
    matchRule: CRACK_URL_BASE;
  };

  babechat: MonkeyUserScript & {
    downloadUrl: typeof SCRIPT_DOWNLOAD_URL;
    updateUrl: typeof SCRIPT_UPDATE_URL;
    platformSuffix: typeof PATH_PLATFORM_BABECHAT;
    match: BABECHAT_URL_BASE[];
    namespace: typeof DEFAULT_USERSCRIPT_NAMESPACE;
    matchRule: BABECHAT_URL_BASE;
  };
}

// KEYWORD TYPES
export type PlatformType = keyof ScriptMeta;

export type AllowedType<K extends PlatformType> = ScriptMeta[K]["matchRule"];
