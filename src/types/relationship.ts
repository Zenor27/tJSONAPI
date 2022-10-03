import { Entity } from "./entity";

export enum RelationshipTypeEnum {
  ToOne = "to_one",
  ToMany = "to_many",
}

export class Relationship {
  constructor(
    public name: string,
    public type: RelationshipTypeEnum,
    public entity: new () => Entity
  ) {}

  static toMany(entity: new () => Entity, relationshipName?: string) {
    return (target: Entity, name: string) => {
      (target.constructor as typeof Entity).relationships[name] =
        new Relationship(
          relationshipName || name,
          RelationshipTypeEnum.ToMany,
          entity
        );
    };
  }

  static toOne(entity: new () => Entity, relationshipName?: string) {
    return (target: Entity, name: string) => {
      (target.constructor as typeof Entity).relationships[name] =
        new Relationship(
          relationshipName || name,
          RelationshipTypeEnum.ToOne,
          entity
        );
    };
  }
}
