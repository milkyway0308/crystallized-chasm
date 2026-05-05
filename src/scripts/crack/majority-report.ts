import { CRACK_VERSION_RULE } from "../../constants/script-constants";
import { CrackSdk } from "../../sdk/crack-sdk";
import { DelayUtil } from "../../utils/delay-util";
import { BrowserInitUtil } from "../../utils/init-util";
import { readonlyLazy } from "../../utils/lazy-util";
import { NodeLocator } from "../../utils/node-locator-util";
import { NodeUtil } from "../../utils/node-util";
import { ObserveUtil } from "../../utils/observe-util";
import { ScriptMetaUtil } from "../../utils/script-meta-util";
import SCRIPT_STYLE from "./css/majority-report.scss?inline";
import CLOUD_SVG from "./svg/cloud.svg?raw";

import { FileUtil } from "../../utils/file-utils";
import { ExpandedVoid, Nullable, Undeclarable } from "../../utils/generic-types";

import * as ort from "onnxruntime-web";
import { fail, FutureResult, Result, success } from "../../utils/flow-handler";

export const scriptMeta = ScriptMetaUtil.construct("crack", "majority-report.user.js", undefined, (meta) => {
  meta.name = "Chasm Crystallized Majority-Report (결정화 캐즘 묶음보고서)";
  meta.version = "CRCK-MRPT-v1.2.1" satisfies CRACK_VERSION_RULE;
  meta.author = "milkyway0308";
  meta.description = "이미지 감정 분석 및 이미지 업로드 간편화. 이 기능은 결정화 캐즘 오리지널 패치입니다.";
});

// ==============================================================
//                     AI 추론 관련 데이터 클래스
// ==============================================================
type OrtSessionRecord = {
  yolo: ort.InferenceSession;
  classifier: ort.InferenceSession;
};

class ImageDimension {
  constructor(
    public readonly width: number,
    public readonly height: number,
  ) {}
}
class YoloConfig {
  constructor(
    public readonly ratio: number,
    public readonly origin: ImageDimension,
    public readonly modified: ImageDimension,
    public readonly pad: ImageDimension,
    public readonly tensor: ort.Tensor,
  ) {}
}

class YoloBox {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly width: number,
    public readonly height: number,
    public readonly confidence: number,
  ) {}
}

class YoloResult {
  constructor(
    public readonly config: YoloConfig,
    public readonly bestBox: YoloBox,
  ) {}
}

class SetIdPairs {
  constructor(
    public readonly id: string,
    public readonly setId: string,
  ) {}
}

class IdPairs {
  constructor(
    public readonly set: SetIdPairs,
    public readonly id: string,
    public readonly url: string,
  ) {}
}

class EmotionDetectResult {
  constructor(
    public readonly file: File,
    public readonly emotion: string,
  ) {}
}

class FileUploadParam {
  constructor(
    public readonly storyId: string,
    public readonly setIds: SetIdPairs[],
    public readonly file: File,
    public readonly character: string,
    public readonly category: Nullable<string>,
  ) {}

  withCategory(category: string): FileUploadParam {
    return new FileUploadParam(this.storyId, this.setIds, this.file, this.character, category);
  }
}

class FileUploadResult {
  public readonly resultId = crypto.randomUUID();
  constructor(
    public readonly file: File,
    public readonly failureCause: Nullable<Error>,
  ) {}
}
// ==============================================================
//                          일반 상수
// ==============================================================
const parser = readonlyLazy(() => new DOMParser());

// ==============================================================
//                        크랙 데이터 인젝션
// ==============================================================

function extractCurrentSetIds(): Undeclarable<SetIdPairs[]> {
  const dropzone = NodeLocator.get("button.flex.min-h-\\[280px\\]") || document.querySelector("#root");
  if (!dropzone) return undefined;
  const former = CrackSdk.react().extractReactFormer(dropzone);
  if (!former.ok) return undefined;
  const startingSets = former.value.getValues("startingSets") || [];
  return startingSets.map((set: any) => new SetIdPairs(set.id, set.baseSetId));
}

