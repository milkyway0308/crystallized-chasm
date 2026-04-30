import { Undeclarable } from "../../../utils/generic-types";

export class CrackCreatorRecommendedOutput {
  constructor(
    public multiplier: string,
    public type: string,
  ) {}

  uglify(): any {
    return {
      totalMultiplier: this.multiplier,
      type: this.type,
    };
  }

  static from(data: any): Undeclarable<CrackCreatorRecommendedOutput> {
    if (!data) return undefined;
    return new CrackCreatorRecommendedOutput(data.totalMultiplier, data.type);
  }
}
