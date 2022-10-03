import { Attribute } from "./types/attribute";
import { ApiClient } from "./client";
import { JsonApiAdapter } from "./json-api-adapter";
import { EntityFactory } from "./types/entity";
import { Relationship } from "./types/relationship";

class UserProject extends EntityFactory() {
  @Attribute.required()
  public id!: string;

  @Attribute.required("project_id")
  public projectId!: string;

  @Attribute.optional("user_id")
  public userId?: string;

  @Attribute.required()
  public simulated!: boolean;
}

class ProjectStatus extends EntityFactory() {
  @Attribute.required()
  public id!: string;

  @Attribute.required()
  public name!: string;
}

class Project extends EntityFactory() {
  @Attribute.required()
  public id!: string;

  @Attribute.required()
  public name!: string;

  @Attribute.optional()
  public description?: string;

  @Relationship.toMany(UserProject, "user_projects")
  public userProjects?: UserProject[];

  @Relationship.toOne(ProjectStatus, "projectstatus")
  public projectStatus?: ProjectStatus;

  public describe(): string {
    return this.id + ": " + this.name;
  }
}

const apiClient = new ApiClient(
  "http://localhost:5000/api/v1/",
  new JsonApiAdapter()
);

apiClient
  .getMany("project", Project, [UserProject, ProjectStatus])
  .then((projects) => console.log(projects));