function injectImage(setId: string, expectedId: string, category: string, situation: string, imageUrl: string): Undeclarable<string> {
  const dropzone = NodeLocator.get("button.flex.min-h-\\[280px\\]") || document.querySelector("#root");
  if (!dropzone) return "대상 업로드 컴포넌트를 찾을 수 없습니다.";
  const former = CrackSdk.react().extractReactFormer(dropzone);
  if (!former.ok) return "컴포넌트 추출에 실패하였습니다.";

  const startingSets = former.value.getValues("startingSets") || [];

  startingSets.forEach((set: any, index: number) => {
    let matrix = set.imageMatrix || { categories: [], situations: [] };
    let isMatrixUpdated = false;

    if (!matrix.categories.includes(category)) {
      matrix.categories.push(category);
      isMatrixUpdated = true;
    }

    if (!matrix.situations.includes(situation)) {
      matrix.situations.push(situation);
      isMatrixUpdated = true;
    }

    if (isMatrixUpdated) {
      former.value.setValue(`startingSets.${index}.imageMatrix`, { categories: matrix.categories, situations: matrix.situations }, { shouldDirty: true });
    }
  });

  const newImageEntry = {
    id: expectedId,
    category: category,
    situation: situation,
    imageUrl: imageUrl,
    keyword: "",
    startingSetId: [setId],
    isLoading: false,
    collapsed: true,
  };
  const currentImages: any[] = former.value.getValues("_situationImages") || [];
  former.value.setValue("_situationImages", [...currentImages.filter((it) => it.category !== category || it.situation !== situation), newImageEntry], { shouldDirty: true });
  return undefined;
}

// ==============================================================
//                        컴포넌트 빌더
// ==============================================================

function buildCrackStyleInfo(title: string, description: string): HTMLElement {
  return NodeUtil.setupNode("div", {
    cls: "chasm-mrpt-meta-container",
    onInit: (meta) => {
      meta.append(
        NodeUtil.setupNode("p", {
          text: title,
          cls: "chasm-mrpt-meta-title",
        }),
      );
      meta.append(
        NodeUtil.setupNode("p", {
          text: description,
          cls: "chasm-mrpt-meta-description",
        }),
      );
    },
  });
}

function buildCrackStyleInputNode(id: string): HTMLElement {
  return NodeUtil.setupNode("div", {
    cls: "chasm-mrpt-text-input-container",
    onInit: (inputContainer) => {
      inputContainer.append(
        NodeUtil.setupNode("input", {
          cls: "chasm-mrpt-text-input",
          onInit: (input) => {
            input.type = "text";
            input.id = id;
          },
        }),
      );
    },
  });
}

function buildCrackStyleButton(id: string, buttonText: string, onClick: () => ExpandedVoid): HTMLElement {
  return NodeUtil.setupNode("div", {
    cls: "chasm-mrpt-button",
    text: buttonText,
    onInit: (button) => {
      button.id = id;
      button.onclick = onClick;
    },
  });
}

function createCrackStyleInput(title: string, description: string, id: string): HTMLElement {
  return NodeUtil.setupNode("div", {
    cls: "chasm-mrpt-container",
    onInit: (node) => {
      // 메타데이터
      node.append(buildCrackStyleInfo(title, description));
      // 인풋 컨테이너
      node.append(buildCrackStyleInputNode(id));
    },
  });
}

function createCrackStyleButton(title: string, description: string, id: string, buttonText: string, onClick: () => ExpandedVoid): HTMLElement {
  return NodeUtil.setupNode("div", {
    cls: "chasm-mrpt-container-horizontal",
    onInit: (node) => {
      // 메타데이터
      node.append(buildCrackStyleInfo(title, description));
      // 인풋 컨테이너
      node.append(buildCrackStyleButton(id, buttonText, onClick));
    },
  });
}

// ==============================================================
//                        와, YOLO!
// ==============================================================

