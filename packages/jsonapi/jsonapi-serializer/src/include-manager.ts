/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import pProps from "p-props";

// jsonapi
import { type Resource, type ResourceIdentifier } from "@jsonapi/types";

// lib
import { castToArray } from "./utils/cast-to-array.js";
import { ResourceDefinitions, ResourceOutput } from "./jsonapi.js";
import { ResourceManager } from "./resource-manager.js";
import { SerializerContext } from "./serializer-context.js";

/* -----------------------------------------------------------------------------
 * IncludeManager
 * -------------------------------------------------------------------------- */

export type IncludeManagerOptions = {
  fetchConcurrency: number;
  serializeConcurrency: number;
};

export type IncludeManagerResolved<
  Definitions extends ResourceDefinitions,
  Include extends string[] | undefined,
> = [Include] extends [undefined] ? undefined : ResourceOutput<Definitions>[];

export class IncludeManager<Definitions extends ResourceDefinitions> {
  resourceManager: ResourceManager<Definitions>;
  options: IncludeManagerOptions;

  constructor(
    resourceManager: ResourceManager<Definitions>,
    options: IncludeManagerOptions,
  ) {
    this.resourceManager = resourceManager;
    this.options = options;
  }

  public async resolve<Include extends string[] | undefined>(
    resource: ResourceOutput<Definitions> | ResourceOutput<Definitions>[],
    include: Include,
    ctx: SerializerContext<Definitions>,
  ): Promise<IncludeManagerResolved<Definitions, Include>> {
    return (
      include
        ? this.resolveIncludes(castToArray(resource), include, ctx)
        : undefined
    ) as IncludeManagerResolved<Definitions, Include>;
  }

  /* ---------------------------------------------------------------------------
   * internals
   * ------------------------------------------------------------------------ */

  protected async resolveIncludes<Include extends string[]>(
    resources: ResourceOutput<Definitions>[],
    include: Include,
    ctx: SerializerContext<Definitions>,
  ) {
    // Example: { "a.b": [resource], "a.x": [resource], "a.b.c": [resource] }
    const resourcesByPath: {
      [pathKey: string]: { [id: string]: ResourceOutput<Definitions> };
    } = {};

    // Add our root resources to the resourcesByPath map.
    const rootPathKey = "~";
    resourcesByPath[rootPathKey] = {};

    for (const resource of resources) {
      resourcesByPath["~"][resource.id] = resource;
    }

    // Example: [["a.b", "a.x"], ["a.b.c", "a.x.y"], ["a.x.y.z"]]
    const levels = this.buildLevels(rootPathKey, include);

    // Because levels are dependent on the previous level, we need to loop over
    // each level and process the resources found at the previous level before
    // proceeding to the next.
    for (const level of levels) {
      // Example: { "a": new Set(), "b": new Set() }
      const flaggedIdsByType = this.resourceManager.createTypeMap(
        () => new Set<string>(),
      );

      // For each path in a level, we need to find the associated resource from
      // the previous level and flag the specified relationship for inclusion.
      // Example: { pathKey: "a.b.c", level: ["a.b.c", "a.x.y"] }
      for (const pathKey of level) {
        // Example - { levelKey: "a.b", relationshipKey: "c" }
        const { levelKey, relationshipKey } = this.parsePathKey(pathKey);

        // loop over resources found at the levelKey (the previous level), and
        // flag ids for the specified relationshipKey (the current level).
        forEachRelatedIdentifier(
          resourcesByPath[levelKey],
          relationshipKey,
          ({ type, id }) => flaggedIdsByType[type].add(id),
        );
      }

      // Resolve all inputs before moving on to serialization step. This allows
      // us to serialize types in batch (all a, then all b, etc.)
      const inputsByType = await pProps(
        flaggedIdsByType,
        (ids, type) => this.resourceManager.resolveInputs(type, [...ids], ctx),
        { concurrency: this.options.fetchConcurrency },
      );

      // This will populate the resourceManager with serialized outputs of all
      // originally flagged ids.
      await pProps(
        inputsByType,
        (inputs, type) =>
          this.resourceManager.resolveOutputs(type, inputs, ctx),
        { concurrency: this.options.serializeConcurrency },
      );

      // Finally, we iterate back through our level one more time and populate
      // the resourcesByPath object with the serialized resources so that it
      // can be utilized in the next level iteration.
      for (const pathKey of level) {
        const { levelKey, relationshipKey } = this.parsePathKey(pathKey);
        resourcesByPath[pathKey] = {};

        forEachRelatedIdentifier(
          resourcesByPath[levelKey],
          relationshipKey,
          ({ type, id }) =>
            (resourcesByPath[pathKey][id] = this.resourceManager.getOutput(
              type,
              id,
            )!),
        );
      }
    }

    // remove rootPathResources as they do not need to be returned as "included"
    delete resourcesByPath[rootPathKey];
    return Object.values(resourcesByPath).map(Object.values).flat();
  }

  protected buildLevels(root: string, include: string[]) {
    const levels: Set<string>[] = [];
    include.forEach((path) => {
      let cur: string = root;
      path.split(".").forEach((name, i) => {
        levels[i] = levels[i] || new Set<string>();
        levels[i].add((cur = `${cur}.${name}`));
      });
    });

    return levels;
  }

  protected parsePathKey(path: string) {
    const lastSeparatorIndex = path.lastIndexOf(".");

    return {
      levelKey: path.substring(0, lastSeparatorIndex),
      relationshipKey: path.substring(lastSeparatorIndex + 1),
    };
  }
}

/* -----------------------------------------------------------------------------
 * utils
 * -------------------------------------------------------------------------- */

const forEachRelatedIdentifier = (
  resources: Record<string, Resource>,
  relationshipKey: string,
  callback: (identifier: ResourceIdentifier) => void,
) => {
  Object.values(resources).forEach(({ relationships }) => {
    const identifier = relationships?.[relationshipKey].data;
    identifier && castToArray(identifier).forEach(callback);
  });
};
