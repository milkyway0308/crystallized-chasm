import { MissingComponentError } from "../../../utils/error-utils";
import { Nullable, Undeclarable } from "../../../utils/generic-types";

export class CrackModelMaxUsageMultiplier {
  constructor(
    public modelId: string,
    public multiplier: number,
  ) {}

  uglify(): any {
    return {
      chatModelId: this.modelId,
      maxOutputMultiplier: this.multiplier,
    };
  }

  static from(data: any): CrackModelMaxUsageMultiplier {
    return new CrackModelMaxUsageMultiplier(data["chatModelId"], data["maxOutputMultiplier"]);
  }
}
export class CrackCreatorRecommendedOutput {
  constructor(
    public type: string,
    public multiplier: Nullable<string>,
    public modelMultipliers: CrackModelMaxUsageMultiplier[],
  ) {}

  uglify(): any {
    return {
      type: this.type,
      totalMultiplier: this.multiplier === null ? undefined : this.multiplier,
      modelMultipliers: this.modelMultipliers.length === 0 ? undefined : this.modelMultipliers.map((it) => it.uglify()),
    };
  }

  static from(data: any): Undeclarable<CrackCreatorRecommendedOutput> {
    if (!data) return undefined;
    return new CrackCreatorRecommendedOutput(
      MissingComponentError.ensureString("Crack Recommended Output Deserialization", "type", data),
      data.totalMultiplier,
      MissingComponentError.ensureArray("Crack Recommended Output Deserialization", "modelMultipliers", data, false)?.map((it) => CrackModelMaxUsageMultiplier.from(it)) ?? [],
    );
  }
}
