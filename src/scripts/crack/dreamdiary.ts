import Dexie, { EntityTable } from "dexie";
import { CRACK_VERSION_RULE } from "../../constants/script-constants";
import { BrowserInitUtil } from "../../utils/init-util";
import { lazy, readonlyLazy } from "../../utils/lazy-util";
import { LocaleStorageConfig } from "../../utils/local-storage-config";
import { LogUtil } from "../../utils/log-utils";
import { ScriptMetaUtil } from "../../utils/script-meta-util";
import { configure } from "../../utils/flow-handler";
import { Nullable, Undeclarable } from "../../utils/generic-types";
import { ObserveUtil } from "../../utils/observe-util";
import { DelayUtil } from "../../utils/delay-util";
import { CrackSdk } from "../../sdk/crack-sdk";

export const scriptMeta = ScriptMetaUtil.construct("crack", "dreamdiary.user.js", undefined, (meta) => {
  meta.name = "Chasm Crystallized DreamDiary (결정화 캐즘 꿈일기)";
  meta.version = "CRCK-DDIA-v2.0.0" satisfies CRACK_VERSION_RULE;
  meta.author = "milkyway0308";
  meta.description = "유저노트 저장 / 불러오기 기능 추가. 이 기능은 결정화 캐즘 오리지널 패치입니다.";
});

interface NoteData {
  keyName: string;
  noteName: string;
  boundCharacter: string;
  noteContent: string;
  savedAt: number;
}

interface SelectionData {
  boundCharacter: string;
  selected: string;
}
const STANDARD_NOTIFICATION_TIME = 3000;

const db = lazy(() =>
  configure(
    new Dexie("chasm-dream-diary") as Dexie & {
      noteStore: EntityTable<NoteData, "keyName">;
      lastSelected: EntityTable<SelectionData, "boundCharacter">;
    },
    (dexie) => {
      dexie.version(1).stores({
        noteStore: `keyName, noteName, boundCharacter, noteContent, savedAt`,
        lastSelected: `boundCharacter, selected`,
      });
    },
  ),
);
const logger = readonlyLazy(() => new LogUtil("Chasm Crystallized DreamDiary", false));

class CustomUserNote {
  constructor(
    public keyName: string,
    public name: string,
    public bound: string,
    public noteContent: string,
    public savedAt: number,
  ) {}
}

// =====================================================
//                      설정
// =====================================================
const settings = new LocaleStorageConfig<{
  lastPromptName: Undeclarable<string>;
  boundCharacter: Undeclarable<string>;
  lastPromptDisplay: Undeclarable<string>;
  isCustom: boolean;
}>("chasm-crck-ddia-settings", {
  lastPromptName: undefined,
  boundCharacter: undefined,
  lastPromptDisplay: undefined,
  isCustom: false,
});

// =================================================
//                     로직
// =================================================

async function findAllNoteOf(character: string): Promise<CustomUserNote[]> {
  return (await db.noteStore.where("boundCharacter").anyOf("#global", character).sortBy("savedAt")).map((data) => new CustomUserNote(data.keyName, data.noteName, data.boundCharacter, data.noteContent, data.savedAt));
}

async function getSelected(character: string): Promise<Nullable<string>> {
  const result = await db.lastSelected.where("boundCharacter").anyOf(character).toArray();
  if (result.length > 0) {
    return result[0].selected;
  }
  return null;
}

async function setLastSelected(character: string, key: string): Promise<void> {
  await db.lastSelected.put({
    boundCharacter: character,
    selected: key,
  });
}

async function removeLastSelected(character: string): Promise<void> {
  await db.lastSelected.delete(character);
}

async function getNoteOf(keyId: string): Promise<Undeclarable<CustomUserNote>> {
  const data = (await db.noteStore.where("keyName").anyOf(keyId).toArray())?.at(0);
  if (!data) return undefined;
  return new CustomUserNote(data.keyName, data.noteName, data.boundCharacter, data.noteContent, data.savedAt);
}

async function deleteNoteOf(character: string, noteName: string) {
  try {
    await db.noteStore.delete(`${character}!+${noteName}`);
  } catch (err) {
    console.error(err);
  }
}

async function saveNoteOf(character: string, noteName: string, contents: string) {
  try {
    await db.noteStore.put({
      keyName: `${character}!+${noteName}`,
      noteName: noteName,
      boundCharacter: character,
      noteContent: contents,
      savedAt: new Date().getTime(),
    });
  } catch (err) {
    console.error(err);
  }
}

// =================================================
//                  초기화
// =================================================

function setup() {

}
function prepare() {
    const debouncer = DelayUtil.debouncer(setup);
    debouncer.runDebouncer(100);
  ObserveUtil.attachObserver(document, () => {
    debouncer.runDebouncer(100);
  });
}

function addMenu() {
  CrackSdk.addonModal().acquire().addLicenseDisplay((panel) => {
    panel.addTitleText("결정화 캐즘 꿈일기");
    panel.addText("- decentralized-modal.js 프레임워크 사용 (https://github.com/milkyway0308/crystalized-chasm/decentralized.js)");
  });
}

BrowserInitUtil.init(() => {
  settings.load();
  addMenu();
  BrowserInitUtil.onPagePrepare(prepare);
});
