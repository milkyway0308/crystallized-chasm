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
  
  static from(data: any): CrackCreatorRecommendedOutput {
    return new CrackCreatorRecommendedOutput(data.totalMultiplier, data.type);
  }
}
