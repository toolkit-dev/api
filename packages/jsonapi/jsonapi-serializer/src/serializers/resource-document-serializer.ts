/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { z } from "zod";

// jsonapi
import { Resource, type ResourceDocument } from "@jsonapi/types";

// lib
import {
  Condition,
  GenericObject,
  Not,
  ValidatedTypeParams,
} from "../utils/types.js";
import { SerializerContext } from "../serializer-context.js";
import {
  ResourceSerializers,
  ResourceDefinitions,
  ResourceInput,
} from "../jsonapi.js";
import { IncludeManager } from "../include-manager.js";
import { ResourceManager } from "../resource-manager.js";
import { ResourceSerializer } from "./resource-serializer.js";

/* -----------------------------------------------------------------------------
 * ResourceDocumentSerializer types
 * -------------------------------------------------------------------------- */

export type ResourceDocumentSerializerOptions = {
  fetchConcurrency?: number;
  serializerConcurrency?: number;
};

type ResourceDocumentSerializerInput<
  Input extends ResourceInput,
  Output extends ResourceDocument,
> = Output["data"] extends Resource[] ? Input[] : Input;

type ResourceDocumentSerializerType<
  Definitions extends ResourceDefinitions,
  Input extends ResourceInput,
  Output extends ResourceDocument,
> = (
  input: ResourceDocumentSerializerInput<Input, Output>,
  ctx: SerializerContext<Definitions>,
) => keyof Definitions;

type ResourceDocumentSerializerOutputGenerator<
  Definitions extends ResourceDefinitions,
  Input extends ResourceInput,
  Output extends ResourceDocument,
  GeneratorOutput extends GenericObject | undefined,
> = (
  input: ResourceDocumentSerializerInput<Input, Output>,
  ctx: SerializerContext<Definitions>,
) => GeneratorOutput;

type ResourceDocumentSerializerConfig<
  Definitions extends ResourceDefinitions,
  Input extends ResourceInput<Definitions>,
  Output extends ResourceDocument,
> = {
  type: string | ResourceDocumentSerializerType<Definitions, Input, Output>;
  schema?: z.ZodType<Output, any, any>;
  linksGenerator?: ResourceDocumentSerializerOutputGenerator<
    Definitions,
    Input,
    Output,
    Output["links"]
  >;
  metaGenerator?: ResourceDocumentSerializerOutputGenerator<
    Definitions,
    Input,
    Output,
    Output["meta"]
  >;
  jsonapiGenerator?: ResourceDocumentSerializerOutputGenerator<
    Definitions,
    Input,
    Output,
    Output["jsonapi"]
  >;
};

/* -----------------------------------------------------------------------------
 * ResourceDocumentSerializerBuilder
 * -------------------------------------------------------------------------- */

type AllMethods = ConfigurationMethods | BuilderMethods;
type BuilderMethods = OptionalBuilderMethods | AvailableBuilderMethods;

type OptionalBuilderMethods = "type";
type AvailableBuilderMethods = "jsonapi" | "links" | "meta";
type ConfigurationMethods = "schema" | "done";

export type ResourceDocumentSerializerBuilderMethods<
  Output extends ResourceDocument = never,
> =
  | ConfigurationMethods
  | OptionalBuilderMethods
  | (Output["links"] extends GenericObject ? "links" : never)
  | (Output["meta"] extends GenericObject ? "meta" : never)
  | (Output["jsonapi"] extends GenericObject ? "jsonapi" : never);

type Chain<
  Definitions extends ResourceDefinitions,
  Input extends ResourceInput<Definitions>,
  Output extends ResourceDocument,
  Methods extends AllMethods,
  Remove extends AllMethods = never,
> = Pick<
  ResourceDocumentSerializerBuilder<
    Definitions,
    Input,
    Output,
    Exclude<Methods, Remove>
  >,
  Exclude<Methods, Remove>
>;

export class ResourceDocumentSerializerBuilder<
  Definitions extends ResourceDefinitions,
  Input extends ResourceInput<Definitions>,
  Output extends ResourceDocument,
  Methods extends AllMethods,
