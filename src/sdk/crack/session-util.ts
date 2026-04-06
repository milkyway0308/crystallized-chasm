import { FutureResult, success } from "../../utils/flow-handler";
import { CrackNetworkApi } from "./network-util";

/**
 * 크랙 채팅 로그 데이터입니다.
 */
class CrackChattingLog {
  /** 메시지 내부 ID  */
  id: string;
  /** 유저 ID */
  userId: string;
  /** 메시지 외부 ID. 이 파라미터는 일반적으로 사용되지 않습니다. */
  messageId: string;
  /** 메시지 전송 주체 (user, assistant..) */
  role: string;
  /** 메시지 컨텐츠 */
  content: string;
  /** 사용 모델 ID */
  model: string;
  /** 턴 ID */
  turnId: string;
  /** 메시지 상태 (end = 정상 종료) */
  status: string;
  /** 추천 목록 */
  recommendList: string[];
  /** 사용 크래커 모델 */
  crackerModel: string;
  /** 사용 크래커 모델 ID*/
  chatModelId: string;
  /** 계속 생성 가능 여부 */
  isContinuallyGeneratable: boolean;
  /** "계속 생성" 기능에 의해 생성되었는지의 여부 */
  isContinued: boolean;
  /** 상황 이미지 목록 */
  situationImages: string[];
  /** 스탯 목록 */
  parameterSnapshots: string[];
  /** 프롤로그 여부 */
  isPrologue: boolean;
  /** 리롤 여부 */
  reroll: boolean;
  /**
   * @param id 메시지 내부 ID
   * @param userId 유저 ID
   * @param messageId 메시지 외부 ID. 이 파라미터는 일반적으로 사용되지 않습니다.
   * @param role 메시지 전송 주체 (user, assistant..)
   * @param content 메시지 컨텐츠
   * @param model 사용 모델 ID
   * @param turnId 턴 ID
   * @param status 메시지 상태 (end = 정상 종료)
   * @param recommendList 추천 목록
   * @param crackerModel 사용 크래커 모델
   * @param chatModelId 사용 크래커 모델 ID
   * @param isContinuallyGeneratable 계속 생성 가능 여부
   * @param isContinued "계속 생성" 기능에 의해 생성되었는지의 여부
   * @param situationImages 상황 이미지 목록
   * @param parameterSnapshots 스탯 목록
   * @param isPrologue 프롤로그 여부
   * @param reroll 리롤 여부
   */
  constructor(
    id: string,
    userId: string,
    messageId: string,
    role: string,
    content: string,
    model: string,
    turnId: string,
    status: string,
    recommendList: string[],
    crackerModel: string,
    chatModelId: string,
    isContinuallyGeneratable: boolean,
    isContinued: boolean,
    situationImages: string[],
    parameterSnapshots: string[],
    isPrologue: boolean,
    reroll: boolean,
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
    return new CrackSimplifiedChattingLog(this.role, this.content, this.situationImages, this.parameterSnapshots);
  }

