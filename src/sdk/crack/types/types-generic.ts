import { Nullable } from "../../../utils/generic-types";

export class CrackImageMappable {
  imageMap = new Map<string, string>();
  /**
   * @param imageContainer 이미지 맵
   */
  constructor(imageContainer: any) {
    if (imageContainer) {
      for (let [key, value] of Object.entries(imageContainer)) {
        this.imageMap.set(key, value as string);
      }
    }
  }

  /**
   * 라이트 모드 이미지를 반환합니다.
   * @returns 이미지 URL
   */
  light(): Nullable<string> {
    return this.imageMap.get("light") ?? null;
  }

  /**
   * 라이트 모드 이미지를 반환합니다.
   * @returns 이미지 URL
   */
  dark(): Nullable<String> {
    return this.imageMap.get("dark") ?? null;
  }

  /**
   * 이미지 맵에서 키에 해당되는 이미지 URL을 반환합니다.
   * @param key 이미지 키
   * @returns 이미지 URL
   */
  image(key: string): Nullable<string> {
    return this.imageMap.get(key) ?? null;
  }
}

export class CrackVisibility {
  /**
   * @param originName 원본 이름
   */
  constructor(public readonly originName: string) {
    this.originName = originName;
  }

  static PUBLIC = new CrackVisibility("public");
  static PRIVATE = new CrackVisibility("private");
  static LINK_ONLY = new CrackVisibility("linkonly");

  /**
   *
   * @param name
   */
  static of(name: string) {
    if (name.toLowerCase() === "private") {
      return this.PRIVATE;
    }
    if (name.toLowerCase() === "public") {
      return this.PUBLIC;
    }
    return this.LINK_ONLY;
  }
}
