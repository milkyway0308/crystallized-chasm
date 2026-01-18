// @ts-check
// crack-shared-core.js - 크랙 서드파티 스크립트용 공용 유틸리티 코어
// crack-shared-core은 TS의 문법 검사와 JSDoc을 통한 브라우저 스크립트 전용 크랙 유틸리티입니다.

// =====================================================
//                 Crack Shared Core
// =====================================================

// =====================================================
//                      데이터 클래스
// =====================================================
class Visibility {
  /** 크랙에서 사용되는 원본 이름 */
  originName;
  /**
   * @param {string} originName 원본 이름
   */
  constructor(originName) {
    this.originName = originName;
  }

  static PUBLIC = new Visibility("public");
  static PRIVATE = new Visibility("private");
  static LINK_ONLY = new Visibility("linkonly");

  /**
   *
   * @param {string} name
   */
  static of(name) {
    if (name.toLowerCase() === "private") {
      return this.PRIVATE;
    }
    if (name.toLowerCase() === "public") {
      return this.PUBLIC;
    }
    return this.LINK_ONLY;
  }
}

/**
 * 크래커 모델의 비용과 이름을 나타내는 클래스입니다.
 */
class CrackerModel {
  /** 모델 내부 ID */
  id;
  /** 표시 이름 */
  name;
  /** 1회당 소모 크래커 */
  quantity;
  /** 서비스 타입 */
  serviceType;
  /**
   * @param {string} id 모델 내부 ID
   * @param {string} name 표시 이름
   * @param {number} quantity 1회당 소모 크래커
   * @param {string} serviceType 서비스 타입
   */
  constructor(id, name, quantity, serviceType) {
    this.id = id;
    this.name = name;
    this.quantity = quantity;
    this.serviceType = serviceType;
  }
}

/**
 * 유저 정보를 나타내는 클래스입니다.
 */
class UserInfo {
  /** 표기 닉네임*/
  nickname;
  /** 뤼튼 ID */
  wrtnId;
  /** 크리에이터 여부 */
  isCertificated;
  /** 유저 프로필 ID */
  profileId;
  /**
   * @param {string} nickname 표기 닉네임
   * @param {string} wrtnId 뤼튼 ID
   * @param {string} isCertificated 크리에이터 여부
   * @param {string} profileId 유저 프로필 ID
   */
  constructor(nickname, wrtnId, isCertificated, profileId) {
    this.nickname = nickname;
    this.wrtnId = wrtnId;
    this.isCertificated = isCertificated;
    this.profileId = profileId;
  }
}

class ArticleDescription {
  /**
   *
   * @param {string} description 기본 작품 설명
   * @param {string} simple 한줄 소개
   * @param {string} detail 상세 소개
   */
  constructor(description, simple, detail) {
    this.description = description;
    this.simple = simple;
    this.detail = detail;
  }
}

/**
 * 작품 정보를 나타내는 클래스입니다.
 * 스토리와 캐릭터 상관 없이 해당 클래스로 표현합니다.
 */
class ArticleInfo {
  /**
   *
   * @param {string} id 작품 ID
   * @param {string} title 표시 제목
   * @param {string} crackerModel 권장 크래커 모델
   * @param {UserInfo} author 제작자
   * @param {ArticleDescription} description 작품 설명
   * @param {string[]} tags 작품 태그
   * @param {Visibility} visibility 공개 여부
   */
  constructor(id, title, crackerModel, author, description, tags, visibility) {
    this.id = id;
    this.title = title;
    this.crackerModel = crackerModel;
    this.author = author;
    this.description = description;
    this.tags = tags;
    this.visibility = visibility;
  }
}

// =====================================================
//                    로직 클래스
// =====================================================
/**
 * 크랙 테마 관련 유틸리티입니다.
 */
class _CrackTheme {
  isDarkTheme() {
    return document.body.getAttribute("data-theme") === "dark";
  }
  isLightTheme() {
    return !this.isDarkTheme();
  }
}
/**
 * 크랙 경로 관련 유틸리티입니다.
 */
class _CrackPath {
  /**
   * 현재 URL이 크랙 대시보드 URL인지 반환합니다.
   * @returns {boolean} 대시보드 여부
   */
  isDashboardPath() {
    return "/" === location.pathname;
  }

  /**
   * 현재 URL이 스토리챗의 URL인지 반환합니다.
   * @returns {boolean} 채팅 URL 일치 여부
   */
  isStoryPath() {
    // 2025-09-17 Path
    return (
      /\/stories\/[a-f0-9]+\/episodes\/[a-f0-9]+/.test(location.pathname) ||
      // Legacy Path
      /\/u\/[a-f0-9]+\/c\/[a-f0-9]+/.test(location.pathname)
    );
  }

