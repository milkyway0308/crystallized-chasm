import { Nullable } from "../../utils/generic-types";

/**
 * 현재 URL이 크랙 대시보드 URL인지 반환합니다.
 * @returns 대시보드 여부
 */
function isDashboardPath(): boolean {
  return "/" === location.pathname;
}

/**
 * 현재 URL이 스토리챗의 URL인지 반환합니다.
 * @returns 채팅 URL 일치 여부
 */
function isStoryPath(): boolean {
  // 2025-09-17 Path
  return (
    /\/stories\/[a-f0-9]+\/episodes\/[a-f0-9]+/.test(location.pathname) ||
    // Legacy Path
    /\/u\/[a-f0-9]+\/c\/[a-f0-9]+/.test(location.pathname)
  );
}

/**
 * 현재 URL이 캐릭터챗의 URL인지 반환합니다.
 * @returns 채팅 URL 일치 여부
 */
function isCharacterPath(): boolean {
  return /\/characters\/[a-f0-9]+\/chats\/[a-f0-9]+/.test(location.pathname);
}


/**
 * 현재 URL이 스토리챗 빌더의 URL인지 반환합니다.
 * @returns 채팅 URL 일치 여부
 */
function isStoryBuilderPath() {
  return /^\/builder\/story(\/.*)?$/.test(location.pathname);
}

/**
 * 현재 URL이 ARPG 채팅의 일부인지 반환합니다.
 * @returns 채팅 URL 일치 여부
 */
function isARPGPath(): boolean {
  return /\/arpg\/[a-f0-9]+\/[a-f0-9]+\/play/.test(location.pathname);
}

/**
 * 현재 URL이 ARPG 채팅 빌더의 일부인지 반환합니다.
 * @returns 채팅 URL 일치 여부
 */
function isARPGBuilderPath() : boolean {
  return /\/arpg\/[a-f0-9]+\/builder/.test(location.pathname);
}

/**
 * 현재 URL이 크랙 채팅 URL인지 반환합니다.
 * @returns 채팅 URL 일치 여부
 */
function isChattingPath(): boolean {
  return isStoryPath() || isCharacterPath();
}

/**
 * 현재 스토리 / 캐릭터 ID를 반환합니다.
 * @returns 현재 캐릭터 / 스토리 ID
 */
function character(): Nullable<string> {
  if (isChattingPath()) {
    const split = window.location.pathname.substring(1).split("/");
    const characterId = split[1];
    return characterId;
  }
  return null;
}

/**
 * 현재 채팅방 ID를 반환합니다.
 * @returns 현재 채팅방 ID
 */
function chatRoom(): Nullable<string> {
  if (isChattingPath()) {
    const split = window.location.pathname.substring(1).split("/");
    const chatRoomId = split[3];
    return chatRoomId;
  }
  return null;
}

export const CrackPathApi = {
  isStoryBuilderPath,
  isDashboardPath,
  isStoryPath,
  isCharacterPath,
  isChattingPath,
  isARPGPath,
  isARPGBuilderPath,
  character,
  chatRoom,
} as const;
