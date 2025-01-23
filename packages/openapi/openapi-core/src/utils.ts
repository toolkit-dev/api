/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import {
  SetOptional,
  RequiredKeysOf,
  Simplify,
  HasRequiredKeys,
} from "type-fest";

/* -----------------------------------------------------------------------------
 * utils
 * -------------------------------------------------------------------------- */

/**
 * Omit keys from an object.
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }

  return result;
}

/**
 * Get a value from an object but allow passing a key that may not be present.
 */
export function getUnknown<T extends object>(obj: T, key: string) {
  return key in obj ? obj[key as keyof T] : undefined;
}

/* -----------------------------------------------------------------------------
 * type utils
 * -------------------------------------------------------------------------- */

/**
 * Set optional keys from an object but allow passing keys that are not present.
 */
export type SetOptionalLoose<T, Keys extends keyof any> = SetOptional<
  T,
  Keys extends keyof T ? Keys : never
>;

/**
 * Get the required keys of an object but allow passing non-object types.
 */
export type RequiredKeysOfLoose<T> = T extends object
  ? RequiredKeysOf<T>
  : never;

/**
 * Makes object keys optional if they contain an object with no required keys
 */
export type OptionalIfNoRequiredKeys<T extends object> = Simplify<
  {
    [K in keyof T as HasRequiredKeys<T[K] & object> extends true
      ? never
      : K]?: T[K];
  } & {
    [K in keyof T as HasRequiredKeys<T[K] & object> extends true
      ? K
      : never]: T[K];
  }
>;