// =================================================
//                   ORT 설정
// =================================================
ort.env.wasm.wasmPaths = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.25.1/dist/";
ort.env.wasm.numThreads = 1;
ort.env.wasm.simd = true;

// =================================================
//                  추론 상수
// =================================================
const CLASSIFIER_LABELS = ["놀람", "무표정", "슬픔", "웃음", "화남"];
const YOLO_SIZE = 640;

const EMOTION_SIZE = 224;
const MEAN = [0.485, 0.456, 0.406];
const STD = [0.229, 0.224, 0.225];

let isOrtLoadedBefore = false;
// =================================================
//                 추론 세션 프록시
// =================================================
const yoloProxy = readonlyLazy(async () => {
  const buffer = await fetchAndCacheModel("https://huggingface.co/skywolf46/anime_face_detection/resolve/c732304cb237f12f3e6ac7908da610efe274f774/face_detect_v1.4_n/model.onnx");
  if (!buffer.ok) return buffer;
  return success(await ort.InferenceSession.create(buffer.value, { executionProviders: ["wasm"] }));
});

const classifierProxy = readonlyLazy(async () => {
  const buffer = await fetchAndCacheModel("https://huggingface.co/skywolf46/kaunsera-at-home/resolve/9dc9f46749bc0396f40de0d37b01b2ddc766d47c/kaunsera-at-home-efficientnet-v1.1.0.onnx");
  if (!buffer.ok) return buffer;
  return success(await ort.InferenceSession.create(buffer.value, { executionProviders: ["wasm"] }));
});

// =================================================
//                   추론 펑션
// =================================================
async function fetchAndCacheModel(url: string): FutureResult<ArrayBuffer> {
  const cache = await caches.open("chasm-majority-report-v1");
  let response = await cache.match(url);
  if (!response) {
    response = await fetch(url);
    if (!response.ok) {
      return fail(new Error("오류로 인해 모델 다운로드에 실패하였습니다."));
    }
    await cache.put(url, response.clone());
  }

  return success(await response.arrayBuffer());
}

async function loadOrtSessions(): FutureResult<OrtSessionRecord> {
  const yoloSession = await yoloProxy;
  if (!yoloSession.ok) return fail(new Error(`YOLO 세션 로드 실패: ${yoloSession.error.message}`));
  const classifierSession = await classifierProxy;
  if (!classifierSession.ok) return fail(new Error(`Classifier 세션 로드 실패: ${classifierSession.error.message}`));
  isOrtLoadedBefore = true;
  return success({
    yolo: yoloSession.value,
    classifier: classifierSession.value,
  });
}

async function createYoloTensor(bitmap: ImageBitmap, yoloSize: number): FutureResult<YoloConfig> {
  try {
    const originWidth = bitmap.width;
    const originHeight = bitmap.height;

    const ratio = Math.min(yoloSize / originWidth, yoloSize / originHeight);
    const newWidth = Math.round(originWidth * ratio);
    const newHeight = Math.round(originHeight * ratio);
    const padWidth = (yoloSize - newWidth) / 2;
    const padHeight = (yoloSize - newHeight) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = yoloSize;

    const context = canvas.getContext("2d", { willReadFrequently: true })!;
    context.fillStyle = "rgb(114, 114, 114)";
    context.fillRect(0, 0, yoloSize, yoloSize);
    context.drawImage(bitmap, padWidth, padHeight, newWidth, newHeight);

    const imageData = context.getImageData(0, 0, yoloSize, yoloSize).data;
    const arr = new Float32Array(3 * yoloSize * yoloSize);
    for (let i = 0; i < yoloSize * yoloSize; i++) {
      arr[i] = imageData[i * 4 + 0] / 255.0;
      arr[i + yoloSize * yoloSize] = imageData[i * 4 + 1] / 255.0;
      arr[i + 2 * yoloSize * yoloSize] = imageData[i * 4 + 2] / 255.0;
    }
    return success(new YoloConfig(ratio, new ImageDimension(originWidth, originHeight), new ImageDimension(newWidth, newHeight), new ImageDimension(padWidth, padHeight), new ort.Tensor("float32", arr, [1, 3, YOLO_SIZE, YOLO_SIZE])));
  } catch (err) {
    return fail(err as Error);
  }
}

