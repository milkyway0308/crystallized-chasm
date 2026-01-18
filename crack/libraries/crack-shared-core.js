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
 * 크랙 유저 데이터입니다.
 */
class CrackUser {
  /** @property {string} id 크랙 내부 ID */
  id;
  /** @property {string} userId 유저 ID? */
  userId;
  /** @property {string} wrtnUid 뤼튼 내부 ID */
  wrtnUid;
  /** @property {string} nickname 표기 닉네임 */
  nickname;
  /** @property {string} introdution 소개 문구 */
  introdution;
  /** @property {string} profileImage 프로필 이미지 URL */
  profileImage;
  /** @property {Date} createdAt 생성 시간 */
  createdAt;
  /** @property {Date} updatedAt 갱신 시간 */
  updatedAt;
  /** @property {number} follower 팔로워 수 */
  follower;
  /** @property {number} following 팔로잉 수 */
  following;
  /**
   * @param {string} id 크랙 내부 ID
   * @param {string} userId 유저 ID?
   * @param {string} wrtnUid 뤼튼 내부 ID
   * @param {string} nickname 표기 닉네임
   * @param {string} introdution 소개 문구
   * @param {string} profileImage 프로필 이미지 URL
   * @param {Date} createdAt 생성 시간
   * @param {Date} updatedAt 갱신 시간
   * @param {number} follower 팔로워 수
   * @param {number} following 팔로잉 수
   */
  constructor(
    id,
    userId,
    wrtnUid,
    nickname,
    introdution,
    profileImage,
    createdAt,
    updatedAt,
    follower,
    following,
  ) {
    this.id = id;
    this.userId = userId;
    this.wrtnUid = wrtnUid;
    this.nickname = nickname;
    this.introdution = introdution;
    this.profileImage = profileImage;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.follower = follower;
    this.following = following;
  }
}

/**
 * 크랙 채팅 로그 데이터입니다.
 */
class CrackChattingLog {
  /** @property {string} id 메시지 내부 ID  */
  id;
  /** @property {string} userId 유저 ID */
  userId;
  /** @property {string} messageId 메시지 외부 ID. 이 파라미터는 일반적으로 사용되지 않습니다. */
  messageId;
  /** @property {string} role 메시지 전송 주체 (user, assistant..) */
  role;
  /** @property {string} content 메시지 컨텐츠 */
  content;
  /** @property {string} model 사용 모델 ID */
  model;
  /** @property {string} turnId 턴 ID */
  turnId;
  /** @property {string} status 메시지 상태 (end = 정상 종료) */
  status;
  /** @property {string[]} recommendList 추천 목록 */
  recommendList;
  /** @property {string} crackerModel 사용 크래커 모델 */
  crackerModel;
  /** @property {string} chatModelId 사용 크래커 모델 ID*/
  chatModelId;
  /** @property {boolean} isContinuallyGeneratable 계속 생성 가능 여부 */
  isContinuallyGeneratable;
  /** @property {boolean} isContinued "계속 생성" 기능에 의해 생성되었는지의 여부 */
  isContinued;
  /** @property {string[]} situationImages 상황 이미지 목록 */
  situationImages;
  /** @property {string[]} parameterSnapshots 스탯 목록 */
  parameterSnapshots;
  /** @property {boolean} isPrologue 프롤로그 여부 */
  isPrologue;
  /** @property {boolean} reroll 리롤 여부 */
  reroll;
  /**
   * @param {string} id 메시지 내부 ID
   * @param {string} userId 유저 ID
   * @param {string} messageId 메시지 외부 ID. 이 파라미터는 일반적으로 사용되지 않습니다.
   * @param {string} role 메시지 전송 주체 (user, assistant..)
   * @param {string} content 메시지 컨텐츠
   * @param {string} model 사용 모델 ID
   * @param {string} turnId 턴 ID
   * @param {string} status 메시지 상태 (end = 정상 종료)
   * @param {string[]} recommendList 추천 목록
   * @param {string} crackerModel 사용 크래커 모델
   * @param {string} chatModelId 사용 크래커 모델 ID
   * @param {boolean} isContinuallyGeneratable 계속 생성 가능 여부
   * @param {boolean} isContinued "계속 생성" 기능에 의해 생성되었는지의 여부
   * @param {string[]} situationImages 상황 이미지 목록
   * @param {string[]} parameterSnapshots 스탯 목록
   * @param {boolean} isPrologue 프롤로그 여부
   * @param {boolean} reroll 리롤 여부
   */
  constructor(
    id,
    userId,
    messageId,
    role,
    content,
    model,
    turnId,
    status,
    recommendList,
    crackerModel,
    chatModelId,
    isContinuallyGeneratable,
    isContinued,
    situationImages,
    parameterSnapshots,
    isPrologue,
    reroll,
  ) {
    this.id = id;
    this.userId = userId;
    this.messageId = messageId;
    this.role = role;
    this.content = content;
    this.model = model;
    this.turnId = turnId;
    this.status = status;
    this.recommendList = recommendList;
    this.crackerModel = crackerModel;
    this.chatModelId = chatModelId;
    this.isContinuallyGeneratable = isContinuallyGeneratable;
    this.isContinued = isContinued;
    this.situationImages = situationImages;
    this.parameterSnapshots = parameterSnapshots;
    this.isPrologue = isPrologue;
    this.reroll = reroll;
  }
}

