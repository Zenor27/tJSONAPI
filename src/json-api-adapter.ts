import { Adapter } from "./adapter";
import { Entity } from "./types/entity";
import { RelationshipTypeEnum } from "./types/relationship";

type JsonApiDataAttributes = {
  [key: string]: any;
};

type JsonApiLinks = {
  self: string;
};

type JsonApiDataRelationshipData = {
  id: string;
  type: string;
};

type JsonApiDataRelationships = {
  [key: string]: {
    data: JsonApiDataRelationshipData | JsonApiDataRelationshipData[];
  };
};

type JsonApiData = {
  type: string;
  attributes: JsonApiDataAttributes;
  relationships?: JsonApiDataRelationships;
  id: string;
  links: JsonApiLinks;
};

type JsonApiIncluded = JsonApiData;

type JsonApi = {
  version: string;
};

type JsonApiSource = {
  data: JsonApiData | JsonApiData[];
  included: JsonApiIncluded[];
  links: JsonApiLinks;
  jsonapi: JsonApi;
};

export class JsonApiAdapter implements Adapter {
  _adapt<T extends Entity>(
    data: JsonApiData,
    included: JsonApiIncluded[],
    destination: new () => T
  ): T {
    const entity = new destination();
    const entityAttributes = (destination as unknown as typeof Entity)
      .attributes;
    const entityRelationships = (destination as unknown as typeof Entity)
      .relationships;

    Object.entries(entityAttributes).forEach(([key, attribute]) => {
      const value = key === "id" ? data.id : data.attributes[attribute.name];
      if ((value === null || value === undefined) && attribute.required) {
        throw new Error(`Required attribute ${attribute.name} is missing`);
      }
      (entity as any)[key] = value;
    });

    const { relationships } = data;
    Object.entries(entityRelationships).forEach(([key, relationship]) => {
      if (relationship.type === RelationshipTypeEnum.ToMany) {
        (entity as any)[key] = [];
      }

      const value = relationships?.[relationship.name]?.data;
      if (!value) {
        return;
      }

      if (relationship.type === RelationshipTypeEnum.ToMany) {
        (value as JsonApiDataRelationshipData[]).map(({ id, type }) => {
          const include = included.find(
            (included) => included.id === id && included.type === type
          );
          if (!include) {
            throw new Error(`Included entity ${type} with id ${id} is missing`);
          }

          (entity as any)[key].push(
            this._adapt(include, included, relationship.entity)
          );
        });
      } else {
        const { id, type } = value as JsonApiDataRelationshipData;
        const include = included.find(
          (included) => included.id === id && included.type === type
        );
        if (!include) {
          throw new Error(`Included entity ${type} with id ${id} is missing`);
        }
        (entity as any)[key] = this._adapt(
          include,
          included,
          relationship.entity
        );
      }
    });

    return entity;
  }

  adapt<T extends Entity>(source: JsonApiSource, destination: new () => T): T {
    return this._adapt(
      source.data as JsonApiData,
      source.included,
      destination
    );
  }

  adaptMany<T extends Entity>(
    source: JsonApiSource,
    destination: new () => T
  ): T[] {
    return (source.data as JsonApiData[]).map((x) =>
      this._adapt(x, source.included, destination)
    );
  }
}
