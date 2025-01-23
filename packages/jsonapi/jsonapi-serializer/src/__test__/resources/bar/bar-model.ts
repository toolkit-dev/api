/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { Model, DefineModel } from "../model.js";
import { Foo } from "../foo/foo-model.js";
import { barFields, BarFields } from "./bar-schema.js";

/* -----------------------------------------------------------------------------
 * Bar
 * -------------------------------------------------------------------------- */

export class Bar extends DefineModel(Model)<BarFields>() {
  static readonly tableName = "bar";
  readonly resourceName = "bar";
  readonly foo: Foo | undefined;

  static readonly createSchema = barFields.omit({ id: true });
  static readonly updateSchema = barFields.partial();

  static get relationMappings() {
    return {
      foo: {
        relation: Model.BelongsToOneRelation,
        modelClass: Foo,
        join: {
          from: `${this.tableName}.fooId`,
          to: `${Foo.tableName}.id`,
        },
      },
    };
  }

  static init() {
    return this.knex().schema.createTable(this.tableName, function (table) {
      table.increments("id");
      table.integer("fooId").references("id").inTable(Foo.tableName);
      table.text("attr").notNullable();
    });
  }
}