class CrackChatRoom {
  /** @property {string} id 채팅방 ID */
  id;
  /** @property {string} userId 유저 ID */
  userId;
  /** @property {string} title 제목 */
  title;
  /** @property {string} lastMessage 마지막 메시지 */
  lastMessage;
  /** @property {string} model 사용 모델 이름 (sonnet, gemini..) */
  model;
  /** @property {string} modelId 사용 모델 ID */
  modelId;
  /** @property {boolean} isStory 스토리 여부. true일 경우 스토리, false일 경우 캐릭터 채팅. */
  isStory;
  /** @property {string} originId 스토리 혹은 캐릭터 ID */
  originId;
  /** @property {string} originSnapshotId 스토리 혹은 캐릭터 스냅샷 ID */
  originSnapshotId;
  /** @property {string} hasUserNote 유저노트 여부 */
  hasUserNote;
  /** @property {Date} createdAt 생성 시간 */
  createdAt;
  /** @property {Date} updatedAt 갱신 시간 */
  updatedAt;
  /** @property {string} chatProfileId 사용중인 채팅 프로필 ID*/
  chatProfileId;
  /** @property {boolean} isSummaryUpdated 업데이트 여부 */
  isSummaryUpdated;
  /** @property {boolean} doRecommendNextMessage 다음 메시지 추천 여부 */
  doRecommendNextMessage;
  /**
   *
   * @param {string} id 채팅방 ID
   * @param {string} userId 유저 ID
   * @param {string} title 제목
   * @param {string} lastMessage 마지막 메시지
   * @param {string} model 사용 모델 이름 (sonnet, gemini..)
   * @param {string} modelId 사용 모델 ID
   * @param {boolean} isStory 스토리 여부. true일 경우 스토리, false일 경우 캐릭터 채팅.
   * @param {string} originId 스토리 혹은 캐릭터 ID
   * @param {string} originSnapshotId 스토리 혹은 캐릭터 스냅샷 ID
   * @param {string} hasUserNote 유저노트 여부
   * @param {Date} createdAt 생성 시간
   * @param {Date} updatedAt 갱신 시간
   * @param {string} chatProfileId 사용중인 채팅 프로필 ID
   * @param {boolean} isSummaryUpdated 업데이트 여부
   * @param {boolean} doRecommendNextMessage 다음 메시지 추천 여부
   */
  constructor(
    id,
    userId,
    title,
    lastMessage,
    model,
    modelId,
    isStory,
    originId,
    originSnapshotId,
    hasUserNote,
    createdAt,
    updatedAt,
    chatProfileId,
    isSummaryUpdated,
    doRecommendNextMessage,
  ) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.lastMessage = lastMessage;
    this.model = model;
    this.modelId = modelId;
    this.isStory = isStory;
    this.originId = originId;
    this.originSnapshotId = originSnapshotId;
    this.hasUserNote = hasUserNote;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.chatProfileId = chatProfileId;
    this.isSummaryUpdated = isSummaryUpdated;
    this.doRecommendNextMessage = doRecommendNextMessage;
  }
}
/**
 * 페르소나 데이터입니다.
 */
