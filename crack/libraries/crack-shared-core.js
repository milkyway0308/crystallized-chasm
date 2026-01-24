//
// crack-shared-core.js v1.1.1 by Team IGX
// crack-shared-core은 TS의 문법 검사와 JSDoc을 통한 브라우저 스크립트 전용 크랙 유틸리티입니다.
//

// @ts-check
// =====================================================
//                   Crack Shared Core
// =====================================================

// =====================================================
//                      데이터 클래스
// =====================================================

class ImageMappable {
  /** @property {Map<string, string>} */
  imageMap = new Map();
  /**
   * @param {any} imageContainer 이미지 맵
   */
  constructor(imageContainer) {
    if (imageContainer) {
      for (let [key, value] of Object.entries(imageContainer)) {
        this.imageMap.set(key, value);
      }
    }
  }

  /**
   * 라이트 모드 이미지를 반환합니다.
   * @returns {?string} 이미지 URL
   */
  light() {
    return this.imageMap.get("light");
  }

  /**
   * 라이트 모드 이미지를 반환합니다.
   * @returns {?string} 이미지 URL
   */
  dark() {
    return this.imageMap.get("dark");
  }

  /**
   * 이미지 맵에서 키에 해당되는 이미지 URL을 반환합니다.
   * @param {string} key 이미지 키
   * @returns {?string} 이미지 URL
   */
  image(key) {
    return this.imageMap.get(key);
  }
}
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
  /** @property {string} 크랙 내부 ID */
  id;
  /** @property {string} 유저 ID? */
  userId;
  /** @property {string} 뤼튼 내부 ID */
  wrtnUid;
  /** @property {string} 표기 닉네임 */
  nickname;
  /** @property {string} 소개 문구 */
  introdution;
  /** @property {string} 프로필 이미지 URL */
  profileImage;
  /** @property {Date} 생성 시간 */
  createdAt;
  /** @property {Date} 갱신 시간 */
  updatedAt;
  /** @property {number} 팔로워 수 */
  follower;
  /** @property {number} 팔로잉 수 */
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

class CrackNotification {
  /** @property {string} 알림 ID */
  id;
  /** @property {boolean} 읽기 여부 */
  isRead;
  /** @property {string} 알림 제목 */
  pushTitle;
  /** @property {string} 알림 내용 */
  pushBody;
  /** @property {string} 알림 카테고리 */
  category;
  /** @property {string} 알림 웹링크 */
  appLink;
  /** @property  {string} 알림 웹링크 */
  webLink;
  /** @property {string} 썸네일 URL */
  thumbnail;
  /** @property {Date} 알림 생성일 */
  createdAt;
  /** @property {Date} 알림 갱신일 */
  updatedAt;
  /**
   * @param {string} id 알림 ID
   * @param {boolean} isRead 읽기 여부
   * @param {string} pushTitle 알림 제목
   * @param {string} pushBody 알림 내용
   * @param {string} category 알림 카테고리
   * @param {string} appLink 알림 웹링크
   * @param {string} webLink 알림 웹링크
   * @param {string} thumbnail 썸네일 URL
   * @param {Date} createdAt 알림 생성일
   * @param {Date} updatedAt 알림 갱신일
   */
  constructor(
    id,
    isRead,
    pushTitle,
    pushBody,
    category,
    appLink,
    webLink,
    thumbnail,
    createdAt,
    updatedAt,
  ) {
    this.id = id;
    this.isRead = isRead;
    this.pushTitle = pushTitle;
    this.pushBody = pushBody;
    this.category = category;
    this.appLink = appLink;
    this.webLink = webLink;
    this.thumbnail = thumbnail;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param {any} container
   * @returns {CrackNotification} 정제된 데이터
   */
  static of(container) {
    return new CrackNotification(
      container._id,
      container.isRead,
      container.push?.title ?? "",
      container.push?.body ?? "",
      container.category,
      container.appLink,
      container.webLink,
      container.thumbnail,
      new Date(container.createdAt),
      new Date(container.updatedAt),
    );
  }
}
class CrackPromptTemplate extends ImageMappable {
  /** @property {string} 템플릿 표기 이름 */
  name;
  /** @property {string} 템플릿 ID */
  id;
  /**
   * @param {string} name 템플릿 표기 이름
   * @param {string} id 템플릿 ID
   * @param {any} iconContainer 템플릿 아이콘 이미지
   */
  constructor(name, id, iconContainer) {
    super(iconContainer);
    this.name = name;
    this.id = id;
  }

  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param {any} container
   * @returns {CrackPromptTemplate} 정제된 데이터
   */
  static of(container) {
    return new CrackPromptTemplate(
      container.name,
      container.template,
      container.icon,
    );
  }
}

class CrackGenre {
  /** @param {string} id 장르 ID */
  id;
  /** @param {string} name 장르 표시명 */
  name;
  /** @param {string} type 장르 영어 타입 */
  type;
  /**
   * @param {string} id 장르 ID
   * @param {string} name 장르 표시명
   * @param {string} type 장르 영어 타입
   */
  constructor(id, name, type) {
    this.id = id;
    this.name = name;
    this.type = type;
  }

  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param {any} container
   * @returns {CrackGenre} 정제된 데이터
   */
  static of(container) {
    return new CrackGenre(container._id, container.name, container.type);
  }
}

class CrackStoryDescription {
  /** @property {string} 일반 설명 */
  base;
  /** @property {string} 한줄 소개 */
  simple;
  /** @property {string} 상세 설명 */
  detail;
  /**
   * @param {string} description 일반 설명
   * @param {string} simple 한줄 소개
   * @param {string} detail 상세 설명
   */
  constructor(description, simple, detail) {
    this.base = description;
    this.simple = simple;
    this.detail = detail;
  }

  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param {any} container
   * @returns {CrackStoryDescription} 정제된 데이터
   */
  static of(container) {
    return new CrackStoryDescription(
      container.description,
      container.simpleDescription,
      container.detailDescription,
    );
  }
}
class CrackMappedImage extends ImageMappable {
  /**
   * @param {any} imageContainer
   */
  constructor(imageContainer) {
    super(imageContainer);
  }

