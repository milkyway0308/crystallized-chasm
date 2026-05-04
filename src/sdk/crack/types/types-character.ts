import { MissingComponentError } from "../../../utils/error-utils";
import { Consumer, Nullable, Runnable } from "../../../utils/generic-types";
import { UpdatableTimestamp } from "../../core/types/generic-types";
import { CrackVisibility } from "./types-generic";

export class CrackSituationImage {
  constructor(
    public readonly situation: string,
    public readonly keyword: string,
    public readonly imageUrl: string,
    public readonly blurredImageUrl: string,
    public readonly hint: string,
  ) {}

  uglify(): any {
    return {
      situation: this.situation,
      keyword: this.keyword,
      imageUrl: this.imageUrl,
      hint: this.hint,
      blurredImageUrl: this.blurredImageUrl,
    };
  }

  static from(data: any): CrackSituationImage {
    return new CrackSituationImage(
      MissingComponentError.ensureString("Crack Character Image Deserialization", "situation", data),
      MissingComponentError.ensureString("Crack Character Image Deserialization", "keyword", data),
      MissingComponentError.ensureString("Crack Character Image Deserialization", "imageUrl", data),
      MissingComponentError.ensureString("Crack Character Image Deserialization", "blurredImageUrl", data),
      MissingComponentError.ensureString("Crack Character Image Deserialization", "hint", data),
    );
  }
}

export class CrackCharacterMessageTemplate {
  constructor(
    public role: string,
    public content: string,
  ) {}

  uglify(): any {
    return {
      role: this.role,
      content: this.content,
    };
  }

  static from(data: any): CrackCharacterMessageTemplate {
    return new CrackCharacterMessageTemplate(MissingComponentError.ensureString("Crack Character Message Deserialization", "role", data), MissingComponentError.ensureString("Crack Character Message Deserialization", "content", data));
  }
}

export class WritableCharacterInfo {
  public constructor(
    public id: Nullable<string>,
    public name: string,
    public simpleDescription: string,
    public detailDescription: string,
    public systemPrompt: string,
    public associatedStoryIds: string[],
    public introMessages: CrackCharacterMessageTemplate[],
    public exampleMessages: CrackCharacterMessageTemplate[],
    public images: CrackSituationImage[],
    public tags: string[],
    public playGuide: string,

    public isCommentBlocked: boolean,
    public isMovingImage: boolean,
    public genreId: string,
    public target: string,
    public visibility: CrackVisibility,

    public profileUrl: string,
  ) {}

  uglify(eraseId: boolean): any {
    return {
      characterId: this.id && !eraseId ? this.id : undefined,
      name: this.name,
      simpleDescription: this.simpleDescription,
      systemPrompt: this.systemPrompt,
      associatedStoryIds: this.associatedStoryIds,
      genreId: this.genreId,
      target: this.target,
      visibility: this.visibility.originName,
      isCommentBlocked: this.isCommentBlocked,
      isMovingImage: this.isMovingImage,
      introInitialMessages: this.introMessages.map((it) => it.uglify()),
      exampleMessages: this.exampleMessages.map((it) => it.uglify()),
      situationImages: this.images.map((it) => it.uglify()),
      tags: this.tags,
      playGuide: this.playGuide,
    };
  }

  modify(unit: Consumer<WritableCharacterInfo>): WritableCharacterInfo {
    unit(this);
    return this;
  }
}

export class ReadonlyCharacterInfo {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly simpleDescription: string,
    public readonly associatedStoryIds: string[],
    public readonly isCommentBlocked: boolean,
    public readonly isMovingImage: boolean,
    public readonly introBackground: string,
    public readonly introMessages: CrackCharacterMessageTemplate[],
    public readonly exampleMessages: CrackCharacterMessageTemplate[],
    public readonly systemPrompt: string,
    public readonly situationImages: CrackSituationImage[],
    public readonly detailDescription: string,
    public readonly tags: string[],
    public readonly genreId: string,
    public readonly target: string,
    public readonly type: string,
    public readonly visibility: CrackVisibility,
    public readonly playGuide: string,
    public readonly timestamp: UpdatableTimestamp,
    public readonly profileUrl: string,
  ) {}

  asWritable(): WritableCharacterInfo {
    return new WritableCharacterInfo(
      this.id,
      this.name,
      this.simpleDescription,
      this.detailDescription,
      this.systemPrompt,
      this.associatedStoryIds,
      this.introMessages,
      this.exampleMessages,
      this.situationImages,
      this.tags,
      this.playGuide,
      this.isCommentBlocked,
      this.isMovingImage,
      this.genreId,
      this.target,
      this.visibility,
      this.profileUrl,
    );
  }

  static from(data: any): ReadonlyCharacterInfo {
    return new ReadonlyCharacterInfo(
      MissingComponentError.ensureString("Crack Story Deserialization", "_id", data),
      MissingComponentError.ensureString("Crack Story Deserialization", "userId", data),
      MissingComponentError.ensureString("Crack Story Deserialization", "name", data),
      MissingComponentError.ensureString("Crack Story Deserialization", "simpleDescription", data),
      MissingComponentError.ensureArray<any>("Crack Story Deserialization", "associatedStoryIds", data, false) ?? [],
      MissingComponentError.ensureBool("Crack Story Deserialization", "isCommentBlocked", data),
      MissingComponentError.ensureBool("Crack Story Deserialization", "isMovingImage", data),
      MissingComponentError.ensureString("Crack Story Deserialization", "introBackground", data),
      (MissingComponentError.ensureArray<any>("Crack Story Deserialization", "introInitialMessages", data) ?? []).map((it) => CrackCharacterMessageTemplate.from(it)),
      (MissingComponentError.ensureArray<any>("Crack Story Deserialization", "exampleMessages", data) ?? []).map((it) => CrackCharacterMessageTemplate.from(it)),
      MissingComponentError.ensureString("Crack Story Deserialization", "systemPrompt", data),
      (MissingComponentError.ensureArray<any>("Crack Story Deserialization", "situationImages", data) ?? []).map((it) => CrackSituationImage.from(it)),
      MissingComponentError.ensureString("Crack Story Deserialization", "detailDescription", data),
      MissingComponentError.ensureArray<string>("Crack Story Deserialization", "tags", data),
      MissingComponentError.ensureString("Crack Story Deserialization", "genreId", data),
      MissingComponentError.ensureString("Crack Story Deserialization", "target", data),
      MissingComponentError.ensureString("Crack Story Deserialization", "type", data),
      CrackVisibility.of(MissingComponentError.ensureString("Crack Story Deserialization", "visibility", data)),
      MissingComponentError.ensureString("Crack Story Deserialization", "playGuide", data),
      {
        created: new Date(MissingComponentError.ensureString("Crack Story Deserialization", "createdAt", data)),
        updated: new Date(MissingComponentError.ensureString("Crack Story Deserialization", "updatedAt", data)),
      },
      MissingComponentError.ensureString("Crack Story Deserialization", "profileImageUrl", data),
    );
  }
}
