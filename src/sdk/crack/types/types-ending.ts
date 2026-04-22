import { MissingComponentError } from "../../../utils/error-utils";
import { Nullable } from "../../../utils/generic-types";

export class CrackEndingConditionContainer {
  private map = new Map<string, any>();

  constructor(data: any) {
    for (const item of Object.keys(data)) {
      this.map.set(item, data[item]);
    }
  }

  uglify(): any {
    const itemCreated: any = {};
    for (const [k, v] of this.map) {
      if (Array.isArray(v) && v.length === 0) continue;
      itemCreated[k] = v;
    }
    return itemCreated;
  }
}

export class CrackEnding {
  constructor(
    public id: Nullable<string>,
    public name: string,
    public blurredImageUrl: string,
    public imageUrl: string,
    public condition: CrackEndingConditionContainer,
    public prompt: string,
    public epilogueExample: string,
    public hint: Nullable<string>,
    public rarity: string,
  ) {}

  uglify(): any {
    return {
      baseEndingId: this.id ?? undefined,
      name: this.name,
      blurredImageUrl: this.blurredImageUrl,
      imageUrl: this.imageUrl,
      condition: this.condition.uglify(),
      conditionPrompt: this.prompt,
      epilogueExample: this.epilogueExample,
      hint: this.hint ?? undefined,
      rarity: this.rarity,
    };
  }

  static from(data: any): CrackEnding {
    return new CrackEnding(
      MissingComponentError.ensureString("Crack Ending Deserialization", "baseEndingId", data, false) ?? null,
      MissingComponentError.ensureString("Crack Ending Deserialization", "name", data),
      MissingComponentError.ensureString("Crack Ending Deserialization", "blurredImageUrl", data),
      MissingComponentError.ensureString("Crack Ending Deserialization", "imageUrl", data),
      new CrackEndingConditionContainer(data["condition"] ?? {}),
      MissingComponentError.ensureString("Crack Ending Deserialization", "conditionPrompt", data),
      MissingComponentError.ensureString("Crack Ending Deserialization", "epilogueExample", data),
      MissingComponentError.ensureString("Crack Ending Deserialization", "hint", data, false) ?? null,
      MissingComponentError.ensureString("Crack Ending Deserialization", "rarity", data),
    );
  }
}

export class CrackEndingContainer {
  constructor(public endings: CrackEnding[]) {}

  uglify(): any {
    return {
      endings: this.endings.map((it) => it.uglify()),
    };
  }

  hasEndings(): boolean {
    return this.endings.length > 0;
  }

  static from(data: any): CrackEndingContainer {
    return new CrackEndingContainer((MissingComponentError.ensureArray("Crack Ending Container Deserialization", "endings", data, false) ?? []).map((it) => CrackEnding.from(it)));
  }
}
