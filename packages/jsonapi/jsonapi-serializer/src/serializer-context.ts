/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { GenericObject } from "./utils/types.js";
import { ResourceManager } from "./resource-manager.js";
import { ResourceDefinitions } from "./jsonapi.js";

/* -----------------------------------------------------------------------------
 * SerializerContext types
 * -------------------------------------------------------------------------- */

export type SerializerArtifacts = GenericObject | undefined;

/* -----------------------------------------------------------------------------
 * SerializerContext
 * -------------------------------------------------------------------------- */

export class SerializerContext<Definitions extends ResourceDefinitions> {
  resourceManager: ResourceManager<Definitions>;

  constructor(resourceManager: ResourceManager<Definitions>) {
    this.resourceManager = resourceManager;
  }

  addArtifacts<Artifacts extends SerializerArtifacts>(artifacts: Artifacts) {
    return new SerializerContextDecorated(this.resourceManager, artifacts);
  }

  child() {
    return new SerializerContext(this.resourceManager);
  }
}

export class SerializerContextDecorated<
  Definitions extends ResourceDefinitions,
  Artifacts extends SerializerArtifacts,
> extends SerializerContext<Definitions> {
  artifacts: Artifacts;

  constructor(
    resourceManager: ResourceManager<Definitions>,
    artifacts: Artifacts,
  ) {
    super(resourceManager);
    this.artifacts = artifacts;
  }
}
