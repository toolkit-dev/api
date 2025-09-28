/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { beforeEach, describe, expect, test } from "vitest";

// lib
import { resetDb } from "./__test__/test-data.js";
import { resourceSerializersGenerator } from "./__test__/test-jsonapi.js";
import { ResourceManager } from "./resource-manager.js";
import { SerializerContext } from "./serializer-context.js";
import { db } from "./__test__/test-db.js";
import { bazs } from "./__test__/resources/baz/baz-table.js";
import { foos } from "./__test__/resources/foo/foo-table.js";

/* -----------------------------------------------------------------------------
 * ResourceManager
 * -------------------------------------------------------------------------- */

beforeEach(async () => {
  await resetDb();
});

describe("ResourceManager", async () => {
  test("Should be able to add and access inputs", async () => {
    const serializers = await resourceSerializersGenerator();
    const resourceManager = new ResourceManager(serializers);

    const [baz1, baz2] = await db
      .insert(bazs)
      .values([{ value: "baz1" }, { value: "baz2" }])
      .returning();

    const [foo1, foo2] = await db
      .insert(foos)
      .values([
        { bazId: baz1.id, attr: "foo1" },
        { bazId: baz1.id, attr: "foo2" },
      ])
      .returning();

    expect(resourceManager.getInput("baz", baz1.id)).toBeUndefined();
    expect(resourceManager.getInput("baz", baz2.id)).toBeUndefined();
    expect(resourceManager.getInput("foo", foo1.id)).toBeUndefined();
    expect(resourceManager.getInput("foo", foo2.id)).toBeUndefined();

    resourceManager.addInput("baz", baz1);
    expect(resourceManager.getInput("baz", baz1.id)).toBe(baz1);
    expect(resourceManager.getInput("baz", baz2.id)).toBeUndefined();
    expect(resourceManager.getInput("foo", foo1.id)).toBeUndefined();
    expect(resourceManager.getInput("foo", foo2.id)).toBeUndefined();

    resourceManager.addInput("baz", baz2);
    resourceManager.addInput("foo", foo1);
    resourceManager.addInput("foo", foo2);
    expect(resourceManager.getInput("baz", baz1.id)).toBe(baz1);
    expect(resourceManager.getInput("baz", baz2.id)).toBe(baz2);
    expect(resourceManager.getInput("foo", foo1.id)).toBe(foo1);
    expect(resourceManager.getInput("foo", foo2.id)).toBe(foo2);
  });

  test("Should be able to add and access outputs", async () => {
    const serializers = await resourceSerializersGenerator();
    const resourceManager = new ResourceManager(serializers);
    const ctx = new SerializerContext(resourceManager);

    const [baz1, baz2] = await db
      .insert(bazs)
      .values([{ value: "baz1" }, { value: "baz2" }])
      .returning();

    const [foo1, foo2] = await db
      .insert(foos)
      .values([
        { bazId: baz1.id, attr: "foo1" },
        { bazId: baz1.id, attr: "foo2" },
      ])
      .returning();

    const baz1Resource = await serializers.baz.serialize(baz1, ctx);
    const baz2Resource = await serializers.baz.serialize(baz2, ctx);
    const foo1Resource = await serializers.foo.serialize(foo1, ctx);
    const foo2Resource = await serializers.foo.serialize(foo2, ctx);

    expect(resourceManager.getOutput("baz", baz1.id)).toBeUndefined();
    expect(resourceManager.getOutput("baz", baz2.id)).toBeUndefined();
    expect(resourceManager.getOutput("foo", foo1.id)).toBeUndefined();
    expect(resourceManager.getOutput("foo", foo2.id)).toBeUndefined();

    resourceManager.addOutput("baz", baz1Resource);
    expect(resourceManager.getOutput("baz", baz1.id)).toBe(baz1Resource);
    expect(resourceManager.getOutput("baz", baz2.id)).toBeUndefined();
    expect(resourceManager.getOutput("foo", foo1.id)).toBeUndefined();
    expect(resourceManager.getOutput("foo", foo2.id)).toBeUndefined();

    resourceManager.addOutput("baz", baz2Resource);
    resourceManager.addOutput("foo", foo1Resource);
    resourceManager.addOutput("foo", foo2Resource);
    expect(resourceManager.getOutput("baz", baz1.id)).toBe(baz1Resource);
    expect(resourceManager.getOutput("baz", baz2.id)).toBe(baz2Resource);
    expect(resourceManager.getOutput("foo", foo1.id)).toBe(foo1Resource);
    expect(resourceManager.getOutput("foo", foo2.id)).toBe(foo2Resource);
  });

  test("Should resolve inputs by fetching all inputs not already added", async () => {
    const serializers = await resourceSerializersGenerator();
    const resourceManager = new ResourceManager(serializers);
    const ctx = new SerializerContext(resourceManager);

    const [baz1, baz2] = await db
      .insert(bazs)
      .values([{ value: "baz1" }, { value: "baz2" }])
      .returning();

    const [foo1, foo2] = await db
      .insert(foos)
      .values([
        { bazId: baz1.id, attr: "foo1" },
        { bazId: baz1.id, attr: "foo2" },
      ])
      .returning();

    resourceManager.addInput("baz", baz1);
    resourceManager.addInput("foo", foo1);

    expect(resourceManager.getInput("baz", baz1.id)).toBe(baz1);
    expect(resourceManager.getInput("baz", baz2.id)).toBeUndefined();
    expect(resourceManager.getInput("foo", foo1.id)).toBe(foo1);
    expect(resourceManager.getInput("foo", foo2.id)).toBeUndefined();

    const bazInputs = await resourceManager.resolveInputs(
      "baz",
      [baz1.id, baz2.id],
      ctx,
    );

    expect(bazInputs).toEqual([baz1, baz2]);
    expect(resourceManager.getInput("baz", baz1.id)).toBe(baz1);
    expect(resourceManager.getInput("baz", baz2.id)).not.toBe(baz2);
    expect(resourceManager.getInput("baz", baz2.id)).toEqual(baz2);
    expect(resourceManager.getInput("foo", foo1.id)).toBe(foo1);
    expect(resourceManager.getInput("foo", foo2.id)).toBeUndefined();

    const fooInputs = await resourceManager.resolveInputs(
      "foo",
      [foo1.id, foo2.id],
      ctx,
    );

    expect(fooInputs).toEqual([foo1, foo2]);
    expect(resourceManager.getInput("baz", baz1.id)).toBe(baz1);
    expect(resourceManager.getInput("baz", baz2.id)).not.toBe(baz2);
    expect(resourceManager.getInput("baz", baz2.id)).toEqual(baz2);
    expect(resourceManager.getInput("foo", foo1.id)).toBe(foo1);
    expect(resourceManager.getInput("foo", foo2.id)).not.toBe(foo2);
    expect(resourceManager.getInput("foo", foo2.id)).toEqual(foo2);
  });

  test("Should resolve outputs by fetching all outputs not already added", async () => {
    const serializers = await resourceSerializersGenerator();
    const resourceManager = new ResourceManager(serializers);
    const ctx = new SerializerContext(resourceManager);

    const [baz1, baz2] = await db
      .insert(bazs)
      .values([{ value: "baz1" }, { value: "baz2" }])
      .returning();

    const [foo1, foo2] = await db
      .insert(foos)
      .values([
        { bazId: baz1.id, attr: "foo1" },
        { bazId: baz1.id, attr: "foo2" },
      ])
      .returning();

    const baz1Resource = await serializers.baz.serialize(baz1, ctx);
    const baz2Resource = await serializers.baz.serialize(baz2, ctx);
    const foo1Resource = await serializers.foo.serialize(foo1, ctx);
    const foo2Resource = await serializers.foo.serialize(foo2, ctx);

    resourceManager.addOutput("baz", baz1Resource);
    resourceManager.addOutput("foo", foo1Resource);

    expect(resourceManager.getOutput("baz", baz1.id)).toBe(baz1Resource);
    expect(resourceManager.getOutput("baz", baz2.id)).toBeUndefined();
    expect(resourceManager.getOutput("foo", foo1.id)).toBe(foo1Resource);
    expect(resourceManager.getOutput("foo", foo2.id)).toBeUndefined();

    const bazOutputs = await resourceManager.resolveOutputs(
      "baz",
      [baz1, baz2],
      ctx,
    );

    expect(bazOutputs).toEqual([baz1Resource, baz2Resource]);
    expect(resourceManager.getOutput("baz", baz1.id)).toBe(baz1Resource);
    expect(resourceManager.getOutput("baz", baz2.id)).not.toBe(baz2Resource);
    expect(resourceManager.getOutput("baz", baz2.id)).toEqual(baz2Resource);
    expect(resourceManager.getOutput("foo", foo1.id)).toBe(foo1Resource);
    expect(resourceManager.getOutput("foo", foo2.id)).toBeUndefined();

    const fooOutputs = await resourceManager.resolveOutputs(
      "foo",
      [foo1, foo2],
      ctx,
    );

    expect(fooOutputs).toEqual([foo1Resource, foo2Resource]);
    expect(resourceManager.getOutput("baz", baz1.id)).toBe(baz1Resource);
    expect(resourceManager.getOutput("baz", baz2.id)).not.toBe(baz2Resource);
    expect(resourceManager.getOutput("baz", baz2.id)).toEqual(baz2Resource);
    expect(resourceManager.getOutput("foo", foo1.id)).toBe(foo1Resource);
    expect(resourceManager.getOutput("foo", foo2.id)).not.toBe(foo2Resource);
    expect(resourceManager.getOutput("foo", foo2.id)).toEqual(foo2Resource);
  });
});
