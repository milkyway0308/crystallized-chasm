import { MissingComponentError } from "../../../utils/error-utils";
import { Nullable } from "../../../utils/generic-types";

export interface CrackCondition {
  type: string;
  uglify(eraseId: boolean): any;
}

export class CrackSingleCondition implements CrackCondition {
  constructor(
    public type: string,
    public comparisonOperator: Nullable<string>,
    public statName: string,
    public value: string,
    public valueType: string,
  ) {}

  uglify(eraseId: boolean): any {
    return {
      comparisonOperator: this.comparisonOperator,
      statName: this.statName,
      type: this.type,
      value: this.value,
      valueType: this.valueType,
    };
  }

  static from(data: any): CrackSingleCondition {
    return new CrackSingleCondition(
      MissingComponentError.ensureString("Crack Single Ending Rule Deserialization", "type", data),
      MissingComponentError.ensureString("Crack Single Ending Rule Deserialization", "comparisonOperator", data, false) ?? null,
      MissingComponentError.ensureString("Crack Single Ending Rule Deserialization", "statName", data),
      MissingComponentError.ensureString("Crack Single Ending Rule Deserialization", "value", data),
      MissingComponentError.ensureString("Crack Single Ending Rule Deserialization", "valueType", data),
    );
  }
}

export class CrackGroupedCondition implements CrackCondition {
  constructor(
    public type: string,
    public operator: string,
    public rules: CrackSingleCondition[],
  ) {}

  uglify(eraseId: boolean) {
    return {
      type: this.type,
      ruleOperator: this.operator,
      rules: this.rules.map((it) => it.uglify(eraseId)),
    };
  }

  static from(data: any): CrackGroupedCondition {
    return new CrackGroupedCondition(
      MissingComponentError.ensureString("Crack Grouped Ending Rule Deserialization", "type", data),
      MissingComponentError.ensureString("Crack Grouped Ending Rule Deserialization", "ruleOperator", data),
      (MissingComponentError.ensureArray<any>("Crack Grouped Ending Rule Deserialization", "rules", data, false) ?? []).map((it) => CrackSingleCondition.from(it)),
    );
  }
}

export class CrackEndingCondition {
  constructor(
    public leastTurn: number,
    public groupOperator: Nullable<string>,
    public rules: CrackCondition[],
  ) {}

  static from(data: any): CrackEndingCondition {
    return new CrackEndingCondition(
      MissingComponentError.ensureNumber("Crack Ending Container Deserialization", "turnCount", data),
      MissingComponentError.ensureString("Crack Ending Container Deserialization", "groupOperator", data, false) ?? null,
      (MissingComponentError.ensureArray<any>("Crack Ending Container Deserialization", "rules", data, false) ?? []).map((it) => {
        if (it.type === "SINGLE") {
          return CrackSingleCondition.from(it);
        } else if (it.type === "GROUP") {
          return CrackGroupedCondition.from(it);
        } else {
          throw Error("Unexpected crack rule group type " + it.type);
        }
      }),
    );
  }

  uglify(eraseId: boolean): any {
    return {
      turnCount: this.leastTurn,
      groupOperator: this.groupOperator ? this.groupOperator : undefined,
      rules: this.rules.length > 0 ? this.rules.map((it) => it.uglify(eraseId)) : undefined,
    };
  }
}

export class CrackEnding {
  constructor(
    public id: Nullable<string>,
    public name: string,
    public blurredImageUrl: string,
    public imageUrl: string,
    public condition: CrackEndingCondition,
    public prompt: string,
    public epilogueExample: string,
    public hint: Nullable<string>,
    public rarity: string,
  ) {}

  uglify(eraseId: boolean): any {
    return {
      baseEndingId: this.id && !eraseId ? this.id : undefined,
      name: this.name,
      blurredImageUrl: this.blurredImageUrl,
      imageUrl: this.imageUrl,
      condition: this.condition.uglify(eraseId),
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
      CrackEndingCondition.from(data["condition"] ?? {}),
      MissingComponentError.ensureString("Crack Ending Deserialization", "conditionPrompt", data),
      MissingComponentError.ensureString("Crack Ending Deserialization", "epilogueExample", data),
      MissingComponentError.ensureString("Crack Ending Deserialization", "hint", data, false) ?? null,
      MissingComponentError.ensureString("Crack Ending Deserialization", "rarity", data),
    );
  }
}

export class CrackEndingContainer {
  constructor(public endings: CrackEnding[]) {}

  uglify(eraseId: boolean): any {
    return {
      endings: this.endings.map((it) => it.uglify(eraseId)),
    };
  }

  hasEndings(): boolean {
    return this.endings.length > 0;
  }

  static from(data: any): CrackEndingContainer {
    return new CrackEndingContainer((MissingComponentError.ensureArray("Crack Ending Container Deserialization", "endings", data, false) ?? []).map((it) => CrackEnding.from(it)));
  }
}
