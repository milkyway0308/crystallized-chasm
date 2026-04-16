import { MissingComponentError } from "../../../utils/error-utils";
import { CrackKeywordBook } from "./types-keyword-book";
import { CrackParameter } from "./types-parameter";
import { CrackSituationImage } from "./types-situation-image";

export class CrackStartingSet {
  constructor(
    /** 시작 설정 ID */
    public readonly id: string,
    /** 시작 설정 세트 ID */
    public readonly setId: string,
    /** 시작 설정 이름 */
    public readonly name: string,
    /** 시작 설정 시작 메시지 */
    public readonly initialMessages: string[],
    /** 시작 설정 프롬프트 */
    public readonly situationPrompt: string,
    /** 시작 설정 최초 추천 답변 */
    public readonly replySuggestions: string[],
    /** 시작 설정 상황 이미지 */
    public readonly situationImages: CrackSituationImage[],
    /** 시작 설정 키워드북 */
    public readonly keywordBooks: CrackKeywordBook[],
    /** 시작 설정 스탯 */
    public readonly parameters: CrackParameter[],
  ) {}

  static from(data: any): CrackStartingSet {
    return new CrackStartingSet(
      MissingComponentError.ensureString("Crack Starting Set Deserialization", "_id", data),
      MissingComponentError.ensureString("Crack Starting Set Deserialization", "baseSetId", data),
      MissingComponentError.ensureString("Crack Starting Set Deserialization", "name", data),
      MissingComponentError.ensureArray<string>("Crack Starting Set Deserialization", "initialMessages", data),
      MissingComponentError.ensureString("Crack Starting Set Deserialization", "situationPrompt", data),
      MissingComponentError.ensureArray<string>("Crack Starting Set Deserialization", "replySuggestions", data),
      MissingComponentError.ensureArray<any>("Crack Starting Set Deserialization", "situationImages", data).map((it) => CrackSituationImage.from(it)),
      MissingComponentError.ensureArray<any>("Crack Starting Set Deserialization", "keywordBook", data).map((it) => CrackKeywordBook.from(it)),
      MissingComponentError.ensureArray<any>("Crack Starting Set Deserialization", "parameters", data).map((it) => CrackParameter.from(it)),
    );
  }
}
