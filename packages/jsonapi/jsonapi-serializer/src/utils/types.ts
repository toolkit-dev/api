/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { Opaque } from "type-fest";

/* -----------------------------------------------------------------------------
 * type utils
 * -------------------------------------------------------------------------- */

export type GenericObject = { [key: string]: any };

export type ValidatedTypeParams<
  Condition extends boolean,
  ErrorMessage extends string,
  Args extends any[] = [],
> = [Condition] extends [true] ? Args : [Opaque<ErrorMessage, "ERROR">];

export type RequireParam<Param extends any> = Not<ExtendsNever<Param>>;

export type ExtendsUndefined<Value extends any> = Condition<
  Extract<Value, undefined>
>;

export type ExtendsNever<C extends any | never> = [C] extends [never]
  ? true
  : false;

export type Not<Value extends any> = Value extends true ? false : true;

export type Condition<C extends any | never> = [C] extends [never]
  ? false
  : true;

export type Boolean<C extends any | never> = [C] extends [
  undefined | never | null | 0 | false,
]
  ? false
  : true;
