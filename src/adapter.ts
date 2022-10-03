import { Entity } from "./types/entity";

export interface Adapter {
    adapt<T extends Entity>(source: any, destination: (new () => T)): T;
    adaptMany<T extends Entity>(source: any, destination: (new () => T)): T[];
}