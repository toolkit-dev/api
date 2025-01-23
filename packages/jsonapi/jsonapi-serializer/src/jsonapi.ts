/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// jsonapi
import {
  ErrorDocument,
  ErrorObject,
  type Relationship,
  type Resource,
  type ResourceDocument,
} from "@jsonapi/types";

// lib
import {
  GenericObject,
  RequireParam,
  ValidatedTypeParams,
} from "./utils/types.js";
import {
  RelationshipSerializerBuilder,
  RelationshipSerializerBuilderMethods,
} from "./serializers/relationship-serializer.js";
import {
  ResourceDocumentSerializerBuilder,
  ResourceDocumentSerializerBuilderMethods,
  ResourceDocumentSerializerOptions,
} from "./serializers/resource-document-serializer.js";
import {
  ResourceSerializer,
  ResourceSerializerBuilder,
  ResourceSerializerBuilderMethods,
} from "./serializers/resource-serializer.js";
import { SerializerArtifacts } from "./serializer-context.js";
import {
  ErrorSerializer,
  ErrorSerializerBuilder,
  ErrorSerializerBuilderMethods,
} from "./serializers/error-serializer.js";
import {
  ErrorDocumentSerializerBuilder,
  ErrorDocumentSerializerBuilderMethods,
} from "./serializers/error-document-serializer.js";

/* -----------------------------------------------------------------------------
 * Jsonapi types
 * -------------------------------------------------------------------------- */

export type ResourceInput<Definitions extends ResourceDefinitions = never> = [
  Definitions,
] extends [never]
  ? Object & { id: string | number }
  : Definitions[keyof Definitions]["input"];

export type ResourceOutput<Definitions extends ResourceDefinitions = never> = [
  Definitions,
] extends [never]
  ? Resource
  : Definitions[keyof Definitions]["resourceOutput"];

export type ErrorInput<Definitions extends ErrorDefinitions = never> = [
  Definitions,
] extends [never]
  ? Error & { id: string | number }
  : Definitions[keyof Definitions]["input"];

export type ResourceDefinition = {
  input: ResourceInput;
  resourceOutput: Resource;
  itemDocumentOutput?: ResourceDocument;
  listDocumentOutput?: ResourceDocument;
  artifacts?: SerializerArtifacts;
};

export type ResourceDefinitions = {
  [key: string]: ResourceDefinition;
};

export type ErrorDefinition = {
  input: ErrorInput;
  objectOutput: ErrorObject;
  documentOutput: ErrorDocument;
};

export type ErrorDefinitions = {
  [key: string]: ErrorDefinition;
};

export type ResourceSerializers<
  Definitions extends ResourceDefinitions = ResourceDefinitions,
> = {
  [Type in keyof Definitions]: ResourceSerializer<Definitions, Type>;
};

export type ErrorSerializers<
  Definitions extends ErrorDefinitions = ErrorDefinitions,
> = {
  [Type in keyof Definitions]: ErrorSerializer<Definitions, Type>;
};

/* -----------------------------------------------------------------------------
 * Jsonapi
 * -------------------------------------------------------------------------- */

type AllMethods = OptionalMethods | ConfigurationMethods;
type OptionalMethods = "fetchConcurrency" | "serializerConcurrency";
type ConfigurationMethods = "done";

type Chain<
  Config extends JsonApiConfig,
  Methods extends AllMethods,
  Remove extends AllMethods = never,
> = Pick<
  JsonapiBuilder<Config, Exclude<Methods, Remove>>,
  Exclude<Methods, Remove>
>;
class JsonapiBuilder<Config extends JsonApiConfig, Methods extends AllMethods> {
  protected options: ResourceDocumentSerializerOptions = {};

  fetchConcurrency(
    fetchConcurrency: number,
  ): Chain<Config, Methods, "fetchConcurrency"> {
    this.options.fetchConcurrency = fetchConcurrency;
    return this;
  }

  serializerConcurrency(
    serializerConcurrency: number,
  ): Chain<Config, Methods, "serializerConcurrency"> {
    this.options.serializerConcurrency = serializerConcurrency;
    return this;
  }

  done() {
    return new Jsonapi({
      fetchConcurrency: this.options.fetchConcurrency,
      serializerConcurrency: this.options.serializerConcurrency,
    }) as Jsonapi<Config>;
  }
}

