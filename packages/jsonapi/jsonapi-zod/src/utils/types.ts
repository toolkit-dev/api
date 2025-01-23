/* -----------------------------------------------------------------------------
 * type utils
 * -------------------------------------------------------------------------- */

/**
 * Ensure that the array is not empty.
 */
export type ArrayWithValue<T> = [T, ...T[]];

/**
 * Strictly enforce that `U` is a subset of `T`.
 */
export type Strict<T, U extends T> = U &
  Record<Exclude<keyof U, keyof T>, never>;