> {
  private options: ResourceDocumentSerializerOptions;
  protected resourceSerializersGenerator: () => Promise<
    ResourceSerializers<Definitions>
  >;
  private config: Partial<
    ResourceDocumentSerializerConfig<Definitions, Input, Output>
  > = {};

  constructor(
    resourceSerializersGenerator: () => Promise<
      ResourceSerializers<Definitions>
    >,
    options: ResourceDocumentSerializerOptions,
  ) {
    this.resourceSerializersGenerator = resourceSerializersGenerator;
    this.options = options;
  }

  public type(
    type: string | ResourceDocumentSerializerType<Definitions, Input, Output>,
  ): Chain<Definitions, Input, Output, Methods, "type"> {
    this.config.type = type;
    return this;
  }

  public schema(
    schema: z.ZodType<Output, any, any>,
  ): Chain<Definitions, Input, Output, Methods, "schema"> {
    this.config.schema = schema;
    return this;
  }

  public links(
    linksGenerator: ResourceDocumentSerializerOutputGenerator<
      Definitions,
      Input,
      Output,
      Output["links"]
    >,
  ): Chain<Definitions, Input, Output, Methods, "links"> {
    this.config.linksGenerator = linksGenerator;
    return this;
  }

  public meta(
    metaGenerator: ResourceDocumentSerializerOutputGenerator<
      Definitions,
      Input,
      Output,
      Output["meta"]
    >,
  ): Chain<Definitions, Input, Output, Methods, "meta"> {
    this.config.metaGenerator = metaGenerator;
    return this;
  }

  public jsonapi(
    jsonapiGenerator: ResourceDocumentSerializerOutputGenerator<
      Definitions,
      Input,
      Output,
      Output["jsonapi"]
    >,
  ): Chain<Definitions, Input, Output, Methods, "meta"> {
    this.config.jsonapiGenerator = jsonapiGenerator;
    return this;
  }

  public done(
    ...args: ValidatedTypeParams<
      Not<Condition<Extract<Methods, BuilderMethods>>>,
      "The serializer has not been correctly configured. The build steps need produce the specified resource document output."
    >
  ) {
    return new ResourceDocumentSerializer<Definitions, Input, Output>(
      this.resourceSerializersGenerator,
      this.options,
      this.config as ResourceDocumentSerializerConfig<
        Definitions,
        Input,
        Output
      >,
    );
  }
}

/* -----------------------------------------------------------------------------
 * ResourceDocumentSerializer
 * -------------------------------------------------------------------------- */

export class ResourceDocumentSerializer<
  Definitions extends ResourceDefinitions,
  Input extends ResourceInput<Definitions>,
  Output extends ResourceDocument,
> {
  private config: ResourceDocumentSerializerConfig<Definitions, Input, Output>;
  protected options: ResourceDocumentSerializerOptions;

  protected resourceSerializersGenerator: () => Promise<
    ResourceSerializers<Definitions>
  >;
  protected _serializers?: ResourceSerializers<Definitions>;

  constructor(
    resourceSerializersGenerator: () => Promise<
      ResourceSerializers<Definitions>
    >,
    options: ResourceDocumentSerializerOptions,
    config: ResourceDocumentSerializerConfig<Definitions, Input, Output>,
  ) {
    this.resourceSerializersGenerator = resourceSerializersGenerator;
    this.options = options;
    this.config = config;
  }

  async getSerializers() {
    return (this._serializers ??= await this.resourceSerializersGenerator());
  }

  async serialize<Include extends string = never>(
    input: ResourceDocumentSerializerInput<Input, Output>,
    options: { include?: Include[] } = {},
  ) {
    const serializers = await this.getSerializers();
    const resourceManager = new ResourceManager<Definitions>(serializers);
    const ctx = new SerializerContext<Definitions>(resourceManager);

    type Type = typeof type;
    const type =
      typeof this.config.type === "string"
        ? this.config.type
        : this.config.type(input, ctx);

    const serializer = serializers[type] as ResourceSerializer<
      Definitions,
      Type
    >;
    const document = {
      data: await serializer.serialize(input, ctx),
      jsonapi: this.config.jsonapiGenerator?.(input, ctx),
      meta: this.config.metaGenerator?.(input, ctx),
      links: this.config.linksGenerator?.(input, ctx),
    };

    const include = options?.include as [Include] extends [never]
      ? undefined
      : Include[];

    const includeManager = new IncludeManager<Definitions>(resourceManager, {
      fetchConcurrency: this.options.fetchConcurrency || 10,
      serializeConcurrency: this.options.serializerConcurrency || 10,
    });

    // Override included because we can be smarter based on what was passed in
    // TODO: investigate why this is cast is needed
    return Object.assign(document as unknown as Output, {
      included: await includeManager.resolve(document.data, include, ctx),
    });
  }
}