  /**
   * 원본 이미지를 가져옵니다.
   * @returns {string}
   */
  origin() {
    return super.image("origin") ?? "about:blank";
  }

  /**
   * 200px 썸네일 이미지를 가져옵니다.
   * 이 값은 지정되지 않았을 가능성이 존재합니다.
   * @returns {?string}
   */
  w200() {
    return super.image("w200");
  }

  /**
   * 200px 미리보기 이미지를 가져옵니다.
   * 이 값은 지정되지 않았을 가능성이 존재합니다.
   * @returns {?string}
   */
  w600() {
    return super.image("w600");
  }

  /**
   * GIF 이미지를 가져옵니다.
   * 이 값은 지정되지 않았을 가능성이 존재합니다.
   * @returns {?string}
   */
  gif() {
    return super.image("gif");
  }

  /**
   *
   * @returns
   */
  tryOrigin() {
    return this.gif() ?? this.origin();
  }
}

class CrackModelInfo extends ImageMappable {
  /** @property {string} 모델 표시명  */
  name;
  /** @property {string} 모델 표시명  */
  model;
  /**
   * @param {string} name 모델 표시명
   * @param {string} model 모델 ID
   * @param {any} iconContainer 모델 아이콘
   */
  constructor(name, model, iconContainer) {
    super(iconContainer);
    this.name = name;
    this.model = model;
  }
}
/**
 * 크랙의 스토리 상태 데이터를 표시하는 클래스입니다.
 */
class CrackStoryStatus {
  /** @property {CrackGenre} 작품 장르 데이터  */
  genre;
  /** @property {string[]} 작품 장르 데이터 */
  categories;
  /** @property {string} 타겟층 (남성향 / 여성향..) */
  target;
  /** @property {string} 타입 (시뮬레이션...) */
  chatType;
  /** @property {number} 이미지 개수  */
  imageCount;
  /** @property {Visibility} 작품 공개 상태 */
  visibility;
  /** @property {string} 작품 상태 */
  status;
  /** @property {CrackMappedImage} 작품 이미지 */
  profileImage;
  /** @property {Date} 작품 생성 시간 */
  createdAt;
  /** @property {Date} 작품 갱신 시간 */
  updatedAt;
  /** @property {boolean} 언세이프 여부 */
  isAdult;
  /** @property {boolean} 운영진에 의해 강제로 변경되었는지의 여부 */
  isForceConverted;
  /**
   * @param {CrackGenre} genre 작품 장르 데이터
   * @param {number} imageCount 이미지 개수
   * @param {Visibility} visibility 작품 공개 상태
   * @param {string} status 작품 공개 상태
   * @param {string[]} categories 작품 카테고리 데이터
   * @param {string} target 타겟층 (남성향 / 여성향..)
   * @param {string} chatType 타입 (시뮬레이션...)
   * @param {CrackMappedImage} profileImage 작품 이미지
   * @param {Date} createdAt 작품 생성 시간
   * @param {Date} updatedAt 작품 갱신 시간
   * @param {boolean} isAdult 언세이프 여부
   * @param {boolean} isForceConverted 운영진에 의해 강제로 변경되었는지의 여부
   */
  constructor(
    genre,
    imageCount,
    visibility,
    status,
    categories,
    target,
    chatType,
    profileImage,
    createdAt,
    updatedAt,
    isAdult,
    isForceConverted,
  ) {
    this.genre = genre;
    this.categories = categories;
    this.imageCount = imageCount;
    this.visibility = visibility;
    this.status = status;
    this.target = target;
    this.chatType = chatType;
    this.profileImage = profileImage;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isAdult = isAdult;
    this.isForceConverted = isForceConverted;
  }

  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param {any} container
   * @returns {CrackStoryStatus} 정제된 데이터
   */
  static of(container) {
    return new CrackStoryStatus(
      CrackGenre.of(container.genre),
      container.imageCount,
      Visibility.of(container.visibility),
      container.status,
      container.categories,
      container.target?.name,
      container.chatType?.name,
      new CrackMappedImage(container.profileImage),
      new Date(container.createdAt),
      new Date(container.updatedAt),
      container.isAdult,
      container.isConvertedToAdult,
    );
  }
}
/**
 * 스토리 시작 상황 데이터를 나타내는 클래스입니다.
 */
class CrackStoryStartingSet {
  /** @property {string} 크랙 내부 ID  */
  id;
  /** @property {string} 크랙 내부 시작 세트 ID  */
  baseSetId;
  /** @property {string} 시작 상황 이름 */
  name;
  /** @property {string} 시작 상황 이름  */
  initialMessages;
  /** @property {string[]} 추천 시작 응답 */
  replySuggestion;
  /** @property {string} 플레이 가이드 */
  playGuide;
  /**
   * @param {string} id 크랙 내부 ID
   * @param {string} baseSetId 크랙 내부 시작 세트 ID
   * @param {string} name 시작 상황 이름
   * @param {string[]} initialMessages 시작 메시지
   * @param {string[]} replySuggestion 추천 시작 응답
   * @param {string} playGuide 플레이 가이드
   */
  constructor(
    id,
    baseSetId,
    name,
    initialMessages,
    replySuggestion,
    playGuide,
  ) {
    this.id = id;
    this.baseSetId = baseSetId;
    this.name = name;
    this.initialMessages = initialMessages;
    this.replySuggestion = replySuggestion;
    this.playGuide = playGuide;
  }

  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param {any} container
   * @returns {CrackStoryStartingSet} 정제된 데이터
   */
  static of(container) {
    return new CrackStoryStartingSet(
      container._id,
      container.baseSetId,
      container.name,
      container.initialMessages,
      container.replySuggestions,
      container.playGuide,
    );
  }
}
class CrackComment {
  /** @property {string} 댓글 ID */
  id;
  /** @property {string} 댓글 내용 */
  content;
  /** @property {UserInfo} 댓글 작성자 */
  writer;