class CrackPersona {
  /** @property {string} id 페르소나 ID */
  id;
  /** @property {string} name 페르소나 이름 */
  name;
  /** @property {boolean} isRepresentative 대표 프로필 여부 */
  isRepresentative;
  /** @property {string} profileId 계정 프로필 ID */
  profileId;
  /** @property {Date} created 생성 시간 타임스탬프 */
  created;
  /** @property {Date} updated 갱신 시간 타임스탬프 */
  updated;
  /**
   * @param {string} id 페르소나 ID
   * @param {string} name 페르소나 이름
   * @param {boolean} isRepresentative 대표 프로필 여부
   * @param {string} profileId 계정 프로필 ID
   * @param {Date} created 생성 시간 타임스탬프
   * @param {Date} updated 갱신 시간 타임스탬프
   */
  constructor(id, name, isRepresentative, profileId, created, updated) {
    this.id = id;
    this.name = name;
    this.isRepresentative = isRepresentative;
    this.profileId = profileId;
    this.created = created;
    this.updated = updated;
  }
}

/**
 * 유틸리티 내부 사용 용도 유틸리티 클래스입니다.
 * @private
 */
class _CrackGenericUtil {
  /**
   * 값이 non-null인지 반환합니다.
   * @template T
   * @param {T} item 검증할 값
   * @return {boolean} non-null 여부
   */
  isValid(item) {
    if (item === undefined || item === null) {
      return false;
    }
    return true;
  }
}
/**
 * 크래커 모델의 비용과 이름을 나타내는 클래스입니다.
 */
