/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { Box, BoxProps, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

// toolkit
import { client } from "@toolkit-dev/examples-backend/client";
import { LinkText } from "../components/link-text.js";
import { rqtk } from "../toolkit/rqtk.js";
import { parseIncluded } from "@jsonapi/parser";

/* -----------------------------------------------------------------------------
 * Post
 * -------------------------------------------------------------------------- */

export type PostProps = BoxProps & {
  postId: string;
};

export function Post({ postId, ...props }: PostProps) {
  const postQuery = useQuery(
    rqtk.useQueryOptions(client.post.get, {
      useCachedPlaceholderData: true,
      fetch: {
        path: { id: postId },
        query: { include: "author" },
      },
    }),
  );

  if (postQuery.isPending) {
    return <div>Loading...</div>;
  }

  if (postQuery.isError) {
    return <div>Error: {postQuery.error.message}</div>;
  }

  const post = postQuery.data;
  const included = parseIncluded(rqtk.selectExtra(postQuery, "included"));
  const author = included.get(post, "author");

  return (
    <Box {...props}>
      <Typography mb={1} variant="h2">
        {post.attributes.title}
      </Typography>
      {author ? (
        <Typography variant="caption">
          by{" "}
          <LinkText
            to="/user/$userId"
            params={{ userId: author.id }}
            variant="body2"
            sx={{ position: "relative" }}
            underline="hover"
          >
            {author.attributes.name}
          </LinkText>
        </Typography>
      ) : null}
      <Box mt={4} mb={4}>
        <Typography variant="body1">{post.attributes.content}</Typography>
      </Box>
    </Box>
  );
}