  /**
   * @param {string} id 댓글 ID
   * @param {string} content 댓글 내용
   * @param {UserInfo} writer 댓글 작성자
   */
  constructor(id, content, writer) {
    this.id = id;
    this.content = content;
    this.writer = writer;
  }

  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param {any} container
   * @returns {CrackComment} 정제된 데이터
   */
  static of(container) {
    return new CrackComment(
      container._id,
      container.content,
      UserInfo.of(container.writer),
    );
  }
}

class CrackStoryInfo {
  /** @property {string} 작품 ID */
  id;
  /** @property {string[]} 작품 초기 메시지*/
  initialMessages;
  /** @property {string} 기본 크래커 모델 (superchat_2_0...)*/
  crackerModel;
  /** @property {string} 채팅 모델 ID */
  model;
  /** @property {UserInfo} 제작자 */
  creator;
  /** @property {string} 작품 이름 */
  name;
  /** @property {CrackStoryDescription} 작품 설명 */
  description;
  /** @property {CrackArticleStatistics} 작품 통계 */
  statistics;
  /** @property {CrackStoryStatus} 작품 상태 및 메타데이터*/
  status;
  /** @property {CrackPromptTemplate} 작품 프롬프트 템플릿 */
  template;
  /** @property {?CrackComment} 고정 혹은 대표 댓글 */
  representiveComment;
  /** @property {CrackStoryStartingSet[]} 시작 설정 */
  startingSets;
  /** @property {?string} 공유 URL */
  shareUrl;
  /**
   * @param {string} id 작품 ID
   * @param {string[]} initialMessages 작품 초기 메시지
   * @param {string} crackerModel 기본 크래커 모델 (superchat_2_0...)
   * @param {string} model 채팅 모델 ID
   * @param {UserInfo} creator 제작자
   * @param {string} name 작품 이름
   * @param {CrackStoryDescription} description 작품 설명
   * @param {CrackArticleStatistics} statistics 작품 통계
   * @param {CrackStoryStatus} status 작품 상태 및 메타데이터
   * @param {CrackPromptTemplate} template 작품 프롬프트 템플릿
   * @param {?CrackComment} representiveComment 고정 혹은 대표 댓글
   * @param {CrackStoryStartingSet[]} startingSets 시작 설정
   * @param {?string} shareUrl 공유 URL
   */
  constructor(
    id,
    initialMessages,
    crackerModel,
    model,
    creator,
    name,
    description,
    statistics,
    status,
    template,
    representiveComment,
    startingSets,
    shareUrl,
  ) {
    this.id = id;
    this.initialMessages = initialMessages;
    this.crackerModel = crackerModel;
    this.model = model;
    this.creator = creator;
    this.name = name;
    this.description = description;
    this.statistics = statistics;
    this.status = status;
    this.template = template;
    this.representiveComment = representiveComment;
    this.startingSets = startingSets;
    this.shareUrl = shareUrl;
  }

  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param {any} container
   * @returns {CrackStoryInfo} 정제된 데이터
   */
  static of(container) {
    return new CrackStoryInfo(
      container._id,
      container.initialMessages,
      container.defaultCrackerModel,
      container.chatModelId,
      UserInfo.of(container.creator),
      container.name,
      CrackStoryDescription.of(container),
      CrackArticleStatistics.of(container),
      CrackStoryStatus.of(container),
      CrackPromptTemplate.of(container.promptTemplate),
      CrackComment.of(container.representativeComment),
      Array.from(container.startingSets).map((item) =>
        CrackStoryStartingSet.of(item),
      ),
      container.shareUrl,
    );
  }
}
/**
 * 작품의 통계 데이터를 나타내는 클래스입니다.
 */
class CrackArticleStatistics {
  /** @property {number} 작품에 보내진 메시지의 총 개수 */
  messageSent;
  /** @property {number} 이 작품으로 생성된 채팅방 개수 */
  roomCreated;
  /** @property {number} 이 작품에 채팅을 보낸 플레이어 수 */
  players;
  /** @property {number} 좋아요 수 */
  likes;
  /** @property {number} 댓글 수 */
  comments;
  /**
   * @param {number} messageSent 작품에 보내진 메시지의 총 개수
   * @param {number} roomCreated 이 작품으로 생성된 채팅방 개수
   * @param {number} players 이 작품에 채팅을 보낸 플레이어 수
   * @param {number} likes 좋아요 수
   * @param {number} comments 댓글 수
   */
  constructor(messageSent, roomCreated, players, likes, comments) {
    this.messageSent = messageSent;
    this.roomCreated = roomCreated;
    this.players = players;
    this.likes = likes;
    this.comments = comments;
  }

  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param {any} container
   * @returns {CrackArticleStatistics} 정제된 데이터
   */
  static of(container) {
    return new CrackArticleStatistics(
      container.totalMessageCount,
      container.chatUserCount,
      container.chatUserCount,
      container.likeCount,
      container.commentCount,
    );
  }
}

/**
 * 크랙 채팅 로그 데이터입니다.
 */
class CrackChattingLog {
  /** @property {string} 메시지 내부 ID  */
  id;
  /** @property {string} 유저 ID */
  userId;
  /** @property {string} 메시지 외부 ID. 이 파라미터는 일반적으로 사용되지 않습니다. */
  messageId;
  /** @property {string} 메시지 전송 주체 (user, assistant..) */
  role;
  /** @property {string} 메시지 컨텐츠 */
  content;
  /** @property {string} 사용 모델 ID */
  model;
  /** @property {string} 턴 ID */
  turnId;
  /** @property {string} 메시지 상태 (end = 정상 종료) */
  status;
  /** @property {string[]} 추천 목록 */
  recommendList;
  /** @property {string} 사용 크래커 모델 */
  crackerModel;
  /** @property {string} 사용 크래커 모델 ID*/
  chatModelId;
  /** @property {boolean} 계속 생성 가능 여부 */
  isContinuallyGeneratable;
  /** @property {boolean} "계속 생성" 기능에 의해 생성되었는지의 여부 */
  isContinued;
  /** @property {string[]} 상황 이미지 목록 */
  situationImages;
  /** @property {string[]} 스탯 목록 */
  parameterSnapshots;
  /** @property {boolean} 프롤로그 여부 */
  isPrologue;
  /** @property {boolean} 리롤 여부 */
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

  isBot() {
    return this.role === "assistant";
  }