export function createJsonapi<Config extends JsonApiConfig = never>(
  ...args: ValidatedTypeParams<
    RequireParam<Config>,
    "You must provide Input and Output type parameters: createResourceSerializer<Input, Output>()"
  >
) {
  return new JsonapiBuilder<Config, AllMethods>();
}

/* -----------------------------------------------------------------------------
 * Jsonapi
 * -------------------------------------------------------------------------- */

export type JsonApiConfig = {
  errors: ErrorDefinitions;
  resources: ResourceDefinitions;
};

export class Jsonapi<Config extends JsonApiConfig> {
  protected resourceSerializersGenerator?: () => Promise<
    ResourceSerializers<Config["resources"]>
  >;
  protected errorSerializersGenerator?: () => Promise<
    ErrorSerializers<Config["errors"]>
  >;

  protected options: ResourceDocumentSerializerOptions;

  constructor(options: ResourceDocumentSerializerOptions) {
    this.options = options;
  }

  public registerResourceSerializers(
    resourceSerializersGenerator: () => Promise<
      ResourceSerializers<Config["resources"]>
    >,
  ) {
    this.resourceSerializersGenerator = resourceSerializersGenerator;
    return this;
  }

  public registerErrorSerializers(
    errorSerializersGenerator: () => Promise<
      ErrorSerializers<Config["errors"]>
    >,
  ) {
    this.errorSerializersGenerator = errorSerializersGenerator;
    return this;
  }

  public createResourceDocumentSerializer<
    Type extends Extract<keyof Config["resources"], string>,
    OutputType extends Extract<
      keyof Config["resources"][Type],
      "itemDocumentOutput" | "listDocumentOutput"
    >,
  >(type: Type, outputType: OutputType) {
    type Input = Config["resources"][Type]["input"];
    type Output = Config["resources"][Type] extends {
      [K in OutputType]: ResourceDocument;
    }
      ? Config["resources"][Type][OutputType]
      : never;

    if (!this.resourceSerializersGenerator) {
      throw new Error(
        "You must register serializers before creating a resource document serializer",
      );
    }

    return new ResourceDocumentSerializerBuilder<
      Config["resources"],
      Input,
      Output,
      ResourceDocumentSerializerBuilderMethods<Output>
    >(this.resourceSerializersGenerator, this.options).type(type);
  }

  public createResourceSerializer<
    Type extends Extract<keyof Config["resources"], string>,
  >(type: Type) {
    type Methods = ResourceSerializerBuilderMethods<
      Config["resources"][Type]["resourceOutput"],
      Config["resources"][Type]["artifacts"] extends GenericObject
        ? Config["resources"][Type]["artifacts"]
        : undefined
    >;

    return new ResourceSerializerBuilder<
      Config["resources"],
      Type,
      Methods
    >().type(type);
  }

  public createRelationshipSerializer<
    Type extends Extract<keyof Config["resources"], string>,
    RelationshipKey extends
      keyof Config["resources"][Type]["resourceOutput"]["relationships"],
  >(type: Type, relationshipKey: RelationshipKey) {
    type Methods = RelationshipSerializerBuilderMethods<
      Config["resources"][Type]["resourceOutput"]["relationships"][RelationshipKey] extends Relationship
        ? Config["resources"][Type]["resourceOutput"]["relationships"][RelationshipKey]
        : never
    >;

    return new RelationshipSerializerBuilder<
      Config["resources"],
      Type,
      RelationshipKey,
      Methods
    >();
  }

  public createErrorSerializer<
    Type extends Extract<keyof Config["errors"], string>,
  >(type: Type) {
    type Methods = ErrorSerializerBuilderMethods<
      Config["errors"][Type]["objectOutput"]
    >;

    return new ErrorSerializerBuilder<Config["errors"], Type, Methods>();
  }

  public createErrorDocumentSerializer<
    Type extends Extract<keyof Config["errors"], string>,
  >(type: Type) {
    type Input = Config["errors"][Type]["input"];
    type Output = Config["errors"][Type]["documentOutput"];

    if (!this.errorSerializersGenerator) {
      throw new Error(
        "You must register serializers before creating a error document serializer",
      );
    }

    return new ErrorDocumentSerializerBuilder<
      Config["errors"],
      Input,
      Output,
      ErrorDocumentSerializerBuilderMethods<Output>
    >(this.errorSerializersGenerator).type(type);
  }
}
