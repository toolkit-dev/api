/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { Model, DefineModel } from "../model.js";
import { Foo } from "../foo/foo-model.js";
import { bazFields, BazFields } from "./baz-schema.js";

/* -----------------------------------------------------------------------------
 * Baz Model
 * -------------------------------------------------------------------------- */

export class Baz extends DefineModel(Model)<BazFields>() {
  static readonly tableName = "baz";
  readonly resourceName = "baz";
  readonly foo: Foo | undefined;

  static readonly readSchema = bazFields;
  static readonly createSchema = bazFields.omit({ id: true });
  static readonly updateSchema = bazFields.partial();

  static get relationMappings() {
    return {
      foo: {
        relation: Model.HasOneRelation,
        modelClass: Foo,
        join: {
          from: `${this.tableName}.id`,
          to: `${Foo.tableName}.bazId`,
        },
      },
    };
  }

  static init() {
    return this.knex().schema.createTable(this.tableName, function (table) {
      table.increments("id");
      table.text("value").notNullable();
    });
  }
}