  isUser() {
    return this.role === "user";
  }

  /**
   * 채팅 로그를 단순화해 반한합니다.
   * @returns {CrackSimplifiedChattingLog} 단순화된 로그
   */
  simplify() {
    return new CrackSimplifiedChattingLog(
      this.role,
      this.content,
      this.situationImages,
      this.parameterSnapshots,
    );
  }

  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param {any} container
   * @returns {CrackChattingLog} 정제된 데이터
   */
  static of(container) {
    return new CrackChattingLog(
      container._id,
      container.userId,
      container.chatId,
      container.role,
      container.content,
      container.model,
      container.turnId,
      container.status,
      container.dynamicChipList,
      container.crackerModel,
      container.chatModelId,
      container.isContinuallyGeneratable,
      container.isContinued,
      container.situationImages,
      container.parameterSnapshots,
      container.isPrologue,
      container.reroll ?? false,
    );
  }
}

/**
 * 단순화된 채팅 로그입니다.
 */
class CrackSimplifiedChattingLog {
  /** @property {string} role 메시지 전송 주체 (user, assistant..) */
  role;
  /** @property {string} content 메시지 내용 */
  content;
  /** @property {string[]} situationImages 상황 이미지 URL 목록 */
  situationImages;
  /** @property {any} parameterSnapshots 능력치 목록 */
  parameterSnapshots;
  /**
   * @param {string} role 메시지 전송 주체 (user, assistant..)
   * @param {string} content 메시지 내용
   * @param {string[]} situationImages 상황 이미지 URL 목록
   * @param {any} parameterSnapshots 능력치 목록
   */
  constructor(role, content, situationImages, parameterSnapshots) {
    this.role = role;
    this.content = content;
    this.situationImages = situationImages;
    this.parameterSnapshots = parameterSnapshots;
  }
}

class CrackStorySessionInfo extends ImageMappable {
  /** @property {string} 스토리 ID */
  id;
  /** @property {string} 스토리 스냅샷 ID */
  snapshotId;
  /** @property {string} 스토리 이름 */
  name;
  /** @property {string} 시작 설정 ID */
  startingSetId;
  /** @property {string} 시작 설정 세트 ID */
  baseSetId;
  /** @property {boolean} 언세이프 여부 */
  isAdult;
  /**
   * @param {string} id 스토리 ID
   * @param {string} snapshotId 스토리 스냅샷 ID
   * @param {string} name 스토리 이름
   * @param {any} images 이미지 컨테이너
   * @param {string} startingSetId 시작 설정 ID
   * @param {string} baseSetId 시작 설정 세트 ID
   * @param {boolean} isAdult 언세이프 여부
   */
  constructor(id, snapshotId, name, images, startingSetId, baseSetId, isAdult) {
    super(images);
    this.id = id;
    this.snapshotId = snapshotId;
    this.name = name;
    this.startingSetId = startingSetId;
    this.baseSetId = baseSetId;
    this.isAdult = isAdult;
  }

  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param {any} container
   * @returns {CrackStorySessionInfo} 정제된 데이터
   */
  static of(container) {
    return new CrackStorySessionInfo(
      container._id,
      container.snapshotId,
      container.name,
      container.profileImage,
      container.statringSetId,
      container.baseSetId,
      container.isAdult,
    );
  }
}

class CrackCharacterSessionInfo {
  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param {any} container
   * @returns {CrackCharacterSessionInfo} 정제된 데이터
   */
  static of(container) {
    return new CrackCharacterSessionInfo();
  }
}

class CrackChatRoom {
  /** @property {string} 채팅방 ID */
  id;
  /** @property {string} 유저 ID */
  userId;
  /** @property {string} 제목 */
  title;
  /** @property {string} 마지막 메시지 */
  lastMessage;
  /** @property {string} 사용 모델 이름 (sonnet, gemini..) */
  model;
  /** @property {string} 사용 모델 ID */
  modelId;

  /** @property {string} 유저노트 여부 */
  hasUserNote;
  /** @property {Date} 생성 시간 */
  createdAt;
  /** @property {Date} 갱신 시간 */
  updatedAt;
  /** @property {boolean} 업데이트 여부 */
  isSummaryUpdated;
  /** @property {boolean} 다음 메시지 추천 여부 */
  doRecommendNextMessage;
  /** @property {?string} 현재 채팅 프로필 ID (페르소나 ID) */
  chatProfileId;
  /** @property {?CrackStorySessionInfo} 현재 방의 스토리 세션 정보 */
  story;
  /** @property {?CrackCharacterSessionInfo} 현재 방의 캐릭터 세션 정보 */
  character;
  /**
   *
   * @param {string} id 채팅방 ID
   * @param {string} userId 유저 ID
   * @param {string} title 제목
   * @param {string} lastMessage 마지막 메시지
   * @param {string} model 사용 모델 이름 (sonnet, gemini..)
   * @param {string} modelId 사용 모델 ID
   * @param {string} hasUserNote 유저노트 여부
   * @param {Date} createdAt 생성 시간
   * @param {Date} updatedAt 갱신 시간
   * @param {boolean} isSummaryUpdated 업데이트 여부
   * @param {boolean} doRecommendNextMessage 다음 메시지 추천 여부
   * @param {?string} chatProfileId 현재 채팅 프로필 ID (페르소나 ID)
   * @param {?CrackStorySessionInfo} story 현재 방의 스토리 세션 정보
   * @param {?CrackCharacterSessionInfo} character 현재 방의 캐릭터 세션 정보
   */
  constructor(
    id,
    userId,
    title,
    lastMessage,
    model,
    modelId,
    hasUserNote,
    createdAt,
    updatedAt,
    isSummaryUpdated,
    doRecommendNextMessage,
    chatProfileId,
    story,
    character,
  ) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.lastMessage = lastMessage;
    this.model = model;
    this.modelId = modelId;
    this.hasUserNote = hasUserNote;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isSummaryUpdated = isSummaryUpdated;
    this.doRecommendNextMessage = doRecommendNextMessage;
    this.chatProfileId = chatProfileId;
    this.story = story;
    this.character = character;
  }

  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param {any} container
   * @returns {CrackChatRoom} 정제된 데이터
   */
  static of(container) {
    return new CrackChatRoom(
      container._id,
      container.userId,
      container.title,
      container.lastMessage,
      container.model,
      container.chatModelId,
      container.hasUserNote,
      new Date(container.createdAt),
      new Date(container.updatedAt),
      container.isSummaryUpdated,
      container.isAutoRecommendUserNextMessage,
      container.chatProfile?._id,
      container.story ? CrackStorySessionInfo.of(container.story) : null,
      container.character
        ? CrackCharacterSessionInfo.of(container.character)
        : null,
    );
  }
}
/**
 * 페르소나 데이터입니다.
 */
