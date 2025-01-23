/* -----------------------------------------------------------------------------
 * castToArray
 * -------------------------------------------------------------------------- */

export function castToArray<ValueType extends any>(
  value: ValueType[] | ValueType | null | undefined,
): ValueType[] {
  return Array.isArray(value)
    ? value
    : typeof value === "undefined" || value === null
      ? []
      : [value];
}
