/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// jsonapi
import { type Relationship } from "@jsonapi/types";

// lib
import {
  Condition,
  GenericObject,
  Not,
  ValidatedTypeParams,
} from "../utils/types.js";
import { SerializerContextDecorated } from "../serializer-context.js";
import { ResourceDefinitions } from "../jsonapi.js";

/* -----------------------------------------------------------------------------
 * ResourceSerializerRelationship types
 * -------------------------------------------------------------------------- */

export type RelationshipSerializerOutputGenerator<
  Definitions extends ResourceDefinitions,
  Type extends keyof Definitions,
  RelationshipKey extends
    keyof Definitions[Type]["resourceOutput"]["relationships"],
  OutputKey extends string,
> = (
  input: Definitions[Type]["input"],
  ctx: SerializerContextDecorated<Definitions, Definitions[Type]["artifacts"]>,
) => Definitions[Type]["resourceOutput"]["relationships"][RelationshipKey] extends {
  [key in OutputKey]: any;
}
  ? Definitions[Type]["resourceOutput"]["relationships"][RelationshipKey][OutputKey]
  : never;

export type RelationshipSerializerConfig<
  Definitions extends ResourceDefinitions,
  Type extends keyof Definitions,
  RelationshipKey extends
    keyof Definitions[Type]["resourceOutput"]["relationships"],
> = {
  type?: string;
  dataGenerator?: RelationshipSerializerOutputGenerator<
    Definitions,
    Type,
    RelationshipKey,
    "data"
  >;
  linksGenerator?: RelationshipSerializerOutputGenerator<
    Definitions,
    Type,
    RelationshipKey,
    "links"
  >;
  metaGenerator?: RelationshipSerializerOutputGenerator<
    Definitions,
    Type,
    RelationshipKey,
    "meta"
  >;
};

/* -----------------------------------------------------------------------------
 * RelationshipSerializerBuilder
 * -------------------------------------------------------------------------- */

type AllMethods = ConfigurationMethods | BuilderMethods;

type BuilderMethods = "data" | "links" | "meta";
type ConfigurationMethods = "done";

export type RelationshipSerializerBuilderMethods<
  Output extends Relationship = never,
> =
  | ConfigurationMethods
  | (Output["data"] extends GenericObject | null ? "data" : never)
  | (Output["links"] extends GenericObject | null ? "links" : never)
  | (Output["meta"] extends GenericObject | null ? "meta" : never);

type Chain<
  Definitions extends ResourceDefinitions,
  Type extends keyof Definitions,
  RelationshipKey extends
    keyof Definitions[Type]["resourceOutput"]["relationships"],
  Methods extends AllMethods,
  Remove extends AllMethods = never,
> = Pick<
  RelationshipSerializerBuilder<
    Definitions,
    Type,
    RelationshipKey,
    Exclude<Methods, Remove>
  >,
  Exclude<Methods, Remove>
>;

export class RelationshipSerializerBuilder<
  Definitions extends ResourceDefinitions,
  Type extends keyof Definitions,
  RelationshipKey extends
    keyof Definitions[Type]["resourceOutput"]["relationships"],
  Methods extends AllMethods,
> {
  private config: RelationshipSerializerConfig<
    Definitions,
    Type,
    RelationshipKey
  > = {};

  public data(
    dataGenerator: RelationshipSerializerOutputGenerator<
      Definitions,
      Type,
      RelationshipKey,
      "data"
    >,
  ): Chain<Definitions, Type, RelationshipKey, Methods, "data"> {
    this.config.dataGenerator = dataGenerator;
    return this;
  }

  public links(
    linksGenerator: RelationshipSerializerOutputGenerator<
      Definitions,
      Type,
      RelationshipKey,
      "links"
    >,
  ): Chain<Definitions, Type, RelationshipKey, Methods, "links"> {
    this.config.linksGenerator = linksGenerator;
    return this;
  }

  public meta(
    metaGenerator: RelationshipSerializerOutputGenerator<
      Definitions,
      Type,
      RelationshipKey,
      "meta"
    >,
  ): Chain<Definitions, Type, RelationshipKey, Methods, "meta"> {
    this.config.metaGenerator = metaGenerator;
    return this;
  }

  public done(
    ...args: ValidatedTypeParams<
      Not<Condition<Extract<Methods, BuilderMethods>>>,
      "The serializer has not been correctly configured. The build steps need produce the specified relationship output."
    >
  ) {
    return new RelationshipSerializer<Definitions, Type, RelationshipKey>(
      this.config,
    );
  }
}

/* -----------------------------------------------------------------------------
 * RelationshipsSerializer
 * -------------------------------------------------------------------------- */

class RelationshipSerializer<
  Definitions extends ResourceDefinitions,
  Type extends keyof Definitions,
  RelationshipKey extends
    keyof Definitions[Type]["resourceOutput"]["relationships"],
> {
  public config: RelationshipSerializerConfig<
    Definitions,
    Type,
    RelationshipKey
  >;

  constructor(
    config: RelationshipSerializerConfig<Definitions, Type, RelationshipKey>,
  ) {
    this.config = config;
  }

  // Note: This internals of this method casts our return type manually. While
  // not ideal, we are comfortable with this because the types are validated
  // by the RelationshipSerializerBuilder before instantiating this class.
  public serialize(
    input: Definitions[Type]["input"],
    ctx: SerializerContextDecorated<
      Definitions,
      Definitions[Type]["artifacts"]
    >,
  ) {
    return {
      data: this.config.dataGenerator?.(input, ctx),
      links: this.config.linksGenerator?.(input, ctx),
      meta: this.config.metaGenerator?.(input, ctx),
    } as Definitions[Type]["resourceOutput"]["relationships"][RelationshipKey];
  }
}
