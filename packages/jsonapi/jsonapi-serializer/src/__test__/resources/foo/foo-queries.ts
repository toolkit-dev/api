/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { inArray } from "drizzle-orm";
import _ from "lodash";

// lib
import { db } from "../../test-db.js";
import { bars } from "../bar/bar-table.js";
import { Foo } from "./foo-schema.js";
import { foos } from "./foo-table.js";

/* -----------------------------------------------------------------------------
 * Foo Model
 * -------------------------------------------------------------------------- */

export async function getBarsGroupedByFooId(foosList: Foo[]) {
  const { foosWithBars = [], foosWithoutBars = [] } = _.groupBy(
    foosList,
    (foo) => (foo.bars ? "foosWithBars" : "foosWithoutBars"),
  );

  const existingBars = foosWithBars.map((foo) => foo.bars || []).flat();
  const fetchedBars = await db.query.bars.findMany({
    where: inArray(
      bars.fooId,
      foosWithoutBars.map((foo) => foo.id),
    ),
  });

  return _.groupBy([...existingBars, ...fetchedBars], "fooId");
}

export async function getBazsKeyedByFooId(foosList: Foo[]) {
  const { foosWithBaz = [], foosWithoutBaz = [] } = _.groupBy(
    foosList,
    (foo) => (foo.baz ? "foosWithBaz" : "foosWithoutBaz"),
  );

  const existingFoosWithBaz = foosWithBaz;
  const fetchedFoosWithBaz = await db.query.foos.findMany({
    where: inArray(
      foos.id,
      foosWithoutBaz.map((foo) => foo.id),
    ),
    with: { baz: true },
  });

  return _.mapValues(
    _.keyBy([...existingFoosWithBaz, ...fetchedFoosWithBaz], "id"),
    (foo) => foo.baz!,
  );
}