  /**
   * JSON 스키마에서 데이터를 정제합니다.
   * @param {any} container
   * @returns {CrackChattingLog} 정제된 데이터
   */
  static of(container: any): CrackChattingLog {
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
  /** 메시지 전송 주체 (user, assistant..) */
  role: string;
  /**  메시지 내용 */
  content: string;
  /** 상황 이미지 URL 목록 */
  situationImages: string[];
  /** 능력치 목록 */
  parameterSnapshots: any;
  /**
   * @param role 메시지 전송 주체 (user, assistant..)
   * @param content 메시지 내용
   * @param situationImages 상황 이미지 URL 목록
   * @param parameterSnapshots 능력치 목록
   */
  constructor(role: string, content: string, situationImages: string[], parameterSnapshots: any) {
    this.role = role;
    this.content = content;
    this.situationImages = situationImages;
    this.parameterSnapshots = parameterSnapshots;
  }
}
//   /**
//    * 지정한 채팅의 현재 데이터를 가져옵니다.
//    * @param {string} chatId 채팅방 ID
//    * @returns {Promise<CrackChatRoom | Error>}
//    */
//   async function roomData(chatId) {
//     const result = await this.#network.authFetch("GET", `https://crack-api.wrtn.ai/crack-gen/v3/chats/${chatId}`);
//     if (result instanceof Error) {
//       return result;
//     }
//     const data = result.data;
//     if (!data) {
//       return new Error("크랙 API에서 예상치 못한 스키마가 반환되었습니다. 이는 일시적 오류일 수 있지만, 크랙 API 변경이 원인일 수 있습니다.");
//     }
//     return CrackChatRoom.of(data);
//   }

//   /**
//    * 채팅 로그를 추출합니다.
//    * **이 펑션은 항상 최신 메시지부터 오래된 메시지까지 역순으로 반환합니다.**
//    * @generator
//    * @param {string} chatId 채팅 로그를 가져올 채팅방 ID입니다.
//    * @param {Object} [param] 옵션 파라미터
//    * @param {number} [param.maxCount=-1] 최대로 가져올 메시지 개수. -1로 입력시, 모든 메시지를 가져옵니다.
//    * @param {number} [param.delay=20] 각 요청마다 대기할 간격입니다. 이 옵션이 없는 경우, 크랙의 API 서버에서 레이트리밋을 반환할 가능성이 존재합니다.
//    * @param {number} [param.itemPerPage=20] 각 요청마다 가져올 최대 페이지입니다. 특별한 상황이 아닌 경우, 기본 값 사용을 권장합니다. 20개를 초과할 경우, 크랙 API가 작동하지 않을 수 있습니다.
//    * @yields {CrackChattingLog} 추출된 채팅 로그
//    * @returns {AsyncGenerator<CrackChattingLog, void, void>} 생성된 제너레이터
//    */
//   async function *iterateLogs(chatId, { maxCount = -1, delay = 20, itemPerPage = 20 } = {}) {
//     let amount = 0;
//     let cursor = undefined;
//     while (maxCount === -1 || amount < maxCount) {
//       const nextUrl = cursor === undefined ? `https://contents-api.wrtn.ai/character-chat/v3/chats/${chatId}/messages?limit=${itemPerPage}` : `https://contents-api.wrtn.ai/character-chat/v3/chats/${chatId}/messages?limit=${itemPerPage}&cursor=${cursor}`;
//       const result = await this.#network.authFetch("GET", nextUrl);
//       if (result instanceof Error) {
//         throw result;
//       }

//       for (let message of result.data.messages) {
//         if ((message.content?.length ?? 0) === 0) continue;
//         yield CrackChattingLog.of(message);
//         if (maxCount !== -1 && ++amount >= maxCount) {
//           break;
//         }
//       }
//       if (result.data.nextCursor) {
//         cursor = result.data.nextCursor;
//       } else {
//         break;
//       }
//       delay > 0 && (await new Promise((resolve) => setTimeout(resolve, delay)));
//     }
//   }
//   /**
//    * 채팅 로그를 추출합니다.
//    * @param {string} chatId 채팅 로그를 가져올 채팅방 ID입니다.
//    * @param {Object} [param] 옵션 파라미터
//    * @param {number} [param.maxCount] 최대로 가져올 메시지 개수. -1로 입력시, 모든 메시지를 가져옵니다.
//    * @param {number} [param.delay] 각 요청마다 대기할 간격입니다. 이 옵션이 없는 경우, 크랙의 API 서버에서 레이트리밋을 반환할 가능성이 존재합니다.
//    * @param {boolean} [param.naturalOrder] 어느 순서로 메시지를 가져올지의 여부입니다. true일 경우, 시간 흐름대로 반환합니다(오래된 메시지 -> 최신 메시지). false일 경우, 역순으로 반환합니다(최신 메시지 -> 오래된 메시지).
//    * @returns {Promise<CrackChattingLog[] | Error>} 채팅 로그 목록 혹은 오류
//    */
//   async function extractLogs(chatId, { maxCount = -1, delay = 20, naturalOrder = true } = {}) {
//     /** @type {CrackChattingLog[]} */
//     const logs = [];
//     for await (let log of this.iterateLogs(chatId, {
//       maxCount: maxCount,
//       delay: delay,
//     })) {
//       if (naturalOrder) {
//         logs.unshift(log);
//       } else {
//         logs.push(log);
//       }
//     }
//     return logs;
//   }

//   /**
//    * 지정된 채팅의 마지막 메시지를 역할에 맞춰 찾아 가져옵니다.
//    * @param {string} chatId
//    * @returns {Promise<?CrackChattingLog | Error>}
//    */
//   async function fetchLastMessage(chatId) {
//     try {
//       const next = (await this.iterateLogs(chatId, { maxCount: 1 }).next()).value;
//       if (next) return next;
//     } catch (error) {
//       if (error instanceof Error) return error;
//     }
//     return null;
//   }
//   /**
//    * 지정된 채팅의 마지막 메시지를 역할에 맞춰 찾아 가져옵니다.
//    * @param {string} chatId
//    * @param {string} requireRole
//    * @returns {Promise<?CrackChattingLog | Error>}
//    */
//   async function findLastMessageId(chatId, requireRole = "assistant") {
//     try {
//       for await (let item of this.iterateLogs(chatId)) {
//         if (item.role === requireRole) {
//           return item;
//         }
//       }
//     } catch (error) {
//       if (error instanceof Error) return error;
//     }
//     return null;
//   }

//   /**
//    *
//    * @param {string} chatId
//    * @returns {Promise<?CrackChattingLog | Error>}
//    */
//   async function findLastBotMessage(chatId) {
//     return this.findLastMessageId(chatId, "assistant");
//   }

//   /**
//    *
//    * @param {string} chatId
//    * @returns {Promise<?CrackChattingLog | Error>}
//    */
//   async function findLastUserMessage(chatId) {
//     return this.findLastMessageId(chatId, "user");
//   }

//   /**
//    * 메시지 내용을 편집합니다.
//    * @param {string} chatId 채팅방 ID
//    * @param {string} messageId 메시지 ID
//    * @param {string} contents 메시지 내용
//    * @returns {Promise<true | Error>} 성공했을 경우 true, 혹은 발생한 오류
//    */
//   async function editMessage(chatId, messageId, contents) {
//     const result = await this.#network.authFetch("PATCH", `https://contents-api.wrtn.ai/character-chat/v3/chats/${chatId}/messages/${messageId}`, {
//       message: contents,
//     });
//     if (result instanceof Error) {
//       return result;
//     }
//     return true;
//   }

/**
 * 지정한 ID의 메시지 데이터를 가져옵니다.
 * @param chatId 채팅방 ID
 * @param messageId 메시지 ID
 */
async function getMessage(chatId: string, messageId: string): FutureResult<CrackChattingLog> {
  const result = await CrackNetworkApi.authFetch("GET", `https://crack-api.wrtn.ai/crack-gen/v3/chats/${chatId}/messages/${messageId}`);
  if (!result.ok) return result;
  return success(CrackChattingLog.of(result.data));
}

//   /**
//    * 메시지를 삭제합니다.
//    * @param {string} chatId 채팅방 ID
//    * @param {string} messageId 메시지 ID
//    * @returns {Promise<true | Error>} 성공했을 경우 true, 혹은 발생한 오류
//    */
//   async function deleteMessage(chatId, messageId) {
//     const result = await this.#network.authFetch("DELETE", `https://crack-api.wrtn.ai/crack-gen/v3/chats/${chatId}/messages/${messageId}`);
//     if (result instanceof Error) {
//       return result;
//     }
//     return true;
//   }

//   /**
//    * 지정한 채팅의 현재 페르소나 데이터를 가져옵니다.
//    * @param {string} chatId
//    * @returns {Promise<?CrackPersona | Error>}
//    */
//   async function currentPersona(chatId) {
//     const chatData = await this.roomData(chatId);
//     if (chatData instanceof Error) {
//       return chatData;
//     }
//     const personaMap = await this.#user.currentPersonaMap();
//     if (personaMap instanceof Error) {
//       return personaMap;
//     }
//     return personaMap.get(chatData.chatProfileId ?? "--UNKNOWN--") ?? null;
//   }

//   /**
//    * 채팅 모델을 변경합니다.
//    * @param {string} chatId 채팅 ID
//    * @param {string} modelId 모델 ID
//    * @returns {Promise<true | Error>} 성공했을 경우 true, 혹은 오류
//    */
//   async function changeChatModel(chatId, modelId) {
//     const result = await this.#network.authFetch("PATCH", `https://crack-api.wrtn.ai/crack-gen/v3/chats/${chatId}`, { chatModelId: modelId });
//     if (result instanceof Error) {
//       return result;
//     }
//     return true;
//   }

//   /**
//    * socket.io 프레임워크를 채팅방 소켓을 생성해 반환합니다.
//    * 여러개의 메시지를 같은 방에 보내야 할 경우, 소켓 인스턴스를 활용하는 것이 권장됩니다.
//    * 다량의 소켓은 요청 거부가 발생할 수 있습니다.
//    * **이 펑션은 socket.io를 스크립트에 불러옵니다.**
//    *
//    *
//    * @see {@link _SocketIoUtil.prepareIo()} socket.io 자동 임포트
//    * @requires socket.io@>=4.8.1
//    * @param {string} chatId 채팅방 ID
//    *
//    */
//   async function connect(chatId) {
//     const socket = (await this.#io.prepareIo())("https://contents-api.wrtn.ai/v3/chats", {
//       reconnectionDelayMax: 1000,
//       transports: ["websocket"],
//       path: "/character-chat/socket.io",
//       auth: {
//         token: this.#cookie.getCookie("access_token"),
//         refreshToken: this.#cookie.getCookie("refresh_token"),
//         platform: "web",
//       },
//     });
//     await new Promise(async (resolve, reject) => {
//       // @ts-ignore
//       socket.emit("enter", { chatId: chatId }, async (response) => {
//         if (response.result !== "success") {
//           reject(new Error("socket.io 방 입장 감지에 실패하였습니다."));
//           return;
//         }
//         resolve(undefined);
//       });
//     });
//     return socket;
//   }

//   /**
//    * socket.io 프레임워크를 사용해 메시지를 보냅니다.
//    * **이 펑션은 socket.io를 스크립트에 불러옵니다. **
//    *
//    * @singleflow 이 태그가 있는 펑션은 동일한 펑션이 아니더라도 2개 이상의 펑션이 동시에 호출되어서는 안됩니다. 모든 결과가 도출된 후에 호출해야 동시성 문제가 발생하지 않습니다.
//    * @see {@link _SocketIoUtil.prepareIo()} socket.io 자동 임포트
//    * @requires socket.io@>=4.8.1
//    * @param {string} chatId 채팅방 ID
//    * @param {string} message 보낼 유저 메시지
//    * @param {Object} [param] 옵션 파라미터
//    * @param {?Object} [param.socket] 방 소켓. undefined일 경우, 새 방을 열고 보낸 후 소켓을 닫습니다.
//    * @param {(userMessage: CrackChattingLog, botMessage: CrackChattingLog) => Promise<void> | void} [param.onMessageSent] 봇 메시지가 전송된 후에 트리거될 메시지 핸들러
//    * @param {number} [param.timeout] 몇 ms 뒤에 요청을 실패로 간주할지 설정합니다.
//    * @returns {Promise<Error | undefined>} 오류 혹은 undefined
//    */
//   async function send(chatId, message, { socket = undefined, onMessageSent = undefined, timeout = 100_000 } = {}) {
//     try {
//       const currentSocket = socket ?? (await this.connect(chatId));
//       const socketCloser = () => {
//         if (!socket) {
//           try {
//             // @ts-ignore
//             currentSocket?.close();
//           } catch (err) {}
//         }
//       };
//       const lastMessage = await this.fetchLastMessage(chatId);
//       if (lastMessage instanceof Error) {
//         return lastMessage;
//       }
//       if (!lastMessage) {
//         socketCloser();
//         return new Error("불가능한 상태입니다: 첫 메시지가 존재하지 않습니다.");
//       }
//       const result = await this.#emitMessage(currentSocket, timeout, chatId, message, lastMessage, socketCloser, onMessageSent);
//       if (!result) {
//         socketCloser();
//         return new Error("지정한 시간 안에 메시지 응답이 완료되지 않았습니다, 실패로 간주합니다.");
//       }
//     } catch (error) {
//       if (error instanceof Error) return error;
//     }
//     return undefined;
//   }

//   /**
//    *
//    * @param {any} currentSocket
//    * @param {number} timeout
//    * @param {string} chatId
//    * @param {string} message
//    * @param {CrackChattingLog} lastMessage
//    * @param {() => void} socketCloser
//    * @param {(userMessage: CrackChattingLog, botMessage: CrackChattingLog) => Promise<void> | void} [onMessageSent] 봇 메시지가 전송된 후에 트리거될 메시지 핸들러
//    * @returns {Promise<boolean>} 성공 여부
//    */
//   async function #emitMessage(currentSocket, timeout, chatId, message, lastMessage, socketCloser, onMessageSent) {
//     return await new Promise(async (resolve, reject) => {
//       let isResolved = false;
//       const taskId = setTimeout(() => {
//         if (!isResolved) {
//           socketCloser();
//           isResolved = true;
//           resolve(false);
//         }
//       }, timeout);
//       try {
//         currentSocket.emit(
//           "send",
//           {
//             chatId: chatId,
//             message: message,
//             prevMessageId: lastMessage.id,
//           },
//           // @ts-ignore
//           async (sendResponse) => {
//             if (sendResponse.result === "success") {
//               // @ts-ignore
//               currentSocket.once(
//                 "characterMessageGenerated",
//                 // @ts-ignore
//                 async (response) => {
//                   socketCloser();
//                   if (!isResolved) {
//                     isResolved = true;
//                     clearTimeout(taskId);
//                   }
//                   try {
//                     await this.#handleResponse(chatId, onMessageSent);
//                   } finally {
//                     resolve(true);
//                   }
//                 },
//               );
//             } else {
//               socketCloser();
//               reject(new Error("socket.io 메시지 전송에 실패하였습니다."));
//             }
//           },
//         );
//       } catch (err) {
//         reject(err);
//       }
//     });
//   }

//   /**
//    * socket.io 프레임워크를 사용해 메시지를 보냅니다.
//    * **이 펑션은 socket.io를 스크립트에 불러옵니다. **
//    *
//    * @singleflow 이 태그가 있는 펑션은 동일한 펑션이 아니더라도 2개 이상의 펑션이 동시에 호출되어서는 안됩니다. 모든 결과가 도출된 후에 호출해야 동시성 문제가 발생하지 않습니다.
//    * @see {@link _SocketIoUtil.prepareIo()} socket.io 자동 임포트
//    * @requires socket.io@>=4.8.1
//    * @param {string} chatId 채팅 ID
//    * @param {string} message 유저 메시지
//    * @param {Object} [param] 옵션 파라미터
//    * @param {?Object} [param.socket] 방 소켓. undefined일 경우, 새 방을 열고 보낸 후 소켓을 닫습니다.
//    * @param {number} [param.timeout]  몇 ms 뒤에 요청을 실패로 간주할지 설정합니다.
//    * @param {(userMessage: CrackChattingLog) => Promise<void> | void} [param.onMessageSent] 봇 메시지가 삭제된 후에 트리거될 메시지 핸들러
//    */
//   async function sendUserMessage(chatId, message, { socket = undefined, timeout = 100_000, onMessageSent = undefined } = {}) {
//     return await this.send(chatId, message, {
//       socket: socket,
//       timeout: timeout,
//       onMessageSent: async (user, bot) => {
//         await this.deleteMessage(chatId, bot.id);
//         const result = onMessageSent?.(user);
//         if (result instanceof Promise) {
//           await result;
//         }
//       },
//     });
//   }

//   /**
//    * socket.io 프레임워크를 사용해 메시지를 보냅니다.
//    * **이 펑션은 socket.io를 스크립트에 불러옵니다. **
//    *
//    * @singleflow 이 태그가 있는 펑션은 동일한 펑션이 아니더라도 2개 이상의 펑션이 동시에 호출되어서는 안됩니다. 모든 결과가 도출된 후에 호출해야 동시성 문제가 발생하지 않습니다.
//    * @see {@link _SocketIoUtil.prepareIo()} socket.io 자동 임포트
//    * @requires socket.io@>=4.8.1
//    * @param {string} chatId 채팅 ID
//    * @param {string} message 유저 메시지
//    * @param {Object} [param] 옵션 파라미터
//    * @param {?Object} [param.socket] 방 소켓. undefined일 경우, 새 방을 열고 보낸 후 소켓을 닫습니다.
//    * @param {number} [param.timeout]  몇 ms 뒤에 요청을 실패로 간주할지 설정합니다.
//    * @param {(botMessage: CrackChattingLog) => Promise<void> | void} [param.onMessageSent] 유저 메시지가 삭제된 후에 트리거될 메시지 핸들러
//    */
//   async function sendBotMessage(chatId, message, { socket = undefined, timeout = 100_000, onMessageSent = undefined } = {}) {
//     return await this.send(chatId, message, {
//       socket: socket,
//       timeout: timeout,
//       onMessageSent: async (user, bot) => {
//         await this.deleteMessage(chatId, user.id);
//         const result = onMessageSent?.(bot);
//         if (result instanceof Promise) {
//           await result;
//         }
//       },
//     });
//   }

//   /**
//    * socket.io를 통한 메시지 응답을 처리합니다.
//    * @param {string} chatId 채팅방 ID
//    * @param {(userMessage: CrackChattingLog, botMessage: CrackChattingLog) => Promise<void> | void} [onMessageSent] 봇 메시지가 전송된 후에 트리거될 메시지 핸들러
//    */
//   async function #handleResponse(chatId, onMessageSent) {
//     if (onMessageSent) {
//       const message = await this.extractLogs(chatId, {
//         maxCount: 2,
//         naturalOrder: true,
//       });
//       if (message instanceof Error) {
//         throw message;
//       }
//       const result = onMessageSent(message[0], message[1]);
//       if (result instanceof Promise) await result;
//     }
//   }

export const CrackSessionApi = {
    getMessage
} as const;