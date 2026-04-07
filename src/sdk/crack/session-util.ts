import { FutureResult, success } from "../../utils/flow-handler";
import { CrackNetworkApi } from "./network-util";



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
} as const;