class CrackerModel {
  /** @property {string} id 모델 내부 ID */
  id;
  /** @property {string} name 표시 이름 */
  name;
  /** @property {number} quantity 1회당 소모 크래커 */
  quantity;
  /** @property {string} serviceType 서비스 타입 */
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
class _CrackThemeApi {
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
class _CrackPathApi {
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
class _CrackCookieApi {
  /**
   * 쿠키에서 대상 값을 가져와 반환합니다.
   * @param {string} key 쿠키 키
   * @returns {string | undefined} 쿠키 값 혹은 undefined
   */
  getCookie(key) {
    const e = document.cookie.match(
      new RegExp(
        `(?:^|; )${key.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1")}=([^;]*)`,
      ),
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
class _CrackNetworkApi {
  #cookie;
  /**
   * @param {_CrackCookieApi} cookie
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
          `HTTP 요청 실패 (${result.status}) [${await result.json()}]`,
        );
      return await result.json();
    } catch (t) {
      // @ts-ignore
      return new Error(`알 수 없는 오류 (${t.message ?? JSON.stringify(t)})`);
    }
  }
}

class _CrackAttendApi {
  #network;
  /**
   * @param {_CrackNetworkApi} network
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
      "https://crack-api.wrtn.ai/crack-cash/attendance",
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
      "https://crack-api.wrtn.ai/crack-cash/attendance",
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

class _CrackCrackerApi {
  #network;
  /**
   * @param {_CrackNetworkApi} network
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
      "https://crack-api.wrtn.ai/crack-cash/crackers",
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
  async crackerModelList() {
    const result = await this.#network.authFetch(
      "GET",
      "https://crack-api.wrtn.ai/crack-gen/v3/chat-models",
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
          model.serviceType,
        ),
      );
    }
    return array;
  }

  /**
   * 크랙 서버에 등록된 크래커 모델 목록을 이름 기반 맵으로 반환합니다.
   * @returns {Promise<Map<string, CrackerModel> | Error>} 매핑된 모델 맵 혹은 오류
   */
  async crackerModelMap() {
    const array = await this.crackerModelList();
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

  /**
   * 지정한 크래커 모델의 정보를 가져옵니다.
   * @param {string} name 크래커 모델 이름
   * @returns {Promise<?CrackerModel | Error>} 크래커 모델 정보 혹은 오류
   */
  async crackerModel(name) {
    const result = await this.crackerModelMap();
    if (result instanceof Error) {
      return result;
    }
    return result.get(name) ?? null;
  }
}

class _CrackCharacterApi {
  #network;
  /**
   * @param {_CrackNetworkApi} network
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
      `https://crack-api.wrtn.ai/crack-gen/v3/chats/stories/${characterId}`,
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
        result.data.creator.profileId,
      ),
      new ArticleDescription(
        result.data.description,
        result.data.simpleDescription,
        result.data.detailDescription,
      ),
      result.data.tags,
      Visibility.of(result.data.visibility),
    );
  }
}

class _CrackUserApi {
  #network;
  /**
   * @param {_CrackNetworkApi} network
   */
  constructor(network) {
    this.#network = network;
  }
  /**
   * 현재 접속한 크레덴셜의 크랙 ID를 서버에서 가져와 반환합니다.
   * @returns {Promise<CrackUser | Error>} 크랙 ID 혹은 API 호출 도중 발생한 오류
   */
  async currentUser() {
    const result = await this.#network.authFetch(
      "GET",
      "https://crack-api.wrtn.ai/crack-api/profiles",
    );
    if (result instanceof Error) {
      return result;
    }
    const data = result.data;
    if (!data) {
      return new Error(
        "크랙에서 잘못된 API 응답을 반환하였습니다; API 스키마가 변경되었을 가능성이 존재합니다.",
      );
    }
    return new CrackUser(
      data._id,
      data.userId,
      data.wrtnUid,
      data.nickname,
      data.introdution,
      data.profileImage?.origin,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.follower,
      data.following,
    );
  }

  /**
   * 현재 접속한 크레덴셜의 크랙 ID를 서버에서 가져와 반환합니다.
   * @returns {Promise<string | Error>} 크랙 ID 혹은 API 호출 도중 발생한 오류
   */
  async currentId() {
    const result = await this.currentUser();
    if (result instanceof Error) {
      return result;
    }
    return result.id;
  }

  /**
   * 뤼튼 ID를 기준으로 페르소나를 가져와 반환합니다.
   * @param {string} crackId 크랙 내부 유저 ID. 크랙의 ID가 아닙니다.
   * @returns {Promise<CrackPersona[] | Error>} 페르소나 혹은 API 호출 도중 발생한 오류
   */
  async personaList(crackId) {
    const result = await this.#network.authFetch(
      "GET",
      `https://crack-api.wrtn.ai/crack-api/profiles/${crackId}/chat-profiles`,
    );
    if (result instanceof Error || !result.data?.chatProfiles) {
      return result;
    }

    /** @type {CrackPersona[]} */
    const array = [];
    for (let item of result.data.chatProfiles) {
      array.push(
        new CrackPersona(
          item._id,
          item.name,
          item.isRepresentative,
          item.profileId,
          new Date(item.createdAt),
          new Date(item.updatedAt),
        ),
      );
    }
    return array;
  }

  /**
   * ID를 기준으로 맵으로 구축된 페르소나 데이터를 서버에서 가져와 반환합니다.
   * @param {string} crackId 크랙 내부 유저 ID. 크랙의 ID가 아닙니다.
   * @returns {Promise<Map<string, CrackPersona> | Error>} 페르소나 혹은 API 호출 도중 발생한 오류
   */
  async personaMap(crackId) {
    const result = await this.personaList(crackId);
    if (result instanceof Error) {
      return result;
    }
    /** @type {Map<string, CrackPersona>} */
    const map = new Map();
    for (let persona of result) {
      map.set(persona.id, persona);
    }
    return map;
  }

  /**
   * 현재 ID를 기준으로 페르소나를 가져와 반환합니다.
   * **이 펑션은 2회의 API 호출을 발생시킵니다.**
   * @returns {Promise<CrackPersona[] | Error>} 페르소나 혹은 API 호출 도중 발생한 오류
   */
  async currentPersona() {
    const currentId = await this.currentId();
    if (currentId instanceof Error) {
      return currentId;
    }
    return await this.personaList(currentId);
  }

  /**
   * 현재 ID를 기준으로 페르소나를 가져와 반환합니다.
   * **이 펑션은 2회의 API 호출을 발생시킵니다.**
   * @returns {Promise<Map<string, CrackPersona> | Error>} 페르소나 혹은 API 호출 도중 발생한 오류
   */
  async currentPersonaMap() {
    const currentId = await this.currentId();
    if (currentId instanceof Error) {
      return currentId;
    }
    return await this.personaMap(currentId);
  }
}

class _CrackStoryApi {
  #generic;
  #user;
  #network;
  /**
   * @param {_CrackGenericUtil} generic
   * @param {_CrackUserApi} user
   * @param {_CrackNetworkApi} network
   */
  constructor(generic, user, network) {
    this.#generic = generic;
    this.#user = user;
    this.#network = network;
  }

  /**
   * 새 스토리 채팅방을 생성합니다.
   * @param {string} storyId 스토리 ID
   * @param {string} baseSetId 기본 시작 설정 ID
   * @param {string} profileId 프로필 ID
   * @param {string} [crackerModel] 크래커 모델 (normalchat, superchat_2_0..)
   * @param {boolean} [autoRecommend] 추천 답변 자동 제안 여부
   * @returns {Promise<CrackChatRoom | Error>} 생성된 방 정보 혹은 오류
   */
  async createRoom(
    storyId,
    baseSetId,
    profileId,
    crackerModel = "normalchat",
    autoRecommend = false,
  ) {
    const result = await this.#network.authFetch(
      "POST",
      "https://crack-api.wrtn.ai/crack-gen/v3/chats",
      {
        storyId: storyId,
        chatProfileId: profileId,
        baseSetId: baseSetId,
        crackerModel: crackerModel,
        isAutoRecommendUserNextMessage: autoRecommend,
      },
    );
    if (result instanceof Error) {
      return result;
    }
    const data = result.data;
    if (!data) {
      return new Error(
        "크랙 API에서 예상치 못한 스키마가 반환되었습니다. 이는 일시적 오류일 수 있지만, 크랙 API 변경이 원인일 수 있습니다.",
      );
    }
    return new CrackChatRoom(
      data._id,
      data.userId,
      data.title,
      data.lastMessage,
      data.model,
      data.chatModelId,
      this.#generic.isValid(data.story),
      data.story?._id ?? data.story._id,
      data.story?.snapshotId ?? data.story.snapshotId,
      data.hasUserNote,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.chatProfile?._id ?? "--ERROR--",
      data.isSummaryUpdated,
      data.isAutoRecommendUserNextMessage,
    );
  }
}

class _CrackChatRoomApi {
  #generic;
  #user;
  #network;
  /**
   * @param {_CrackGenericUtil} generic
   * @param {_CrackUserApi} user
   * @param {_CrackNetworkApi} network
   */
  constructor(generic, user, network) {
    this.#generic = generic;
    this.#user = user;
    this.#network = network;
  }