  /**
   * 현재 URL이 캐릭터챗의 URL인지 반환합니다.
   * @returns {boolean} 채팅 URL 일치 여부
   */
  isCharacterPath() {
    return /\/characters\/[a-f0-9]+\/chats\/[a-f0-9]+/.test(location.pathname);
  }

  /**
   * 현재 URL이 크랙 채팅 URL인지 반환합니다.
   * @returns {boolean} 채팅 URL 일치 여부
   */
  isChattingPath() {
    return this.isStoryPath() || this.isCharacterPath();
  }

  /**
   * 현재 스토리 / 캐릭터 ID를 반환합니다.
   * @returns {string | undefined} 현재 캐릭터 / 스토리 ID
   */
  character() {
    if (this.isChattingPath()) {
      const split = window.location.pathname.substring(1).split("/");
      const characterId = split[1];
      return characterId;
    }
    return undefined;
  }

  /**
   * 현재 채팅방 ID를 반환합니다.
   * @returns {string | undefined} 현재 채팅방 ID
   */
  chatRoom() {
    if (this.isChattingPath()) {
      const split = window.location.pathname.substring(1).split("/");
      const characterId = split[1];
      const chatRoomId = split[3];
      return chatRoomId;
    }
    return undefined;
  }
}

/**
 * 크랙 쿠키 유틸리티 클래스입니다.
 */
class _CrackCookie {
  /**
   * 쿠키에서 대상 값을 가져와 반환합니다.
   * @param {string} key 쿠키 키
   * @returns {string | undefined} 쿠키 값 혹은 undefined
   */
  getCookie(key) {
    const e = document.cookie.match(
      new RegExp(
        `(?:^|; )${key.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1")}=([^;]*)`
      )
    );
    return e ? decodeURIComponent(e[1]) : undefined;
  }

  /**
   * 현재 페이지에 할당된 크랙 인증 토큰을 가져와 반환합니다.
   * 인증 토큰은 만료된 상태일 수 있습니다.
   * @returns {string} 인증 토큰
   */
  getAuthToken() {
    const token = this.getCookie("access_token");
    if (!token) {
      throw new Error("쿠키에 인증 토큰이 없습니다.");
    }
    return token;
  }
}

/**
 * 크랙 네트워크 통신용 클래스입니다.
 */
class _CrackNetwork {
  #cookie;
  /**
   * @param {_CrackCookie} cookie
   */
  constructor(cookie) {
    this.#cookie = cookie;
  }

  /**
   * 크랙의 토큰을 인증 수단으로 사용하여 요청을 보냅니다.
   * @param {string} method 요청 메서드
   * @param {string} url 요청 URL
   * @param {any | undefined} body 요청 바디 파라미터
   * @returns {Promise<any | Error>} 파싱된 값 혹은 오류
   */
  async authFetch(method, url, body = undefined) {
    try {
      const param = {
        method: method,
        headers: {
          Authorization: `Bearer ${this.#cookie.getAuthToken()}`,
          "Content-Type": "application/json",
        },
      };
      if (body) {
        // @ts-ignore
        param.body = JSON.stringify(body);
      }
      const result = await fetch(url, param);
      if (!result.ok)
        return new Error(
          `HTTP 요청 실패 (${result.status}) [${await result.json()}]`
        );
      return await result.json();
    } catch (t) {
      // @ts-ignore
      return new Error(`알 수 없는 오류 (${t.message ?? JSON.stringify(t)})`);
    }
  }
}

class _CrackAttend {
  #network;
  /**
   * @param {_CrackNetwork} network
   */
  constructor(network) {
    this.#network = network;
  }

  /**
   * 출석 가능 여부를 서버에서 받아와 반환합니다.
   * @returns {Promise<boolean|Error>} 출석 가능 여부, 혹은 오류
   */
  async isAttendable() {
    const webResult = await this.#network.authFetch(
      "GET",
      "https://crack-api.wrtn.ai/crack-cash/attendance"
    );
    if (webResult instanceof Error) return webResult;
    if (
      webResult.data &&
      webResult.data.attendanceStatus &&
      webResult.data.attendanceStatus === "NOT_ATTENDED"
    ) {
      return true;
    }
    return false;
  }

  /**
   * 출석을 API를 통해 진행합니다.
   * @returns {Promise<boolean>} 출석 성공 여부
   */
  async performAttend() {
    const result = await this.#network.authFetch(
      "POST",
      "https://crack-api.wrtn.ai/crack-cash/attendance"
    );
    if (result instanceof Error) {
      return false;
    }
    return true;
  }

  /**
   * 출석 가능한 시간인지 반환합니다.
   * 크랙은 6시부터 23시 59분까지 출석이 가능합니다.
   * @returns {boolean} 출석 가능 시간 여부
   */
  isAttendableTime() {
    const time = new Date().getHours();
    if (time < 6) return false;
    return true;
  }
}

