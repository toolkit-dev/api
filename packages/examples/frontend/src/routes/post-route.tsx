/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { createRoute } from "@tanstack/react-router";
import { Container } from "@mui/material";

// lib
import { rootRoute } from "./root-route.js";
import { Post } from "../features/post.js";

/* -----------------------------------------------------------------------------
/* -----------------------------------------------------------------------------
 * postRoute
 * -------------------------------------------------------------------------- */

export const postRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/post/$postId",
  component: PostPage,
});

export function PostPage() {
  const { postId } = postRoute.useParams();

  return (
    <Container maxWidth="md" sx={{ marginTop: 4 }}>
      <Post postId={postId} />
    </Container>
  );
}