class CrackPersona {
  /** @property {string} 페르소나 ID */
  id;
  /** @property {string} 페르소나 이름 */
  name;
  /** @property {boolean} 대표 프로필 여부 */
  isRepresentative;
  /** @property {string} 계정 프로필 ID */
  profileId;
  /** @property {Date} 생성 시간 타임스탬프 */
  created;
  /** @property {Date} 갱신 시간 타임스탬프 */
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
  /** @property {string} 모델 내부 ID */
  id;
  /** @property {string} 표시 이름 */
  name;
  /** @property {number} 1회당 소모 크래커 */
  quantity;
  /** @property {string} 서비스 타입 */
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
class UserInfo extends CrackMappedImage {
  /** @property {string} 크랙 내부 ID */
  id;
  /** @property {string} 표기 닉네임 */
  nickname;
  /** @property {string} 뤼튼 ID */
  wrtnId;
  /** @property {string}  유저 프로필 ID */
  profileId;
  /** @property {?boolean} 크리에이터 여부. null 혹은 undefined일 경우, 주어진 데이터에서 유추할 수 없음을 뜻합니다. */
  isCertificated;
  /**
   * @param {string} id 크랙 내부 ID
   * @param {string} nickname 표기 닉네임
   * @param {string} wrtnId 뤼튼 ID
   * @param {?boolean} isCertificated 크리에이터 여부
   * @param {string} profileId 유저 프로필 ID
   * @param {any} container 이미지 컨테이너
   */
  constructor(id, nickname, wrtnId, isCertificated, profileId, container) {
    super(container);
    this.id = id;
    this.nickname = nickname;
    this.wrtnId = wrtnId;
    this.isCertificated = isCertificated;
    this.profileId = profileId;
  }

  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param {any} container
   * @returns {UserInfo} 정제된 데이터
   */
  static of(container) {
    return new UserInfo(
      container.userId,
      container.nickname,
      container.wrtnId,
      container.isCertifiedCreator,
      container.profileId,
      container.profileImage,
    );
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
   * @returns {Promise<(Error & {code: number}) | any>} 파싱된 값 혹은 오류
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
      if (!result.ok) {
        const errorItem = new Error(
          `HTTP 요청 실패 (${result.status}) [${await result.json()}]`,
        );
        Object.assign(errorItem, { code: result.status });
        return errorItem;
      }
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
    return result.data.quantity ?? 0;
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
    return CrackChatRoom.of(data);
  }

  /**
   * 스토리 정보를 가져옵니다.
   * @param {string} storyId
   * @returns {Promise<CrackStoryInfo | Error>} 정제된 데이터 혹은 오류
   */
  async of(storyId) {
    const result = await this.#network.authFetch(
      "GET",
      `https://crack-api.wrtn.ai/crack-api/stories/${storyId}`,
    );
    if (result instanceof Error) {
      return result;
    }
    if (!result.data) {
      return new Error("크랙 API에서 데이터 컨테이너를 반환하지 않았습니다.");
    }
    return CrackStoryInfo.of(result.data);
  }
}

class _CrackChatRoomApi {
  #generic;
  #user;
  #network;
  #cookie;
  #io;
  /**
   * @param {_CrackGenericUtil} generic
   * @param {_CrackUserApi} user
   * @param {_CrackNetworkApi} network
   * @param {_CrackCookieApi} cookie
   * @param {_SocketIoUtil} io
   */
  constructor(generic, user, network, cookie, io) {
    this.#generic = generic;
    this.#user = user;
    this.#network = network;
    this.#cookie = cookie;
    this.#io = io;
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
    return CrackChatRoom.of(data);
  }

  /**
   * 채팅 로그를 추출합니다.
   * **이 펑션은 항상 최신 메시지부터 오래된 메시지까지 역순으로 반환합니다.**
   * @generator
   * @param {string} chatId 채팅 로그를 가져올 채팅방 ID입니다.
   * @param {Object} [param] 옵션 파라미터
   * @param {number} [param.maxCount=-1] 최대로 가져올 메시지 개수. -1로 입력시, 모든 메시지를 가져옵니다.
   * @param {number} [param.delay=20] 각 요청마다 대기할 간격입니다. 이 옵션이 없는 경우, 크랙의 API 서버에서 레이트리밋을 반환할 가능성이 존재합니다.
   * @param {number} [param.itemPerPage=20] 각 요청마다 가져올 최대 페이지입니다. 특별한 상황이 아닌 경우, 기본 값 사용을 권장합니다. 20개를 초과할 경우, 크랙 API가 작동하지 않을 수 있습니다.
   * @yields {CrackChattingLog} 추출된 채팅 로그
   * @returns {AsyncGenerator<CrackChattingLog, void, void>} 생성된 제너레이터
   */
  async *iterateLogs(
    chatId,
    { maxCount = -1, delay = 20, itemPerPage = 20 } = {},
  ) {
    let amount = 0;
    let cursor = undefined;
    while (maxCount === -1 || amount < maxCount) {
      const nextUrl =
        cursor === undefined
          ? `https://contents-api.wrtn.ai/character-chat/v3/chats/${chatId}/messages?limit=${itemPerPage}`
          : `https://contents-api.wrtn.ai/character-chat/v3/chats/${chatId}/messages?limit=${itemPerPage}&cursor=${cursor}`;
      const result = await this.#network.authFetch("GET", nextUrl);
      if (result instanceof Error) {
        throw result;
      }

      for (let message of result.data.messages) {
        if ((message.content?.length ?? 0) === 0) continue;
        yield CrackChattingLog.of(message);
        if (maxCount !== -1 && ++amount >= maxCount) {
          break;
        }
      }
      if (result.data.nextCursor) {
        cursor = result.data.nextCursor;
      } else {
        break;
      }
      delay > 0 && (await new Promise((resolve) => setTimeout(resolve, delay)));
    }
  }
  /**
   * 채팅 로그를 추출합니다.
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
    for await (let log of this.iterateLogs(chatId, {
      maxCount: maxCount,
      delay: delay,
    })) {
      if (naturalOrder) {
        logs.unshift(log);
      } else {
        logs.push(log);
      }
    }
    return logs;
  }

  /**
   * 지정된 채팅의 마지막 메시지를 역할에 맞춰 찾아 가져옵니다.
   * @param {string} chatId
   * @returns {Promise<?CrackChattingLog | Error>}
   */
  async fetchLastMessage(chatId) {
    try {
      const next = (await this.iterateLogs(chatId, { maxCount: 1 }).next())
        .value;
      if (next) return next;
    } catch (error) {
      if (error instanceof Error) return error;
    }
    return null;
  }
  /**
   * 지정된 채팅의 마지막 메시지를 역할에 맞춰 찾아 가져옵니다.
   * @param {string} chatId
   * @param {string} requireRole
   * @returns {Promise<?CrackChattingLog | Error>}
   */
  async findLastMessageId(chatId, requireRole = "assistant") {
    try {
      for await (let item of this.iterateLogs(chatId)) {
        if (item.role === requireRole) {
          return item;
        }
      }
    } catch (error) {
      if (error instanceof Error) return error;
    }
    return null;
  }