async function runYolo(bitMap: ImageBitmap, yolo: ort.InferenceSession, yoloSize: number): FutureResult<YoloResult> {
  const config = await createYoloTensor(bitMap, yoloSize);
  if (!config.ok) return config;
  try {
    const result = await yolo.run({ [yolo.inputNames[0]]: config.value.tensor });
    const outTensor = result[yolo.outputNames[0]];
    const dims = outTensor.dims;
    const data = outTensor.data as Float32Array;

    let numAnchors, numFeatures;
    let isTransposed = false;

    // Yolov8
    if (dims[1] === 5 || dims[1] === 6) {
      numFeatures = dims[1];
      numAnchors = dims[2];
      isTransposed = true;
    } else {
      // v5?
      numAnchors = dims[1];
      numFeatures = dims[2];
    }

    let bestBox = new YoloBox(0, 0, 0, 0, 0.0);

    for (let i = 0; i < numAnchors; i++) {
      let currentBox;
      if (isTransposed) {
        currentBox = new YoloBox(data[0 * numAnchors + i], data[1 * numAnchors + i], data[2 * numAnchors + i], data[3 * numAnchors + i], data[4 * numAnchors + i] * (numFeatures === 6 ? data[5 * numAnchors + i] : 1));
      } else {
        const offset = i * numFeatures;
        currentBox = new YoloBox(data[offset + 0], data[offset + 1], data[offset + 2], data[offset + 3], data[offset + 4] * (numFeatures === 6 ? data[offset + 5] : 1));
      }
      if (currentBox.confidence > bestBox.confidence) {
        bestBox = currentBox;
      }
    }

    return success(new YoloResult(config.value, bestBox));
  } catch (err) {
    return fail(err as Error);
  } finally {
    config.value.tensor.dispose();
  }
}

async function runClassifier(ortSession: ort.InferenceSession, bitMap: ImageBitmap, result: YoloResult, emotionSize: number, mean: number[], std: number[]): FutureResult<Float32Array> {
  const realCx = (result.bestBox.x - result.config.pad.width) / result.config.ratio;
  const realCy = (result.bestBox.y - result.config.pad.height) / result.config.ratio;
  const cropW = (result.bestBox.width / result.config.ratio) * 1.1;
  const cropH = (result.bestBox.height / result.config.ratio) * 1.1;
  const cropX = Math.max(0, realCx - cropW / 2);
  const cropY = Math.max(0, realCy - cropH / 2);

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = emotionSize;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;

  context.drawImage(bitMap, cropX, cropY, cropW, cropH, 0, 0, emotionSize, emotionSize);

  const imageArr = context.getImageData(0, 0, emotionSize, emotionSize).data;
  const arr = new Float32Array(3 * emotionSize * emotionSize);

  for (let i = 0; i < emotionSize * emotionSize; i++) {
    let redNorm = imageArr[i * 4 + 0] / 255.0;
    let greenNorm = imageArr[i * 4 + 1] / 255.0;
    let blueNorm = imageArr[i * 4 + 2] / 255.0;

    redNorm = (redNorm - mean[0]) / std[0];
    greenNorm = (greenNorm - mean[1]) / std[1];
    blueNorm = (blueNorm - mean[2]) / std[2];

    arr[i] = redNorm;
    arr[i + emotionSize * emotionSize] = greenNorm;
    arr[i + 2 * emotionSize * emotionSize] = blueNorm;
  }
  const emotionTensor = new ort.Tensor("float32", arr, [1, 3, emotionSize, emotionSize]);
  const emotionResults = await ortSession.run({ [ortSession.inputNames[0]]: emotionTensor });

  const emotionOutName = ortSession.outputNames[0];
  return success(emotionResults[emotionOutName].data as Float32Array);
}

