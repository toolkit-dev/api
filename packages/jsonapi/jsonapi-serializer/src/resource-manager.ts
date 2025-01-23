/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { ResourceDefinitions, ResourceSerializers } from "./jsonapi.js";
import { SerializerContext } from "./serializer-context.js";

/* -----------------------------------------------------------------------------
 * ResourceManager
 * -------------------------------------------------------------------------- */

export class ResourceManager<
  Definitions extends ResourceDefinitions = ResourceDefinitions,
> {
  serializers: ResourceSerializers<Definitions>;

  inputs: {
    [Type in keyof Definitions]: Map<string, Definitions[Type]["input"]>;
  };

  outputs: {
    [Type in keyof Definitions]: Map<
      string,
      Definitions[Type]["resourceOutput"]
    >;
  };

  protected _serializersKeys: Array<keyof Definitions> | undefined;
  get serializerKeys() {
    return (this._serializersKeys ??= Object.keys(this.serializers) as Array<
      keyof Definitions
    >);
  }

  constructor(serializers: ResourceSerializers<Definitions>) {
    this.serializers = serializers;
    this.inputs = this.createTypeMap(() => new Map());
    this.outputs = this.createTypeMap(() => new Map());
  }

  public async resolveInputs<Type extends keyof Definitions>(
    type: Type,
    ids: string[],
    ctx: SerializerContext<Definitions>,
  ) {
    const existing = [];
    const identifiersToFetch = [];

    for (const id of ids) {
      const input = this.inputs[type].get(id);
      if (input) {
        existing.push(input);
      } else {
        identifiersToFetch.push(id);
      }
    }

    return [...existing, ...(await this.fetch(type, identifiersToFetch, ctx))];
  }

  public async resolveOutputs<Type extends keyof Definitions>(
    type: Type,
    inputs: Definitions[Type]["input"][],
    ctx: SerializerContext<Definitions>,
  ) {
    const existing = [];
    const inputsToSerialize = [];

    for (const input of inputs) {
      const output = this.outputs[type].get(String(input.id));
      if (output) {
        existing.push(output);
      } else {
        inputsToSerialize.push(input);
      }
    }

    return [
      ...existing,
      ...(await this.serialize(type, inputsToSerialize, ctx.child())),
    ];
  }

  public async fetch<Type extends keyof Definitions>(
    type: Type,
    ids: string[],
    ctx: SerializerContext<Definitions>,
  ) {
    const fetched = ids.length
      ? await this.serializers[type].resolve(ids, ctx)
      : [];

    fetched.forEach((input) => this.addInput(type, input));
    return fetched;
  }

  public async serialize<Type extends keyof Definitions>(
    type: Type,
    inputs: Definitions[Type]["input"][],
    ctx: SerializerContext<Definitions>,
  ) {
    const serialized = inputs.length
      ? await this.serializers[type].serialize(inputs, ctx)
      : [];

    serialized.forEach((output) => this.addOutput(type, output));
    return serialized;
  }

  public addInput<Type extends keyof Definitions>(
    type: Type,
    input: Definitions[Type]["input"],
  ) {
    this.inputs[type].set(String(input.id), input);
    return this;
  }

  public addOutput<Type extends keyof Definitions>(
    type: Type,
    output: Definitions[Type]["resourceOutput"],
  ) {
    this.outputs[type].set(String(output.id), output);
    return this;
  }

  public getInput<Type extends keyof Definitions>(type: Type, id: string) {
    return this.inputs[type].get(String(id));
  }

  public getOutput<Type extends keyof Definitions>(type: Type, id: string) {
    return this.outputs[type].get(String(id));
  }

  public createTypeMap<Type extends any>(
    valueGenerator: (type: keyof ResourceSerializers<Definitions>) => Type,
  ) {
    return this.serializerKeys.reduce(
      (record, type) => Object.assign(record, { [type]: valueGenerator(type) }),
      {} as Record<keyof ResourceSerializers<Definitions>, Type>,
    );
  }
}
