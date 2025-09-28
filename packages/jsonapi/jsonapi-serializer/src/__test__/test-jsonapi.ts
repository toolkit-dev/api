/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { createJsonapi, ResourceSerializers } from "../jsonapi.js";
import { Bar, BarResource } from "./resources/bar/bar-schema.js";
import { Baz, BazResource } from "./resources/baz/baz-schema.js";
import {
  Foo,
  FooArtifacts,
  FooDocument,
  FooResource,
} from "./resources/foo/foo-schema.js";
import { Qux, QuxResource } from "./resources/qux/qux-schema.js";

/* -----------------------------------------------------------------------------
 * test jsonapi
 * -------------------------------------------------------------------------- */

export type Definitions = {
  bar: { input: Bar; resourceOutput: BarResource };
  baz: { input: Baz; resourceOutput: BazResource };
  foo: {
    input: Foo;
    resourceOutput: FooResource;
    itemDocumentOutput: FooDocument;
    artifacts: FooArtifacts;
  };
  qux: { input: Qux; resourceOutput: QuxResource };
};

export const jsonapi = createJsonapi<{
  resources: Definitions;
  errors: {};
}>()
  .fetchConcurrency(10)
  .serializerConcurrency(10)
  .done();

export const resourceSerializersGenerator: () => Promise<
  ResourceSerializers<Definitions>
> = async () => {
  const [bar, baz, foo, qux] = await Promise.all([
    import("./resources/bar/bar-serializer.js"),
    import("./resources/baz/baz-serializer.js"),
    import("./resources/foo/foo-serializer.js"),
    import("./resources/qux/qux-serializer.js"),
  ]);

  return {
    bar: bar.barSerializer,
    baz: baz.bazSerializer,
    foo: foo.fooSerializer,
    qux: qux.quxSerializer,
  };
};

jsonapi.registerResourceSerializers(resourceSerializersGenerator);

// TODO: Implement debugging
// TODO: Implement otel tracing
// serializeDocument
// serializeResource
// resolveIncludedResources
// resolveLevel (1)
// resolveLevel (2)