async function executeEmotionAnalyze(file: File): FutureResult<Float32Array<ArrayBufferLike>> {
  let bitMap: Undeclarable<ImageBitmap> = undefined;
  try {
    const loadedSessions = await loadOrtSessions();
    if (!loadedSessions.ok) return loadedSessions;
    const { yolo, classifier } = loadedSessions.value;
    bitMap = await createImageBitmap(file);
    const yoloResult = await runYolo(bitMap, yolo, YOLO_SIZE);
    if (!yoloResult.ok) return yoloResult;
    if (yoloResult.value.bestBox.confidence < 0.3) {
      return fail(new Error("얼굴을 인식할 수 없거나 정확도가 너무 떨어져요.\n이 이미지는 자동 분류가 불가능해요."));
    }
    const emotionProbs = await runClassifier(classifier, bitMap, yoloResult.value, EMOTION_SIZE, MEAN, STD);
    if (!emotionProbs.ok) return emotionProbs;
    return success(emotionProbs.value);
  } finally {
    bitMap?.close();
  }
}

function getHighestLabel(classifierLabels: string[], item: Float32Array<ArrayBufferLike>): string {
  let highestIndex = -1;
  let highestValue = 0;
  item.forEach((value, index) => {
    if (highestValue < value) {
      highestIndex = index;
      highestValue = value;
    }
  });
  if (highestIndex === -1) return "알 수 없음";
  return classifierLabels[highestIndex] ?? "알 수 없음";
}

// ==============================================================
//                         UI 로직
// ==============================================================

const UPLOAD_THREASHOLD = 3;
const uploadQueue = new Array<FileUploadParam>();
let uploadResult = new Array<FileUploadResult>();
let uploading = 0;

async function doUpload(param: FileUploadParam) {
  let fileType = param.file.name.slice((Math.max(0, param.file.name.lastIndexOf(".")) || Infinity) + 1).toLowerCase();
  if (fileType === "jpg") {
    fileType = "jpeg";
  }
  const uploadRequest = await CrackSdk.network().authFetch("POST", "https://crack-api.wrtn.ai/crack-api/situation-images/presigned-urls/bulk", {
    sourceId: param.storyId,
    startingSets: param.setIds.map((it) => {
      return { baseSetId: it.setId };
    }),
    uploads: [{ fileType: fileType, category: param.character, situation: param.category }],
  });
  if (!uploadRequest.ok) {
    uploadResult.push(new FileUploadResult(param.file, new Error("프리사인 처리 실패")));
    console.error(uploadRequest.error);
    return;
  }
  if (uploadRequest.value.data.startingSets[0].rejected.length > 0) {
    uploadResult.push(new FileUploadResult(param.file, new Error("프리사인 요청 거부")));
    return;
  }
  let bulkUploadUrl = `https://crack-api.wrtn.ai/crack-api/situation-images/stories/${param.storyId}/starting-sets?bulkId=${uploadRequest.value.data.bulkId}&`;
  for (let setId of param.setIds) {
    bulkUploadUrl = `${bulkUploadUrl}&baseSetIds%5B%5D=${setId}`;
  }
  const checkRequest = await CrackSdk.network().authFetch("GET", bulkUploadUrl);
  if (!checkRequest.ok) {
    uploadResult.push(new FileUploadResult(param.file, new Error("벌크 업로드 처리 실패")));
    console.error(checkRequest.error);
    return;
  }
  const putRequest = await fetch(uploadRequest.value.data.startingSets[0].uploads[0].url, { method: "PUT", body: param.file });
  if (!putRequest.ok) {
    uploadResult.push(new FileUploadResult(param.file, new Error("이미지 업로드 처리 실패")));
    return;
  }

  let expectedUrl: IdPairs[] = [];
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    expectedUrl = [];
    const finalizeRequest = await CrackSdk.network().authFetch("GET", bulkUploadUrl);
    if (!finalizeRequest.ok) {
      uploadResult.push(new FileUploadResult(param.file, new Error("최종 이미지 처리 실패")));
      return;
    }
    let index = 0;
    for (let set of finalizeRequest.value.data.startingSets) {
      const progress = set.progress;
      if (progress.errorCount > 0) {
        uploadResult.push(new FileUploadResult(param.file, new Error("이미지 검열됨")));
        return;
      }
      if (progress.errorCount + progress.successCount === progress.totalCount) {
        expectedUrl.push(new IdPairs(param.setIds[index], param.setIds[index].id, set.uploads[0].url));
      }
      index++;
    }
    if (expectedUrl.length === param.setIds.length) break;
  }
  if (expectedUrl.length !== param.setIds.length) {
    uploadResult.push(new FileUploadResult(param.file, new Error("검열 대기 제한 시간 초과")));
    return;
  }
  for (const image of expectedUrl) {
    const completeRequest = await fetch(`${image.url}?_cb=${Date.now()}`);
    if (!completeRequest.ok) {
      uploadResult.push(new FileUploadResult(param.file, new Error("이미지 업로드 완료 검증 실패")));
      return;
    }
    await fetch(`${image.url}`);
  }
  for (const image of expectedUrl) {
    const injectResult = injectImage(image.set.id, image.id, param.character, param.category!, image.url);
    if (injectResult) {
      uploadResult.push(new FileUploadResult(param.file, new Error("이미지 업로드 완료 검증 실패")));
      return;
    }
  }
  uploadResult.push(new FileUploadResult(param.file, null));
}

