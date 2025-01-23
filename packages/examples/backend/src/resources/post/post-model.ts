/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { SetOptional } from "type-fest";

// lib
import { PostFields } from "./post-schemas.js";

/* -----------------------------------------------------------------------------
 * Post
 * -------------------------------------------------------------------------- */

export class Post {
  readonly resourceName = "post";
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly authorId: string;

  static async create(data: SetOptional<PostFields, "id">) {
    const post = new Post({ id: `${postFixtureData.length + 1}`, ...data });
    postFixtureData.push(post);

    return post;
  }

  static async findById(id: string) {
    return postFixtureData.find((post) => post.id === id);
  }

  static async findByIds(ids: string[]) {
    return postFixtureData.filter((post) => ids.includes(post.id));
  }

  static async findAll() {
    return postFixtureData;
  }

  constructor(private readonly data: PostFields) {
    this.id = data.id;
    this.title = data.title;
    this.content = data.content;
    this.authorId = data.authorId;
  }
}

const postFixtureData: Post[] = [
  new Post({
    id: "1",
    title: "Hello World",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    authorId: "1",
  }),
  new Post({
    id: "2",
    title: "From the other side",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    authorId: "2",
  }),
  new Post({
    id: "3",
    title: "The end of the world",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    authorId: "3",
  }),
];
