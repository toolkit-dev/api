/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { z } from "zod";

// jsonapi
import { ErrorDocument } from "@jsonapi/types";

// lib
import {
  Condition,
  GenericObject,
  Not,
  ValidatedTypeParams,
} from "../utils/types.js";
import { ErrorInput, ErrorDefinitions, ErrorSerializers } from "../jsonapi.js";
import { ErrorSerializer } from "./error-serializer.js";
import { castToArray } from "../utils/cast-to-array.js";

/* -----------------------------------------------------------------------------
 * ErrorDocumentSerializer types
 * -------------------------------------------------------------------------- */

type ErrorDocumentSerializerType<
  Definitions extends ErrorDefinitions,
  Input extends ErrorInput,
> = (input: Input | Input[]) => keyof Definitions;

type ErrorDocumentSerializerOutputGenerator<
  Input extends ErrorInput,
  Output extends ErrorDocument,
  OutputKey extends keyof Output,
> = (input: Input[] | Input) => Output[OutputKey];

type ErrorDocumentSerializerConfig<
  Definitions extends ErrorDefinitions,
  Input extends ErrorInput<Definitions>,
  Output extends ErrorDocument,
> = {
  type: string | ErrorDocumentSerializerType<Definitions, Input>;
  schema?: z.ZodType<Output, any, any>;
  linksGenerator?: ErrorDocumentSerializerOutputGenerator<
    Input,
    Output,
    "links"
  >;
  metaGenerator?: ErrorDocumentSerializerOutputGenerator<Input, Output, "meta">;
  jsonapiGenerator?: ErrorDocumentSerializerOutputGenerator<
    Input,
    Output,
    "jsonapi"
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

export type ErrorDocumentSerializerBuilderMethods<
  Output extends ErrorDocument = never,
> =
  | ConfigurationMethods
  | OptionalBuilderMethods
  | (Output["links"] extends GenericObject ? "links" : never)
  | (Output["meta"] extends GenericObject ? "meta" : never)
  | (Output["jsonapi"] extends GenericObject ? "jsonapi" : never);

type Chain<
  Definitions extends ErrorDefinitions,
  Input extends ErrorInput<Definitions>,
  Output extends ErrorDocument,
  Methods extends AllMethods,
  Remove extends AllMethods = never,
> = Pick<
  ErrorDocumentSerializerBuilder<
    Definitions,
    Input,
    Output,
    Exclude<Methods, Remove>
  >,
  Exclude<Methods, Remove>
>;

export class ErrorDocumentSerializerBuilder<
  Definitions extends ErrorDefinitions,
  Input extends ErrorInput<Definitions>,
  Output extends ErrorDocument,
  Methods extends AllMethods,
> {
  protected errorSerializersGenerator: () => Promise<
    ErrorSerializers<Definitions>
  >;

  private config: Partial<
    ErrorDocumentSerializerConfig<Definitions, Input, Output>
  > = {};

  constructor(
    errorSerializersGenerator: () => Promise<ErrorSerializers<Definitions>>,
  ) {
    this.errorSerializersGenerator = errorSerializersGenerator;
  }

  public type(
    type: string | ErrorDocumentSerializerType<Definitions, Input>,
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
    linksGenerator: ErrorDocumentSerializerOutputGenerator<
      Input,
      Output,
      "links"
    >,
  ): Chain<Definitions, Input, Output, Methods, "links"> {
    this.config.linksGenerator = linksGenerator;
    return this;
  }

  public meta(
    metaGenerator: ErrorDocumentSerializerOutputGenerator<
      Input,
      Output,
      "meta"
    >,
  ): Chain<Definitions, Input, Output, Methods, "meta"> {
    this.config.metaGenerator = metaGenerator;
    return this;
  }

  public jsonapi(
    jsonapiGenerator: ErrorDocumentSerializerOutputGenerator<
      Input,
      Output,
      "jsonapi"
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
    return new ErrorDocumentSerializer<Definitions, Input, Output>(
      this.errorSerializersGenerator,
      this.config as ErrorDocumentSerializerConfig<Definitions, Input, Output>,
    );
  }
}

/* -----------------------------------------------------------------------------
 * ResourceDocumentSerializer
 * -------------------------------------------------------------------------- */

export class ErrorDocumentSerializer<
  Definitions extends ErrorDefinitions,
  Input extends ErrorInput<Definitions>,
  Output extends ErrorDocument,
> {
  private config: ErrorDocumentSerializerConfig<Definitions, Input, Output>;

  protected errorSerializersGenerator: () => Promise<
    ErrorSerializers<Definitions>
  >;
  protected _serializers?: ErrorSerializers<Definitions>;

  constructor(
    errorSerializersGenerator: () => Promise<ErrorSerializers<Definitions>>,
    config: ErrorDocumentSerializerConfig<Definitions, Input, Output>,
  ) {
    this.errorSerializersGenerator = errorSerializersGenerator;
    this.config = config;
  }

  async getSerializers() {
    return (this._serializers ??= await this.errorSerializersGenerator());
  }

  async serialize<Include extends string = never>(
    input: Input | Input[],
    options: { include?: Include[] } = {},
  ) {
    const serializers = await this.getSerializers();

    type Type = typeof type;
    const type =
      typeof this.config.type === "string"
        ? this.config.type
        : this.config.type(input);

    const serializer = serializers[type] as ErrorSerializer<Definitions, Type>;

    return {
      errors: await serializer.serialize(castToArray(input)),
      jsonapi: this.config.jsonapiGenerator?.(input),
      meta: this.config.metaGenerator?.(input),
      links: this.config.linksGenerator?.(input),
    } as Output;
  }
}
