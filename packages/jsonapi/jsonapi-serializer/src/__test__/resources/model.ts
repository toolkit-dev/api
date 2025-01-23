/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { z } from "zod";
import { Model as ObjectionModel, Validator, ValidatorArgs } from "objection";

// lib
import { db } from "../test-db.js";

/* -----------------------------------------------------------------------------
 * Class/Model utils
 * -------------------------------------------------------------------------- */

type Class<InstanceType = {}, StaticType = {}> = (new (
  ...args: any[]
) => InstanceType) &
  StaticType;

export function DefineModel<I1, S1>(
  c1: Class<I1, S1>,
): <I2 extends {}>() => Class<I1 & I2, S1> {
  return function mixedClass<I2 extends {}>() {
    return c1 as unknown as (new (...args: any[]) => I1 & I2) & S1;
  };
}

/* -----------------------------------------------------------------------------
 * BaseModel
 * -------------------------------------------------------------------------- */
class ZodValidator extends Validator {
  constructor(
    protected createSchema?: z.ZodTypeAny,
    protected updateSchema?: z.ZodTypeAny,
  ) {
    super();
  }

  validate({ json, options: { patch } }: ValidatorArgs) {
    return patch && this.updateSchema
      ? this.updateSchema.parse(json)
      : !patch && this.createSchema
        ? this.createSchema.parse(json)
        : json;
  }
}

export class Model extends ObjectionModel {
  static readonly createSchema: z.ZodTypeAny | undefined;
  static readonly updateSchema: z.ZodTypeAny | undefined;

  // https://github.com/Vincit/objection.js/issues/2249
  static createValidator() {
    return new ZodValidator(this.createSchema, this.updateSchema);
  }

  // NOTE: This is a workaround due to objection not correctly using updated
  // values after validation when using insertGraph.
  // See: https://github.com/Vincit/objection.js/issues/1614
  $formatDatabaseJson(json: any) {
    json = this.$validate(json, { patch: true });
    return json;
  }
}

Model.knex(db);