class _CrackCracker {
  #network;
  /**
   * @param {_CrackNetwork} network
   */
  constructor(network) {
    this.#network = network;
  }

  /**
   * 크랙 서버에서 현재 접속한 계정의 크래커 개수를 받아와 반환합니다.
   * @returns {Promise<number | Error>} 크래커 개수 호은 오류
   */
  async current() {
    let result = await this.#network.authFetch(
      "GET",
      "https://crack-api.wrtn.ai/crack-cash/crackers"
    );
    if (result instanceof Error) {
      return result;
    }
    let json = await result.json();
    return json.data.quantity ?? 0;
  }

  /**
   * 크랙 서버에 등록된 크래커 모델 목록을 반환합니다.
   * @returns {Promise<CrackerModel[] | Error>} 모델 목록 혹은 오류
   */
  async listCrackerModels() {
    const result = await this.#network.authFetch(
      "GET",
      "https://crack-api.wrtn.ai/crack-gen/v3/chat-models"
    );
    if (result instanceof Error) {
      return result;
    }
    if (!result.data.models) {
      return [];
    }
    /** @type {CrackerModel[]} */
    const array = [];
    for (const model of result.data.models) {
      array.push(
        new CrackerModel(
          model._id,
          model.name,
          model.crackerQuantity,
          model.serviceType
        )
      );
    }
    return array;
  }

  /**
   * 크랙 서버에 등록된 크래커 모델 목록을 이름 기반 맵으로 반환합니다.
   * @returns {Promise<Map<string, CrackerModel> | Error>} 매핑된 모델 맵 혹은 오류
   */
  async entryCrackerModels() {
    const array = await this.listCrackerModels();
    if (array instanceof Error) {
      return array;
    }
    /** @type {Map<string, CrackerModel>} */
    const map = new Map();
    for (let model of array) {
      map.set(model.name, model);
    }
    return map;
  }
}

class _CrackCharacter {
  #network;
  /**
   * @param {_CrackNetwork} network
   */
  constructor(network) {
    this.#network = network;
  }

  /**
   *
   * @param {string} characterId
   * @returns {Promise<ArticleInfo | Error>}
   */
  async getCharacterInfo(characterId) {
    const result = await this.#network.authFetch(
      "GET",
      `https://crack-api.wrtn.ai/crack-gen/v3/chats/stories/${characterId}`
    );
    if (result instanceof Error) {
      return result;
    }
    return new ArticleInfo(
      result.data._id,
      result.data.name,
      result.data.defaultCrackerModel,
      new UserInfo(
        result.data.creator.nickname,
        result.data.creator.wrtnUid,
        result.data.creator.isCertifiedCreator,
        result.data.creator.profileId
      ),
      new ArticleDescription(
        result.data.description,
        result.data.simpleDescription,
        result.data.detailDescription
      ),
      result.data.tags,
      Visibility.of(result.data.visibility)
    );
  }
}

class _CrackChat {
  #path;
  #network;
  /**
   * @param {_CrackPath} path
   * @param {_CrackNetwork} network
   */
  constructor(path, network) {
    this.#path = path;
    this.#network = network;
  }
}

class CrackUtil {
  static #cookie = new _CrackCookie();
  static #path = new _CrackPath();
  static #network = new _CrackNetwork(this.#cookie);
  static #theme = new _CrackTheme();
  static #cracker = new _CrackCracker(this.#network);
  static #attend = new _CrackAttend(this.#network);

  /**
   * 크랙 출석 유틸리티를 반환합니다.
   * @returns {_CrackAttend} 출석 유틸리티
   */
  static attend() {
    return this.#attend;
  }

  /**
   * 크랙 크래커 유틸리티를 반환합니다.
   * @returns {_CrackCracker} 출석 유틸리티
   */
  static cracker() {
    return this.#cracker;
  }

  /**
   * 크랙 테마 유틸리티를 반환합니다.
   * @returns {_CrackTheme} 테마 유틸리티
   */
  static theme() {
    return this.#theme;
  }

  /**
   * 크랙 쿠키 유틸리티를 반환합니다.
   * @returns {_CrackCookie} 쿠키 유틸리티
   */
  static cookie() {
    return this.#cookie;
  }
  /**
   * 크랙 네트워크 유틸리티를 반환합니다.
   * @returns {_CrackNetwork} 네트워크 유틸리티
   */
  static network() {
    return this.#network;
  }

  /**
   * 크랙 경로 유틸리티를 반환합니다.
   * @returns {_CrackPath} 네트워크 유틸리티
   */
  static path() {
    return this.#path;
  }
}
