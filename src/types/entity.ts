import { Attribute } from "./attribute";
import { Relationship } from "./relationship";

export abstract class Entity {
  public static attributes: Record<string, Attribute>;
  public static relationships: Record<string, Relationship>;
}

export const EntityFactory = () => {
  return class _Entity {
    static attributes: Record<string, Attribute> = Object.create(null);
    static relationships: Record<string, Relationship> = Object.create(null);
  };
};