async function analyzeAndUpload(param: FileUploadParam) {
  const fetched = await gatherImageEmotion(CLASSIFIER_LABELS, [param.file]);
  if (!fetched[0].ok) {
    uploadResult.push(new FileUploadResult(param.file, fetched[0].error));
    return;
  }
  await doUpload(param.withCategory(fetched[0].value.emotion));
}

function updateElement() {
  const element = NodeLocator.get(".chasm-mrpt-image-dragdrop-upload-statistics");
  const container = NodeLocator.get(".chasm-mrpt-image-dragdrop-error-container");
  if (!element || !container) return;
  if (uploading <= 0 && uploadResult.length <= 0) {
    // element.textContent = `업로드 대기중`;
    return;
  }

  let successCount = 0;

  for (const log of uploadResult) {
    if (log.failureCause) {
      if (!NodeLocator.get(`#mrpt-log-${log.resultId}`)) {
        let fileName = log.file.name;
        if (fileName.length > 15) {
          fileName = `${fileName.substring(0, 13)}..`;
        }
        container.append(
          NodeUtil.setupNode("p", {
            cls: "chasm-mrpt-dragdrop-upload-log",
            text: `❌ ${fileName}: ${log.failureCause.message}`,
            onInit: (node) => {
              node.id = `mrpt-log-${log.resultId}`;
            },
          }),
        );
      }
    } else {
      successCount++;
    }
  }

  if (uploading <= 0) {
    NodeUtil.replaceTextIfChanged(element, `${successCount}개의 이미지의 업로드에 성공했어요.`);
  } else {
    NodeUtil.replaceTextIfChanged(element, `업로드 진행중: ${uploadResult.length} / ${uploadResult.length + uploading + uploadQueue.length}`);
  }
}

async function tick() {
  updateElement();
  if (uploadQueue.length <= 0) return;
  const run = UPLOAD_THREASHOLD - uploading;
  if (run <= 0) return;
  
  for (let i = 0; i < run; i++) {
    const next = uploadQueue.splice(0, 1)[0];
    if (!next) continue;
    uploading++;
    setTimeout(async () => {
      try {
        await (next.category ? doUpload(next) : analyzeAndUpload(next));
      } catch (err) {
        console.error(err);
      } finally {
        uploading--;
      }
    });
  }
}

async function gatherImageEmotion(labels: string[], files: File[]): Promise<Result<EmotionDetectResult>[]> {
  if (!isOrtLoadedBefore) {
    await loadOrtSessions();
  }
  const list = new Array<Result<EmotionDetectResult>>();
  for (const file of files) {
    const classifierResult = await executeEmotionAnalyze(file);
    if (classifierResult.ok) {
      list.push(success(new EmotionDetectResult(file, getHighestLabel(labels, classifierResult.value))));
    } else {
      list.push(classifierResult);
    }
  }

  return list;
}

