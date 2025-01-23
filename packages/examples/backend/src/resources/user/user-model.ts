/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { SetOptional } from "type-fest";

// lib
import { UserFields } from "./user-schemas.js";

/* -----------------------------------------------------------------------------
 * User
 * -------------------------------------------------------------------------- */

export class User {
  readonly resourceName = "user";
  readonly id: string;
  readonly name: string;
  readonly email: string;

  static async create(data: SetOptional<UserFields, "id">) {
    const user = new User({ id: `${userFixtureData.length + 1}`, ...data });
    userFixtureData.push(user);

    return user;
  }

  static async findById(id: string) {
    return userFixtureData.find((user) => user.id === id);
  }

  static async findByIds(ids: string[]) {
    return userFixtureData.filter((user) => ids.includes(user.id));
  }

  static async findAll() {
    return userFixtureData;
  }

  constructor(private readonly data: UserFields) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
  }
}

const userFixtureData: User[] = [
  new User({ id: "1", name: "John Doe", email: "john.doe@example.com" }),
  new User({ id: "2", name: "Jane Doe", email: "jane.doe@example.com" }),
  new User({ id: "3", name: "John Smith", email: "john.smith@example.com" }),
];
