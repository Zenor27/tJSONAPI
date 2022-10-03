import { Entity } from "./entity";

export class Attribute {
  constructor(public name: string, public required: boolean) {}

  static required(attributeName?: string) {
    return (target: Entity, name: string) => {
      (target.constructor as typeof Entity).attributes[name] = new Attribute(
        attributeName || name,
        true
      );
    };
  }

  static optional(attributeName?: string) {
    return (target: Entity, name: string) => {
      (target.constructor as typeof Entity).attributes[name] = new Attribute(
        attributeName || name,
        false
      );
    };
  }
}
