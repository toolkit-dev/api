/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { Model, DefineModel } from "../model.js";
import { Bar } from "../bar/bar-model.js";
import { quxFields, QuxFields } from "./qux-schema.js";

/* -----------------------------------------------------------------------------
 * Qux
 * -------------------------------------------------------------------------- */

export class Qux extends DefineModel(Model)<QuxFields>() {
  static readonly tableName = "qux";
  readonly resourceName = "qux";
  readonly bar: Bar | undefined;

  static readonly createSchema = quxFields.omit({ id: true });
  static readonly updateSchema = quxFields.partial();

  static get relationMappings() {
    return {
      bar: {
        relation: Model.BelongsToOneRelation,
        modelClass: Bar,
        join: {
          from: `${this.tableName}.barId`,
          to: `${Bar.tableName}.id`,
        },
      },
    };
  }

  static init() {
    return this.knex().schema.createTable(this.tableName, function (table) {
      table.increments("id");
      table.integer("barId").references("id").inTable(Bar.tableName);
      table.text("attr").notNullable();
    });
  }
}
