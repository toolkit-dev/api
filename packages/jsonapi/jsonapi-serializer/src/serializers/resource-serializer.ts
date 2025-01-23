/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { z } from "zod";
import { ConditionalPick, Jsonifiable, Simplify } from "type-fest";

// jsonapi
import { type Resource } from "@jsonapi/types";

// lib
import {
  Condition,
  GenericObject,
  Not,
  ValidatedTypeParams,
} from "../utils/types.js";
import {
  SerializerContext,
  SerializerArtifacts,
  SerializerContextDecorated,
} from "../serializer-context.js";
import { ResourceDefinitions } from "../jsonapi.js";

/* -----------------------------------------------------------------------------
 * ResourceSerializer types
 * -------------------------------------------------------------------------- */

export type ResourceSerializerResolver<
  Definitions extends ResourceDefinitions,
  Type extends keyof Definitions,
> = (
  ids: string[],
  ctx: SerializerContext<Definitions>,
) => Promise<Definitions[Type]["input"][]>;

export type ResourceSerializerArtifactsGenerator<
  Definitions extends ResourceDefinitions,
  Type extends keyof Definitions,
> = (
  inputs: Definitions[Type]["input"][],
  ctx: SerializerContext<Definitions>,
) => Promise<Definitions[Type]["artifacts"]> | Definitions[Type]["artifacts"];

export type ResourceSerializerStoreGenerator<
  Definitions extends ResourceDefinitions,
  Type extends keyof Definitions,
> = (
  inputs: Definitions[Type]["input"][],
  ctx: SerializerContextDecorated<Definitions, Definitions[Type]["artifacts"]>,
) => {
  [Type in keyof Definitions]?: Array<Definitions[Type]["input"] | undefined>;
};

export type ResourceSerializerOutputGenerator<
  Definitions extends ResourceDefinitions,
  Type extends keyof Definitions,
  OutputKey extends keyof Definitions[Type]["resourceOutput"],
> = (
  input: Definitions[Type]["input"],
  ctx: SerializerContextDecorated<Definitions, Definitions[Type]["artifacts"]>,
) => Definitions[Type]["resourceOutput"][OutputKey];

export type ResourceSerializerTransformer<
  Definitions extends ResourceDefinitions,
  Type extends keyof Definitions,
> = (
  resource: Simplify<ResourceSerializerResource<Definitions, Type>>,
  input: Definitions[Type]["input"],
  ctx: SerializerContextDecorated<Definitions, Definitions[Type]["artifacts"]>,
) =>
  | Promise<Definitions[Type]["resourceOutput"]>
  | Definitions[Type]["resourceOutput"];

export type ResourceSerializerResource<
  Definitions extends ResourceDefinitions,
  Type extends keyof Definitions,
> = Omit<Definitions[Type]["resourceOutput"], "attributes"> & {
  attributes: Simplify<
    ConditionalPick<Omit<Definitions[Type]["input"], "id">, Jsonifiable>
  >;
};

export type ResourceSerializerConfig<
  Definitions extends ResourceDefinitions,
  Type extends keyof Definitions,
> = {
  type?: string;
  schema?: z.ZodType<Definitions[Type]["resourceOutput"], any, any>;
  resolver?: ResourceSerializerResolver<Definitions, Type>;
  artifactsGenerator?: ResourceSerializerArtifactsGenerator<Definitions, Type>;
  storeGenerator?: ResourceSerializerStoreGenerator<Definitions, Type>;
  relationshipsGenerator?: ResourceSerializerOutputGenerator<
    Definitions,
    Type,
    "relationships"
  >;
  linksGenerator?: ResourceSerializerOutputGenerator<
    Definitions,
    Type,
    "links"
  >;
  metaGenerator?: ResourceSerializerOutputGenerator<Definitions, Type, "meta">;
  transformer?: ResourceSerializerTransformer<Definitions, Type>;
};

/* -----------------------------------------------------------------------------
 * ResourceSerializerBuilder
 * -------------------------------------------------------------------------- */

type AllMethods = ConfigurationMethods | BuilderMethods;
type BuilderMethods = RequiredBuilderMethods | OptionalBuilderMethods;

type RequiredBuilderMethods = "type";
type OptionalBuilderMethods = "artifacts" | "relationships" | "links" | "meta";
type ConfigurationMethods =
  | "schema"
  | "resolver"
  | "transform"
  | "store"
  | "done";

export type ResourceSerializerBuilderMethods<
  Output extends Resource = never,
  Artifacts extends SerializerArtifacts = undefined,
> =
  | ConfigurationMethods
  | RequiredBuilderMethods
  | (Output["links"] extends GenericObject ? "links" : never)
  | (Output["meta"] extends GenericObject ? "meta" : never)
  | (Output["relationships"] extends GenericObject ? "relationships" : never)
  | (Artifacts extends GenericObject ? "artifacts" : never);

type Chain<
  Definitions extends ResourceDefinitions,
  Type extends keyof Definitions,
  Methods extends AllMethods,
  Remove extends AllMethods = never,
> = Pick<
  ResourceSerializerBuilder<Definitions, Type, Exclude<Methods, Remove>>,
  Exclude<Methods, Remove>
>;

