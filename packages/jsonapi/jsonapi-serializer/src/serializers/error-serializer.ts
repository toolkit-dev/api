/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { z } from "zod";
import { Simplify } from "type-fest";

// jsonapi
import { ErrorObject } from "@jsonapi/types";

// lib
import {
  Condition,
  GenericObject,
  Not,
  ValidatedTypeParams,
} from "../utils/types.js";
import { ErrorDefinitions } from "../jsonapi.js";

/* -----------------------------------------------------------------------------
 * ErroreSerializer types
 * -------------------------------------------------------------------------- */

export type ErrorSerializerOutputGenerator<
  Definitions extends ErrorDefinitions,
  Type extends keyof Definitions,
  OutputKey extends keyof Definitions[Type]["objectOutput"],
> = (
  input: Definitions[Type]["input"],
) => Definitions[Type]["objectOutput"][OutputKey];

export type ErrorSerializerTransformer<
  Definitions extends ErrorDefinitions,
  Type extends keyof Definitions,
> = (
  errorObject: Simplify<ErrorSerializerObject<Definitions, Type>>,
  input: Definitions[Type]["input"],
) =>
  | Promise<Definitions[Type]["objectOutput"]>
  | Definitions[Type]["objectOutput"];

export type ErrorSerializerObject<
  Definitions extends ErrorDefinitions,
  Type extends keyof Definitions,
> = Pick<Definitions[Type]["objectOutput"], "links" | "meta" | "id">;

export type ErrorSerializerConfig<
  Definitions extends ErrorDefinitions,
  Type extends keyof Definitions,
> = {
  type?: string;
  schema?: z.ZodType<Definitions[Type]["objectOutput"], any, any>;
  linksGenerator?: ErrorSerializerOutputGenerator<Definitions, Type, "links">;
  metaGenerator?: ErrorSerializerOutputGenerator<Definitions, Type, "meta">;
  transformer?: ErrorSerializerTransformer<Definitions, Type>;
};

/* -----------------------------------------------------------------------------
 * ErrorSerializerBuilder
 * -------------------------------------------------------------------------- */

type AllMethods = ConfigurationMethods | BuilderMethods;
type BuilderMethods = OptionalBuilderMethods;

// NOTE: Should transform be required if the "resource" before transform doesn't
// extend the required output? This questions holds for the error just as much
// as it does for the resource.
type OptionalBuilderMethods = "links" | "meta";
type ConfigurationMethods = "schema" | "transform" | "done";

export type ErrorSerializerBuilderMethods<Output extends ErrorObject = never> =
  | ConfigurationMethods
  | (Output["links"] extends GenericObject ? "links" : never)
  | (Output["meta"] extends GenericObject ? "meta" : never);

type Chain<
  Definitions extends ErrorDefinitions,
  Type extends keyof Definitions,
  Methods extends AllMethods,
  Remove extends AllMethods = never,
> = Pick<
  ErrorSerializerBuilder<Definitions, Type, Exclude<Methods, Remove>>,
  Exclude<Methods, Remove>
>;

export class ErrorSerializerBuilder<
  Definitions extends ErrorDefinitions,
  Type extends keyof Definitions,
  Methods extends AllMethods,
> {
  private config: ErrorSerializerConfig<Definitions, Type> = {};

  public schema(
    schema: z.ZodType<Definitions[Type]["objectOutput"], any, any>,
  ): Chain<Definitions, Type, Methods, "schema"> {
    this.config.schema = schema;
    return this;
  }

  public links(
    linksGenerator: ErrorSerializerOutputGenerator<Definitions, Type, "links">,
  ): Chain<Definitions, Type, Methods, "links"> {
    this.config.linksGenerator = linksGenerator;
    return this;
  }

  public meta(
    metaGenerator: ErrorSerializerOutputGenerator<Definitions, Type, "meta">,
  ): Chain<Definitions, Type, Methods, "meta"> {
    this.config.metaGenerator = metaGenerator;
    return this;
  }

  public transform(
    transformer: ErrorSerializerTransformer<Definitions, Type>,
  ): Chain<Definitions, Type, Methods, "transform"> {
    this.config.transformer = transformer;
    return this;
  }

  public done(
    ...args: ValidatedTypeParams<
      Not<Condition<Extract<Methods, BuilderMethods>>>,
      "The serializer has not been correctly configured. The build steps need produce the specified resource output."
    >
  ): ErrorSerializer<Definitions, Type> {
    return new ErrorSerializer<Definitions, Type>(this.config);
  }
}

/* -----------------------------------------------------------------------------
 * ResourceSerializer
 * -------------------------------------------------------------------------- */

export class ErrorSerializer<
  Definitions extends ErrorDefinitions,
  Type extends keyof Definitions,
> {
  private config: ErrorSerializerConfig<Definitions, Type>;

  constructor(config: ErrorSerializerConfig<Definitions, Type>) {
    this.config = config;
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
  ): Promise<
    SerializeInput extends Array<any>
      ? Definitions[Type]["objectOutput"][]
      : Definitions[Type]["objectOutput"]
  > {
    return (
      Array.isArray(input)
        ? Promise.all(input.map((input) => this._serializeError(input)))
        : this._serializeError(input as Definitions[Type]["input"])
    ) as Promise<
      SerializeInput extends Array<any>
        ? Definitions[Type]["objectOutput"][]
        : Definitions[Type]["objectOutput"]
    >;
  }

  // Note: This internals of this method casts several types manually. While
  // not ideal, we are comfortable with this because the types are validated
  // by the ErrorSerializerBuilder before instantiating this class.
  private async _serializeError(input: Definitions[Type]["input"]) {
    const { id } = input;

    const errorObject = {
      id: String(id),
      links: this.config.linksGenerator?.(input),
      meta: this.config.metaGenerator?.(input),
    } as unknown as ErrorSerializerObject<Definitions, Type>;

    const processedErrorObject = this.config.transformer
      ? await this.config.transformer(errorObject, input)
      : errorObject;

    return this.config.schema
      ? this.config.schema.parse(processedErrorObject)
      : processedErrorObject;
  }
}
