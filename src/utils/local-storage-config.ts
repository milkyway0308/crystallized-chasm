/**
 * 서드파티 확장 스크립트를 위한 콘피그 클래스. 기초적으로 이전 콘피그와 병합을 진행하여 콘피그 소실 및 충돌을 최소화합니다.
 * @template CONFIG
 */
export class LocaleStorageConfig<CONFIG> {
  readonly key: string;
  config: CONFIG;
  constructor(key: string, configTemplate: CONFIG) {
    this.key = key;
    this.config = configTemplate;
  }

  /**
   * 콘피그를 LocalStorage에서 불러옵니다.
   * @returns 병합된 현재 콘피그
   */
  load(): CONFIG {
    const loadedSettings = localStorage.getItem(this.key);
    if (loadedSettings) {
      const json = JSON.parse(loadedSettings);
      for (let key of Object.keys(json)) {
        // Merge setting for version compatibility support
        // @ts-ignore
        this.config[key] = json[key];
      }
    }
    return this.config;
  }

  /**
   * 콘피그를 LocalStorage로 저장합니다.
   */
  save() {
    localStorage.setItem(this.key, JSON.stringify(this.config));
  }

  /**
   * 현재 템플릿을 복제해 새 인스턴스로 만듭니다.
   * @param key LocalStorage에서 사용할 키 값
   */
  fork(key: string) {
    return new LocaleStorageConfig(key, structuredClone(this.config));
  }
}
