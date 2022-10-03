import { Adapter } from "./adapter";

import fetch from "cross-fetch";
import { Entity } from "./types/entity";

export class ApiClient {
  private headers = {
    "Content-Type": "application/json",
  };

  constructor(public baseUrl: string, public adapter: Adapter) {}

  private getIncludes<T extends Entity>(includes: Entity[], entity: T): string {
    const entityRelationships = (entity as unknown as typeof Entity)
      .relationships;

    const includeRelationNames = includes.map((include) => {
      const relationship = Object.values(entityRelationships).find(
        (relationship) => relationship.entity === include
      );
      if (!relationship) {
        throw new Error(
          `Entity ${entity.constructor.name} does not have required relationship`
        );
      }
      return relationship.name;
    });

    return includeRelationNames.join(",");
  }

  public async getOne<T extends Entity>(
    resource: string,
    id: string,
    entity: new () => T,
    includes: Entity[] = []
  ): Promise<T> {
    const url = new URL(`${resource}/${id}`, this.baseUrl);

    if (includes.length) {
      url.searchParams.append("include", this.getIncludes(includes, entity));
    }

    const response = await fetch(url.toString(), {
      headers: this.headers,
    });
    const data = await response.json();
    return this.adapter.adapt(data, entity);
  }

  public async getMany<T extends Entity>(
    resource: string,
    entity: new () => T,
    includes: Entity[] = []
  ): Promise<T[]> {
    const url = new URL(resource, this.baseUrl);

    if (includes.length) {
      url.searchParams.append("include", this.getIncludes(includes, entity));
    }

    const response = await fetch(url.toString(), {
      headers: this.headers,
    });
    const data = await response.json();
    return this.adapter.adaptMany(data, entity);
  }
}