async function openQueue() {
  const useAnalysis = NodeLocator.get("#chasm-mrpt-emotion-analyze");
  const character = NodeLocator.get<HTMLInputElement>("#chasm-mrpt-character-name")?.value ?? "";
  const situation = NodeLocator.get<HTMLInputElement>("#chasm-mrpt-character-situation")?.value ?? "";
  const query = new URLSearchParams(window.location.search);
  const storyId = query.get("storyId");
  if (!storyId) {
    CrackSdk.toastify().doToastifyAlert("알 수 없는 오류가 발생해 스토리 ID를 가져올 수 없었어요.");
    return;
  }
  const setIds = extractCurrentSetIds();
  if (!setIds) {
    CrackSdk.toastify().doToastifyAlert("작품 ID 세트 추출에 실패했어요.");
    return;
  }
  if (character.length <= 0) {
    CrackSdk.toastify().doToastifyAlert("캐릭터 이름은 1자 이상이여야 해요.");
    return;
  }
  if (useAnalysis?.getAttribute("active") === "true") {
    const selected = await FileUtil.acceptFileRaw("image/png, image/jpg, image/jpeg, image/webp", true);
    if (selected) {
      for (const file of selected) {
        uploadQueue.push(new FileUploadParam(storyId, setIds, file, character, null));
      }
    }
  } else {
    if (situation.length <= 0) {
      CrackSdk.toastify().doToastifyAlert("캐릭터 상태는 1자 이상이여야 해요.");
      return;
    }
    const selected = await FileUtil.acceptFileRaw("image/png, image/jpg, image/jpeg, image/webp", false);
    if (selected) {
      for (const file of selected) {
        uploadQueue.push(new FileUploadParam(storyId, setIds, file, character, situation));
      }
    }
  }
}
BrowserInitUtil.init(() => {
  setInterval(tick, 250);
});

// ==============================================================
//                         UI 조작
// ==============================================================

function modifyUploadPanel(panel: Element) {
  for (const child of panel.children) {
    child.classList.add("chasm-mrpt-ignore");
  }
  panel.append(NodeUtil.setupParagraphNode({ cls: "chasm-mrpt-warn-text", text: " 주의하세요: 묶음보고서 모듈은 현재 버전에서는 전체 시작 설정에만 이미지 업로드가 가능합니다. " }));
  panel.append(
    createCrackStyleButton("감정 분석", "AI 모델을 통한 감정 분석 사용 여부예요.\nhttps://huggingface.co/skywolf46/kaunsera-at-home", "chasm-mrpt-emotion-analyze", "비활성화됨", () => {
      const button = NodeLocator.get<HTMLButtonElement>("#chasm-mrpt-emotion-analyze");
      if (button) {
        const area = NodeLocator.get<HTMLInputElement>("#chasm-mrpt-character-situation");
        if (button.hasAttribute("active")) {
          button.removeAttribute("active");
          button.innerText = "비활성화됨";
          if (area) area.disabled = false;
        } else {
          button.setAttribute("active", "true");
          button.innerText = "활성화됨";

          if (area) area.disabled = true;
        }
      }
    }),
  );

  panel.append(createCrackStyleInput("캐릭터 이름", "캐릭터 이름을 지정하세요. 파일 이름은 무시됩니다.", "chasm-mrpt-character-name"));
  panel.append(createCrackStyleInput("캐릭터 상태", "캐릭터 상태, 혹은 감정을 지정하세요.", "chasm-mrpt-character-situation"));
  panel.append(
    NodeUtil.setupNode("button", {
      cls: "chasm-mrpt-image-dragdrop",
      onInit: (node) => {
        node.append(
          NodeUtil.setupNode("div", {
            cls: "chasm-mrpt-image-dragdrop-contents",
            onInit: (container) => {
              container.append(parser.parseFromString(CLOUD_SVG, "image/svg+xml").documentElement);
              container.append(NodeUtil.setupParagraphNode({ cls: "chasm-mrpt-image-dragdrop-contents-title", text: "이미지를 올려보세요!" }));
              container.append(NodeUtil.setupParagraphNode({ cls: "chasm-mrpt-image-dragdrop-contents-description", text: "캐릭터 상태가 존재하는 상태에서는 문제가 발생할 수 있어요" }));
              container.append(NodeUtil.setupParagraphNode({ cls: "chasm-mrpt-image-dragdrop-upload-statistics", text: "업로드 대기중" }));
              container.append(NodeUtil.setupNode("div", { cls: "chasm-mrpt-image-dragdrop-error-container" }));
            },
          }),
        );
        node.onclick = openQueue;
      },
    }),
  );

  const clearButton = createCrackStyleButton("로그 비우기", "업로드 창의 실패 로그를 비우고 초기화해요.", "chasm-mrpt-reset", "로그 초기화", () => {
    const logger = NodeLocator.get(".chasm-mrpt-image-dragdrop-upload-statistics");
    const container = NodeLocator.get(".chasm-mrpt-image-dragdrop-error-container");
    uploadResult = [];
    if (container) container.replaceChildren();
    if (logger && uploading <= 0) logger.textContent = "업로드 대기중";
  });
  clearButton.setAttribute("active", "true");
  panel.append(clearButton);
}