  /**
   *
   * @param {string} chatId
   * @returns {Promise<?CrackChattingLog | Error>}
   */
  async findLastBotMessage(chatId) {
    return this.findLastMessageId(chatId, "assistant");
  }

  /**
   *
   * @param {string} chatId
   * @returns {Promise<?CrackChattingLog | Error>}
   */
  async findLastUserMessage(chatId) {
    return this.findLastMessageId(chatId, "user");
  }

  /**
   * 메시지 내용을 편집합니다.
   * @param {string} chatId 채팅방 ID
   * @param {string} messageId 메시지 ID
   * @param {string} contents 메시지 내용
   * @returns {Promise<true | Error>} 성공했을 경우 true, 혹은 발생한 오류
   */
  async editMessage(chatId, messageId, contents) {
    const result = await this.#network.authFetch(
      "PATCH",
      `https://contents-api.wrtn.ai/character-chat/v3/chats/${chatId}/messages/${messageId}`,
      {
        message: contents,
      },
    );
    if (result instanceof Error) {
      return result;
    }
    return true;
  }

  /**
   * 지정한 ID의 메시지 데이터를 가져옵니다.
   * @param {string} chatId 채팅방 ID
   * @param {string} messageId 메시지 ID
   * @returns {Promise<CrackChattingLog | Error>}
   */
  async getMessage(chatId, messageId) {
    const result = await this.#network.authFetch(
      "GET",
      `https://crack-api.wrtn.ai/crack-gen/v3/chats/${chatId}/messages/${messageId}`,
    );
    if (result instanceof Error) {
      return result;
    }
    return CrackChattingLog.of(result.data);
  }

  /**
   * 메시지를 삭제합니다.
   * @param {string} chatId 채팅방 ID
   * @param {string} messageId 메시지 ID
   * @returns {Promise<true | Error>} 성공했을 경우 true, 혹은 발생한 오류
   */
  async deleteMessage(chatId, messageId) {
    const result = await this.#network.authFetch(
      "DELETE",
      `https://crack-api.wrtn.ai/crack-gen/v3/chats/${chatId}/messages/${messageId}`,
    );
    if (result instanceof Error) {
      return result;
    }
    return true;
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
    return personaMap.get(chatData.chatProfileId ?? "--UNKNOWN--") ?? null;
  }

  /**
   * 채팅 모델을 변경합니다.
   * @param {string} chatId 채팅 ID
   * @param {string} modelId 모델 ID
   * @returns {Promise<true | Error>} 성공했을 경우 true, 혹은 오류
   */
  async changeChatModel(chatId, modelId) {
    const result = await this.#network.authFetch(
      "PATCH",
      `https://crack-api.wrtn.ai/crack-gen/v3/chats/${chatId}`,
      { chatModelId: modelId },
    );
    if (result instanceof Error) {
      return result;
    }
    return true;
  }

  /**
   * socket.io 프레임워크를 채팅방 소켓을 생성해 반환합니다.
   * 여러개의 메시지를 같은 방에 보내야 할 경우, 소켓 인스턴스를 활용하는 것이 권장됩니다.
   * 다량의 소켓은 요청 거부가 발생할 수 있습니다.
   * **이 펑션은 socket.io를 스크립트에 불러옵니다.**
   *
   *
   * @see {@link _SocketIoUtil.prepareIo()} socket.io 자동 임포트
   * @requires socket.io@>=4.8.1
   * @param {string} chatId 채팅방 ID
   *
   */
  async connect(chatId) {
    const socket = (await this.#io.prepareIo())(
      "https://contents-api.wrtn.ai/v3/chats",
      {
        reconnectionDelayMax: 1000,
        transports: ["websocket"],
        path: "/character-chat/socket.io",
        auth: {
          token: this.#cookie.getCookie("access_token"),
          refreshToken: this.#cookie.getCookie("refresh_token"),
          platform: "web",
        },
      },
    );
    await new Promise(async (resolve, reject) => {
      // @ts-ignore
      socket.emit("enter", { chatId: chatId }, async (response) => {
        if (response.result !== "success") {
          reject(new Error("socket.io 방 입장 감지에 실패하였습니다."));
          return;
        }
        resolve(undefined);
      });
    });
    return socket;
  }

  /**
   * socket.io 프레임워크를 사용해 메시지를 보냅니다.
   * **이 펑션은 socket.io를 스크립트에 불러옵니다. **
   *
   * @singleflow 이 태그가 있는 펑션은 동일한 펑션이 아니더라도 2개 이상의 펑션이 동시에 호출되어서는 안됩니다. 모든 결과가 도출된 후에 호출해야 동시성 문제가 발생하지 않습니다.
   * @see {@link _SocketIoUtil.prepareIo()} socket.io 자동 임포트
   * @requires socket.io@>=4.8.1
   * @param {string} chatId 채팅방 ID
   * @param {string} message 보낼 유저 메시지
   * @param {Object} [param] 옵션 파라미터
   * @param {?Object} [param.socket] 방 소켓. undefined일 경우, 새 방을 열고 보낸 후 소켓을 닫습니다.
   * @param {(userMessage: CrackChattingLog, botMessage: CrackChattingLog) => Promise<void> | void} [param.onMessageSent] 봇 메시지가 전송된 후에 트리거될 메시지 핸들러
   * @param {number} [param.timeout] 몇 ms 뒤에 요청을 실패로 간주할지 설정합니다.
   * @returns {Promise<Error | undefined>} 오류 혹은 undefined
   */
  async send(
    chatId,
    message,
    { socket = undefined, onMessageSent = undefined, timeout = 100_000 } = {},
  ) {
    try {
      const currentSocket = socket ?? (await this.connect(chatId));
      const socketCloser = () => {
        if (!socket) {
          try {
            // @ts-ignore
            currentSocket?.close();
          } catch (err) {}
        }
      };
      const lastMessage = await this.fetchLastMessage(chatId);
      if (lastMessage instanceof Error) {
        return lastMessage;
      }
      if (!lastMessage) {
        socketCloser();
        return new Error("불가능한 상태입니다: 첫 메시지가 존재하지 않습니다.");
      }
      const result = await this.#emitMessage(
        currentSocket,
        timeout,
        chatId,
        message,
        lastMessage,
        socketCloser,
        onMessageSent,
      );
      if (!result) {
        socketCloser();
        return new Error(
          "지정한 시간 안에 메시지 응답이 완료되지 않았습니다, 실패로 간주합니다.",
        );
      }
    } catch (error) {
      if (error instanceof Error) return error;
    }
    return undefined;
  }

  /**
   *
   * @param {any} currentSocket
   * @param {number} timeout
   * @param {string} chatId
   * @param {string} message
   * @param {CrackChattingLog} lastMessage
   * @param {() => void} socketCloser
   * @param {(userMessage: CrackChattingLog, botMessage: CrackChattingLog) => Promise<void> | void} [onMessageSent] 봇 메시지가 전송된 후에 트리거될 메시지 핸들러
   * @returns {Promise<boolean>} 성공 여부
   */
  async #emitMessage(
    currentSocket,
    timeout,
    chatId,
    message,
    lastMessage,
    socketCloser,
    onMessageSent,
  ) {
    return await new Promise(async (resolve, reject) => {
      let isResolved = false;
      const taskId = setTimeout(() => {
        if (!isResolved) {
          socketCloser();
          isResolved = true;
          resolve(false);
        }
      }, timeout);
      try {
        currentSocket.emit(
          "send",
          {
            chatId: chatId,
            message: message,
            prevMessageId: lastMessage.id,
          },
          // @ts-ignore
          async (sendResponse) => {
            if (sendResponse.result === "success") {
              // @ts-ignore
              currentSocket.once(
                "characterMessageGenerated",
                // @ts-ignore
                async (response) => {
                  socketCloser();
                  if (!isResolved) {
                    isResolved = true;
                    clearTimeout(taskId);
                  }
                  try {
                    await this.#handleResponse(chatId, onMessageSent);
                  } finally {
                    resolve(true);
                  }
                },
              );
            } else {
              socketCloser();
              reject(new Error("socket.io 메시지 전송에 실패하였습니다."));
            }
          },
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * socket.io 프레임워크를 사용해 메시지를 보냅니다.
   * **이 펑션은 socket.io를 스크립트에 불러옵니다. **
   *
   * @singleflow 이 태그가 있는 펑션은 동일한 펑션이 아니더라도 2개 이상의 펑션이 동시에 호출되어서는 안됩니다. 모든 결과가 도출된 후에 호출해야 동시성 문제가 발생하지 않습니다.
   * @see {@link _SocketIoUtil.prepareIo()} socket.io 자동 임포트
   * @requires socket.io@>=4.8.1
   * @param {string} chatId 채팅 ID
   * @param {string} message 유저 메시지
   * @param {Object} [param] 옵션 파라미터
   * @param {?Object} [param.socket] 방 소켓. undefined일 경우, 새 방을 열고 보낸 후 소켓을 닫습니다.
   * @param {number} [param.timeout]  몇 ms 뒤에 요청을 실패로 간주할지 설정합니다.
   * @param {(userMessage: CrackChattingLog) => Promise<void> | void} [param.onMessageSent] 봇 메시지가 삭제된 후에 트리거될 메시지 핸들러
   */
  async sendUserMessage(
    chatId,
    message,
    { socket = undefined, timeout = 100_000, onMessageSent = undefined } = {},
  ) {
    return await this.send(chatId, message, {
      socket: socket,
      timeout: timeout,
      onMessageSent: async (user, bot) => {
        await this.deleteMessage(chatId, bot.id);
        const result = onMessageSent?.(user);
        if (result instanceof Promise) {
          await result;
        }
      },
    });
  }

  /**
   * socket.io 프레임워크를 사용해 메시지를 보냅니다.
   * **이 펑션은 socket.io를 스크립트에 불러옵니다. **
   *
   * @singleflow 이 태그가 있는 펑션은 동일한 펑션이 아니더라도 2개 이상의 펑션이 동시에 호출되어서는 안됩니다. 모든 결과가 도출된 후에 호출해야 동시성 문제가 발생하지 않습니다.
   * @see {@link _SocketIoUtil.prepareIo()} socket.io 자동 임포트
   * @requires socket.io@>=4.8.1
   * @param {string} chatId 채팅 ID
   * @param {string} message 유저 메시지
   * @param {Object} [param] 옵션 파라미터
   * @param {?Object} [param.socket] 방 소켓. undefined일 경우, 새 방을 열고 보낸 후 소켓을 닫습니다.
   * @param {number} [param.timeout]  몇 ms 뒤에 요청을 실패로 간주할지 설정합니다.
   * @param {(botMessage: CrackChattingLog) => Promise<void> | void} [param.onMessageSent] 유저 메시지가 삭제된 후에 트리거될 메시지 핸들러
   */
  async sendBotMessage(
    chatId,
    message,
    { socket = undefined, timeout = 100_000, onMessageSent = undefined } = {},
  ) {
    return await this.send(chatId, message, {
      socket: socket,
      timeout: timeout,
      onMessageSent: async (user, bot) => {
        await this.deleteMessage(chatId, user.id);
        const result = onMessageSent?.(bot);
        if (result instanceof Promise) {
          await result;
        }
      },
    });
  }

  /**
   * socket.io를 통한 메시지 응답을 처리합니다.
   * @param {string} chatId 채팅방 ID
   * @param {(userMessage: CrackChattingLog, botMessage: CrackChattingLog) => Promise<void> | void} [onMessageSent] 봇 메시지가 전송된 후에 트리거될 메시지 핸들러
   */
  async #handleResponse(chatId, onMessageSent) {
    if (onMessageSent) {
      const message = await this.extractLogs(chatId, {
        maxCount: 2,
        naturalOrder: true,
      });
      if (message instanceof Error) {
        throw message;
      }
      const result = onMessageSent(message[0], message[1]);
      if (result instanceof Promise) await result;
    }
  }
}

class _CrackNotificationApi {
  /** @property {_CrackNetworkApi} */
  #network;
  /**
   * @param {_CrackNetworkApi} network
   */
  constructor(network) {
    this.#network = network;
  }

  /**
   * 현재 계정의 알림을 받아옵니다.
   * **알람은 기본값일 경우 최신부터 오래된 순서로 반환됩니다.**
   * @generator
   * @param {Object} [param] 옵션 파라미터
   * @param {number} [param.maxCount=-1] 최대로 가져올 알림 개수. -1로 입력시, 모든 알림을 가져옵니다.
   * @param {number} [param.delay=20] 각 요청마다 대기할 간격입니다. 이 옵션이 없는 경우, 크랙의 API 서버에서 레이트리밋을 반환할 가능성이 존재합니다.
   * @param {number} [param.itemPerPage=20] 각 요청마다 가져올 최대 페이지입니다. 특별한 상황이 아닌 경우, 기본 값 사용을 권장합니다. 20개를 초과할 경우, 크랙 API가 작동하지 않을 수 있습니다.
   * @yields {CrackNotification} 추출된 알림
   * @returns {AsyncGenerator<CrackNotification, void, void>} 생성된 제너레이터
   */
  async *iterator({ maxCount = -1, delay = 20, itemPerPage = 20 } = {}) {
    let amount = 0;
    let page = 1;
    while (maxCount === -1 || amount < maxCount) {
      const nextUrl = `https://crack-api.wrtn.ai/crack-api/alarm?page=${page++}&limit=${itemPerPage}`;
      const result = await this.#network.authFetch("GET", nextUrl);
      if (result instanceof Error) {
        throw result;
      }

      for (let message of result.data.alarms) {
        if ((message.content?.length ?? 0) === 0) continue;
        yield CrackNotification.of(message);
        if (maxCount !== -1 && ++amount >= maxCount) {
          break;
        }
      }
      if (!result.hasNext) {
        break;
      }
      delay > 0 && (await new Promise((resolve) => setTimeout(resolve, delay)));
    }
  }

  /**
   * 알람 목록을 추출합니다.
   * @param {Object} [param] 옵션 파라미터
   * @param {number} [param.maxCount=-1] 최대로 가져올 알림 개수. -1로 입력시, 모든 알림을 가져옵니다.
   * @param {number} [param.delay=20] 각 요청마다 대기할 간격입니다. 이 옵션이 없는 경우, 크랙의 API 서버에서 레이트리밋을 반환할 가능성이 존재합니다.
   * @param {number} [param.itemPerPage=20] 각 요청마다 가져올 최대 페이지입니다. 특별한 상황이 아닌 경우, 기본 값 사용을 권장합니다. 20개를 초과할 경우, 크랙 API가 작동하지 않을 수 있습니다.
   * @param {boolean} [param.naturalOrder=false] 어느 순서로 알림을 가져올지의 여부입니다. true일 경우, 시간 흐름대로 반환합니다(오래된 알림 -> 최신 알림). false일 경우, 역순으로 반환합니다(최신 메시지 -> 오래된 메시지).
   * @returns {Promise<CrackNotification[] | Error>} 채팅 로그 목록 혹은 오류
   */
  async current({ maxCount = -1, delay = 20, naturalOrder = false } = {}) {
    /** @type {CrackNotification[]} */
    const notifications = [];
    for await (let notification of this.iterator({
      maxCount: maxCount,
      delay: delay,
    })) {
      if (naturalOrder) {
        notifications.unshift(notification);
      } else {
        notifications.push(notification);
      }
    }
    return notifications;
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

/**
 * socket.io 유틸리티
 */
class _SocketIoUtil {
  /**
   * @type {undefined | any}
   */
  #socketIo;

  async enable() {
    if (this.#socketIo) return;
    const { io } = await import(
      // @ts-ignore
      "https://cdn.socket.io/4.8.1/socket.io.esm.min.js"
    );
    this.#socketIo = io;
  }

  async prepareIo() {
    if (!this.#socketIo) await this.enable();
    return this.io();
  }

  /**
   * Socket.IO 인스턴스를 반환합니다.
   */
  io() {
    if (this.#socketIo) {
      return this.#socketIo;
    }
    throw new Error("socket.io not prepared yet");
  }
}

class CrackUtil {
  static #io = new _SocketIoUtil();
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
    this.#cookie,
    this.#io,
  );
  static #story = new _CrackStoryApi(this.#generic, this.#user, this.#network);
  static #notification = new _CrackNotificationApi(this.#network); 
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
   * 크랙 알림 유틸리티를 반환합니다.
   * @returns {_CrackNotificationApi} 알림 유틸리티
   */
  static notification() {
    return this.#notification;
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