  /**
   * 지정한 채팅의 현재 데이터를 가져옵니다.
   * @param {string} chatId 채팅방 ID
   * @returns {Promise<CrackChatRoom | Error>}
   */
  async roomData(chatId) {
    const result = await this.#network.authFetch(
      "GET",
      `https://crack-api.wrtn.ai/crack-gen/v3/chats/${chatId}`,
    );
    if (result instanceof Error) {
      return result;
    }
    const data = result.data;
    if (!data) {
      return new Error(
        "크랙 API에서 예상치 못한 스키마가 반환되었습니다. 이는 일시적 오류일 수 있지만, 크랙 API 변경이 원인일 수 있습니다.",
      );
    }
    return new CrackChatRoom(
      data._id,
      data.userId,
      data.title,
      data.lastMessage,
      data.model,
      data.chatModelId,
      this.#generic.isValid(data.story),
      data.story?._id ?? data.story._id,
      data.story?.snapshotId ?? data.story.snapshotId,
      data.hasUserNote,
      new Date(data.createdAt),
      new Date(data.updatedAt),
      data.chatProfile?._id ?? "--ERROR--",
      data.isSummaryUpdated,
      data.isAutoRecommendUserNextMessage,
    );
  }

  /**
   *
   * @param {string} chatId 채팅 로그를 가져올 채팅방 ID입니다.
   * @param {Object} [param] 옵션 파라미터
   * @param {number} [param.maxCount] 최대로 가져올 메시지 개수. -1로 입력시, 모든 메시지를 가져옵니다.
   * @param {number} [param.delay] 각 요청마다 대기할 간격입니다. 이 옵션이 없는 경우, 크랙의 API 서버에서 레이트리밋을 반환할 가능성이 존재합니다.
   * @param {boolean} [param.naturalOrder] 어느 순서로 메시지를 가져올지의 여부입니다. true일 경우, 시간 흐름대로 반환합니다(오래된 메시지 -> 최신 메시지). false일 경우, 역순으로 반환합니다(최신 메시지 -> 오래된 메시지).
   * @returns {Promise<CrackChattingLog[] | Error>} 채팅 로그 목록 혹은 오류
   */
  async extractLogs(
    chatId,
    { maxCount = -1, delay = 20, naturalOrder = true } = {},
  ) {
    /** @type {CrackChattingLog[]} */
    const logs = [];
    let cursor = undefined;
    while (maxCount === -1 || logs.length < maxCount) {
      const nextUrl =
        cursor === undefined
          ? `https://contents-api.wrtn.ai/character-chat/v3/chats/${chatId}/messages?limit=20`
          : `https://contents-api.wrtn.ai/character-chat/v3/chats/${chatId}/messages?limit=20&cursor=${cursor}`;
      const result = await this.#network.authFetch("GET", nextUrl);
      if (result instanceof Error) {
        return result;
      }
      cursor = result.data.nextCursor;
      if (cursor === undefined || cursor === null) {
        break;
      }
      for (let message of result.data.messages) {
        if ((message.content?.length ?? 0) === 0) continue;
        const fetchedLog = new CrackChattingLog(
          message._id,
          message.userId,
          message.chatId,
          message.role,
          message.content,
          message.model,
          message.turnId,
          message.status,
          message.dynamicChipList,
          message.crackerModel,
          message.chatModelId,
          message.isContinuallyGeneratable,
          message.isContinued,
          message.situationImages,
          message.parameterSnapshots,
          message.isPrologue,
          message.reroll ?? false,
        );
        if (naturalOrder) {
          logs.unshift(fetchedLog);
        } else {
          logs.push(fetchedLog);
        }
        if (maxCount !== -1 && logs.length >= maxCount) {
          break;
        }
      }
      delay > 0 && (await new Promise((resolve) => setTimeout(resolve, delay)));
    }
    return logs;
  }