function injectElement() {
  if (NodeLocator.get(`.chasm-mrpt-remapped`)) return;
  if (NodeLocator.getAll(`[aria-selected=true]`).find((it) => it.textContent === "미디어")) {
    const injectTarget = NodeLocator.getAll(`div[role="tablist"][data-orientation="horizontal"]`);
    if (injectTarget.length <= 0) return;
    const last = injectTarget.at(-1)!;
    const expectedPanel = last.nextElementSibling;
    if (!expectedPanel) return;
    const firstButton = last.children[0] as HTMLElement;
    firstButton.classList.add("chasm-mrpt-remapped");
    firstButton.textContent = "1. 이미지 분석 및 업로드";
    firstButton.addEventListener("click", () => {
      modifyUploadPanel(expectedPanel);
    });
    modifyUploadPanel(expectedPanel);

    CrackSdk.toastify().doToastifyAlert("묶음보고서 모듈은 서드파티의 한계로 시작 설정 실시간 반영이 불가능해요.\n만약 시작 설정을 추가했다면 저장 후 다시 편집을 시도해주세요.");
  }
}

BrowserInitUtil.init(() => {
  BrowserInitUtil.callGMAddStyle(SCRIPT_STYLE);
  ObserveUtil.attachHrefObserver(document, () => {
    if (CrackSdk.path().isStoryBuilderPath()) {
      const query = new URLSearchParams(window.location.search);
      if (query.get("type") !== "edit") {
        CrackSdk.toastify().doToastifyAlert("묶음보고서 모듈은 '편집'에서만 작동해요.\n만약 수정된 v2 이미지 업로드 기능이 필요한 상황이라면 작품 저장 후 편집으로 시도해주세요.");
      }
    }
  });
  if (CrackSdk.path().isStoryBuilderPath()) {
    const query = new URLSearchParams(window.location.search);
    if (query.get("type") !== "edit") {
      CrackSdk.toastify().doToastifyAlert("묶음보고서 모듈은 '편집'에서만 작동해요.\n만약 수정된 v2 이미지 업로드 기능이 필요한 상황이라면 작품 저장 후 편집으로 시도해주세요.");
    }
  }
  const bouncer = DelayUtil.debouncer(injectElement);
  ObserveUtil.attachObserver(document, () => {
    if (CrackSdk.path().isStoryBuilderPath()) {
      const query = new URLSearchParams(window.location.search);
      if (query.get("type") !== "edit") {
        return;
      }
      bouncer.runDebouncer(50);
    }
  });
});
