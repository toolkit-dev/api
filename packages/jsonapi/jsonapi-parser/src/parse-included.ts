/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// jsonapi
import { Resource, ResourceIdentifier } from "@jsonapi/types";

/* -----------------------------------------------------------------------------
 * parseIncluded
 * -------------------------------------------------------------------------- */

export function parseIncluded<I extends Resource[] | undefined>(included: I) {
  const lookup: Record<string, Record<string, Resource>> = {};
  included?.forEach((resource) => {
    lookup[resource.type] = lookup[resource.type] || {};
    lookup[resource.type][resource.id] = resource;
  });

  function get<
    R extends Resource,
    N extends RelationshipNames<R>,
    K extends RelationshipKey<R, N, I> | undefined = undefined,
  >(
    resource: R,
    name: N,
    key?: K,
  ): I extends undefined
    ? GetValueReturn<R, N, I, K> | undefined
    : GetValueReturn<R, N, I, K> {
    const data = resource.relationships?.[name]?.data;
    const getValue = (type: string, id: string) => {
      if (key === "id") {
        return id;
      } else if (key === "type") {
        return type;
      } else if (key?.startsWith("attributes.")) {
        return lookup[type]?.[id]?.attributes?.[key.split(".")[1]];
      }

      return lookup[type]?.[id];
    };

    return (
      Array.isArray(data)
        ? data.map(({ type, id }) => getValue(type, id))
        : data
          ? getValue(data.type, data.id)
          : undefined
    ) as any;
  }

  return {
    get,
  };
}

/* -----------------------------------------------------------------------------
 * type utils
 * -------------------------------------------------------------------------- */

type RelationshipNames<R extends Resource> = keyof R["relationships"];

type RelationshipType<
  R extends Resource,
  N extends RelationshipNames<R>,
> = R["relationships"][N] extends { data: ResourceIdentifier[] }
  ? R["relationships"][N]["data"][number]["type"]
  : R["relationships"][N] extends { data: ResourceIdentifier }
    ? R["relationships"][N]["data"]["type"]
    : never;

type RelationshipKey<
  R extends Resource,
  N extends RelationshipNames<R>,
  I extends Resource[] | undefined,
> = "id" | "type" | `attributes.${RelationshipAttributes<R, N, I>}`;

type RelationshipAttributes<
  R extends Resource,
  N extends RelationshipNames<R>,
  I extends Resource[] | undefined,
> = ExtractResourceAttributeKeys<RelationshipType<R, N>, I>;

type ExtractResource<
  T extends string,
  R extends Resource[] | undefined,
> = R extends { type: T }[] ? R[number] : never;

type ExtractResourceAttribute<
  T extends string,
  R extends Resource[] | undefined,
  K extends string,
> = R extends { type: T; attributes: { [key in K]: infer A } }[] ? A : never;

type ExtractResourceAttributeKeys<
  T extends string,
  R extends Resource[] | undefined,
> = R extends { type: T; attributes: infer A }[] ? keyof A : never;

type GetValueReturn<
  R extends Resource,
  N extends RelationshipNames<R>,
  I extends Resource[] | undefined,
  K extends RelationshipKey<R, N, I> | undefined = undefined,
> = R["relationships"][N] extends { data: ResourceIdentifier[] }
  ? GetValueType<R, N, I, K>[]
  : R["relationships"][N] extends { data: ResourceIdentifier }
    ? GetValueType<R, N, I, K>
    : undefined;

type GetValueType<
  R extends Resource,
  N extends RelationshipNames<R>,
  I extends Resource[] | undefined,
  K extends RelationshipKey<R, N, I> | undefined = undefined,
> = K extends "id" | "type"
  ? string
  : K extends `attributes.${infer A}`
    ? ExtractResourceAttribute<RelationshipType<R, N>, I, A>
    : ExtractResource<RelationshipType<R, N>, I>;
