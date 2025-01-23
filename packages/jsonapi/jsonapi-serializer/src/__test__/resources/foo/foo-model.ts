/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import _ from "lodash";

// lib
import { Model, DefineModel } from "../model.js";
import { Bar } from "../bar/bar-model.js";
import { Baz } from "../baz/baz-model.js";
import { fooFields, FooFields } from "./foo-schema.js";

/* -----------------------------------------------------------------------------
 * Foo Model
 * -------------------------------------------------------------------------- */

export class Foo extends DefineModel(Model)<FooFields>() {
  static readonly tableName = "foo";
  readonly resourceName = "foo";
  readonly bars: Bar[] | undefined;
  readonly baz: Baz | undefined;

  static readonly readSchema = fooFields;
  static readonly createSchema = fooFields.omit({ id: true });
  static readonly updateSchema = fooFields.partial();

  static get relationMappings() {
    return {
      bars: {
        relation: Model.HasManyRelation,
        modelClass: Bar,
        join: {
          from: `${this.tableName}.id`,
          to: `${Bar.tableName}.fooId`,
        },
      },
      baz: {
        relation: Model.BelongsToOneRelation,
        modelClass: Baz,
        join: {
          from: `${this.tableName}.bazId`,
          to: `${Baz.tableName}.id`,
        },
      },
    };
  }

  static async getBarsGroupedByFooId(foos: Foo[]) {
    const { foosWithBars = [], foosWithoutBars = [] } = _.groupBy(
      foos,
      (foo) => (foo.bars ? "foosWithBars" : "foosWithoutBars"),
    );

    const existingBars = foosWithBars.map((foo) => foo.bars || []).flat();
    const fetchedBars = await Bar.query().where({
      fooId: foosWithoutBars.map((foo) => foo.id),
    });

    return _.groupBy([...existingBars, ...fetchedBars], "fooId");
  }

  static async getBazsKeyedByFooId(foos: Foo[]) {
    const { foosWithBaz = [], foosWithoutBaz = [] } = _.groupBy(foos, (foo) =>
      foo.baz ? "foosWithBaz" : "foosWithoutBaz",
    );

    const existingFoosWithBaz = foosWithBaz;
    const fetchedFoosWithBaz = await this.query()
      .findByIds(foosWithoutBaz.map((foo) => foo.id))
      .withGraphJoined("baz");

    return _.mapValues(
      _.keyBy([...existingFoosWithBaz, ...fetchedFoosWithBaz], "id"),
      (foo) => foo.baz!,
    );
  }

  static init() {
    return this.knex().schema.createTable(this.tableName, function (table) {
      table.increments("id");
      table.integer("bazId").references("id").inTable(Baz.tableName);
      table.text("attr").notNullable();
    });
  }
}