  /**
   * 지정한 채팅의 현재 페르소나 데이터를 가져옵니다.
   * @param {string} chatId
   * @returns {Promise<?CrackPersona | Error>}
   */
  async currentPersona(chatId) {
    const chatData = await this.roomData(chatId);
    if (chatData instanceof Error) {
      return chatData;
    }
    const personaMap = await this.#user.currentPersonaMap();
    if (personaMap instanceof Error) {
      return personaMap;
    }
    return personaMap.get(chatData.chatProfileId) ?? null;
  }
}

/**
 * 크랙 UI 컴포넌트 추출 유틸리티.
 * 이 클래스는 크랙 UI 변경에 따라 문제가 발생할 수 있습니다.
 */
class _CrackComponentApi {
  /**
   * 크랙 웹 페이지에서 우측 사이드 패널을 추출합니다.
   * 경로에 따라 사이드바가 존재하지 않을 수 있습니다.
   *
   * @returns {?Element} 추출된 사이드바 요소
   */
  sidePanel() {
    const node = document.getElementsByClassName("css-c82bbp")[0];
    return node?.children[0]?.children[0];
  }
}
class CrackUtil {
  static #cookie = new _CrackCookieApi();
  static #path = new _CrackPathApi();
  static #generic = new _CrackGenericUtil();
  static #component = new _CrackComponentApi();
  static #network = new _CrackNetworkApi(this.#cookie);
  static #theme = new _CrackThemeApi();
  static #user = new _CrackUserApi(this.#network);
  static #room = new _CrackChatRoomApi(
    this.#generic,
    this.#user,
    this.#network,
  );
  static #story = new _CrackStoryApi(this.#generic, this.#user, this.#network);
  static #cracker = new _CrackCrackerApi(this.#network);
  static #attend = new _CrackAttendApi(this.#network);

  /**
   * 크랙 출석 유틸리티를 반환합니다.
   * @returns {_CrackAttendApi} 출석 유틸리티
   */
  static attend() {
    return this.#attend;
  }

  /**
   * 크랙 채팅방 유틸리티를 반환합니다.
   * @returns {_CrackChatRoomApi} 스토리 유틸리티
   */
  static chatRoom() {
    return this.#room;
  }

  /**
   * 크랙 스토리 유틸리티를 반환합니다.
   * @returns {_CrackStoryApi} 스토리 유틸리티
   */
  static story() {
    return this.#story;
  }

  /**
   * 크랙 유저 유틸리티를 반환합니다.
   * @returns {_CrackUserApi} 유저 유틸리티
   */
  static user() {
    return this.#user;
  }

  /**
   * 크랙 크래커 유틸리티를 반환합니다.
   * @returns {_CrackCrackerApi} 출석 유틸리티
   */
  static cracker() {
    return this.#cracker;
  }

  /**
   * 크랙 테마 유틸리티를 반환합니다.
   * @returns {_CrackThemeApi} 테마 유틸리티
   */
  static theme() {
    return this.#theme;
  }

  /**
   * 크랙 쿠키 유틸리티를 반환합니다.
   * @returns {_CrackCookieApi} 쿠키 유틸리티
   */
  static cookie() {
    return this.#cookie;
  }
  /**
   * 크랙 네트워크 유틸리티를 반환합니다.
   * @returns {_CrackNetworkApi} 네트워크 유틸리티
   */
  static network() {
    return this.#network;
  }

  /**
   * 크랙 경로 유틸리티를 반환합니다.
   * @returns {_CrackPathApi} 네트워크 유틸리티
   */
  static path() {
    return this.#path;
  }

  /**
   * 크랙 UI 컴포넌트 유틸리티를 반환합니다.
   * @returns {_CrackComponentApi} 컴포넌트 유틸리티
   */
  static component() {
    return this.#component;
  }
}