export class ResourceSerializerBuilder<
  Definitions extends ResourceDefinitions,
  Type extends keyof Definitions,
  Methods extends AllMethods,
> {
  private config: ResourceSerializerConfig<Definitions, Type> = {};

  public type(type: string): Chain<Definitions, Type, Methods, "type"> {
    this.config.type = type;
    return this;
  }

  public schema(
    schema: z.ZodType<Definitions[Type]["resourceOutput"], any, any>,
  ): Chain<Definitions, Type, Methods, "schema"> {
    this.config.schema = schema;
    return this;
  }

  public resolver(
    resolver: ResourceSerializerResolver<Definitions, Type>,
  ): Chain<Definitions, Type, Methods, "resolver"> {
    this.config.resolver = resolver;
    return this;
  }

  public artifacts(
    artifactsGenerator: ResourceSerializerArtifactsGenerator<Definitions, Type>,
  ): Chain<Definitions, Type, Methods, "artifacts"> {
    this.config.artifactsGenerator = artifactsGenerator;
    return this;
  }

  public store(
    storeGenerator: ResourceSerializerStoreGenerator<Definitions, Type>,
  ): Chain<Definitions, Type, Methods, "store"> {
    this.config.storeGenerator = storeGenerator;
    return this;
  }

  public relationships(
    relationshipsGenerator: ResourceSerializerOutputGenerator<
      Definitions,
      Type,
      "relationships"
    >,
  ): Chain<Definitions, Type, Methods, "relationships"> {
    this.config.relationshipsGenerator = relationshipsGenerator;
    return this;
  }

  public links(
    linksGenerator: ResourceSerializerOutputGenerator<
      Definitions,
      Type,
      "links"
    >,
  ): Chain<Definitions, Type, Methods, "links"> {
    this.config.linksGenerator = linksGenerator;
    return this;
  }

  public meta(
    metaGenerator: ResourceSerializerOutputGenerator<Definitions, Type, "meta">,
  ): Chain<Definitions, Type, Methods, "meta"> {
    this.config.metaGenerator = metaGenerator;
    return this;
  }

  public transform(
    transformer: ResourceSerializerTransformer<Definitions, Type>,
  ): Chain<Definitions, Type, Methods, "transform"> {
    this.config.transformer = transformer;
    return this;
  }

  public done(
    ...args: ValidatedTypeParams<
      Not<Condition<Extract<Methods, BuilderMethods>>>,
      "The serializer has not been correctly configured. The build steps need produce the specified resource output."
    >
  ): ResourceSerializer<Definitions, Type> {
    return new ResourceSerializer<Definitions, Type>(this.config);
  }
}

/* -----------------------------------------------------------------------------
 * ResourceSerializer
 * -------------------------------------------------------------------------- */

export class ResourceSerializer<
  Definitions extends ResourceDefinitions,
  Type extends keyof Definitions,
> {
  private config: ResourceSerializerConfig<Definitions, Type>;

  constructor(config: ResourceSerializerConfig<Definitions, Type>) {
    this.config = config;
  }

  public resolve(ids: string[], ctx: SerializerContext<Definitions>) {
    if (!this.config.resolver) {
      throw new Error("No resolver has been configured for this serializer.");
    }

    return this.config.resolver(ids, ctx);
  }

  // Note: The implementation if this function is a unwieldy but it results in
  // a very nice API for the user. The user can call serialize with either a
  // single resource or an array of resources and the return type will be
  // inferred correctly.
  public serialize<
    SerializeInput extends
      | Definitions[Type]["input"]
      | Definitions[Type]["input"][],
  >(
    input: SerializeInput,
    ctx: SerializerContext<Definitions>,
  ): Promise<
    SerializeInput extends Array<any>
      ? Definitions[Type]["resourceOutput"][]
      : Definitions[Type]["resourceOutput"]
  > {
    return (
      Array.isArray(input)
        ? Promise.all(input.map((input) => this._serializeResource(input, ctx)))
        : this._serializeResource(input as Definitions[Type]["input"], ctx)
    ) as Promise<
      SerializeInput extends Array<any>
        ? Definitions[Type]["resourceOutput"][]
        : Definitions[Type]["resourceOutput"]
    >;
  }

  // Note: This internals of this method casts several types manually. While
  // not ideal, we are comfortable with this because the types are validated
  // by the ResourceSerializerBuilder before instantiating this class.
  private async _serializeResource(
    input: Definitions[Type]["input"],
    ctx: SerializerContext<Definitions>,
  ) {
    const { id, ...attributes } = input;
    const decoratedCtx = ctx.addArtifacts(
      await this.config.artifactsGenerator?.([input], ctx)!,
    );

    const resource = {
      type: this.config.type!,
      id: String(id),
      attributes,
      links: this.config.linksGenerator?.(input, decoratedCtx),
      relationships: this.config.relationshipsGenerator?.(input, decoratedCtx),
      meta: this.config.metaGenerator?.(input, decoratedCtx),
    } as unknown as ResourceSerializerResource<Definitions, Type>;

    const processedResource = this.config.transformer
      ? await this.config.transformer(resource, input, decoratedCtx)
      : resource;

    return this.config.schema
      ? this.config.schema.parse(processedResource)
      : processedResource;
  }
}
