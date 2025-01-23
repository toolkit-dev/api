/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import {
  Box,
  BoxProps,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";

// toolkit
import { client } from "@toolkit-dev/examples-backend/client";
import { parseIncluded } from "@jsonapi/parser";

// lib
import { rqtk } from "../toolkit/rqtk.js";
import { LinkBox } from "../components/link-box.js";
import { LinkText } from "../components/link-text.js";

/* -----------------------------------------------------------------------------
 * PostsList
 * -------------------------------------------------------------------------- */

export type PostsListProps = BoxProps & {
  authorId?: string;
};

export function PostsList({ authorId, ...props }: PostsListProps) {
  const postsQuery = useQuery(
    rqtk.useQueryOptions(client.post.list, {
      fetch: { query: { include: "author", authorId } },
    }),
  );

  if (postsQuery.isPending) {
    return <div>Loading...</div>;
  }

  if (postsQuery.isError) {
    return <div>Error: {postsQuery.error.message}</div>;
  }

  const posts = postsQuery.data;
  const included = parseIncluded(rqtk.selectExtra(postsQuery, "included"));

  return (
    <Box {...props}>
      <Grid container spacing={2}>
        {posts.map((post, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card key={index} sx={{ height: "100%", position: "relative" }}>
              <LinkBox
                to="/post/$postId"
                params={{ postId: post.id }}
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
              />
              <CardContent>
                <Typography variant="h6">{post.attributes.title}</Typography>
                <Typography variant="caption">
                  by{" "}
                  <LinkText
                    to="/user/$userId"
                    params={{ userId: included.get(post, "author", "id") }}
                    variant="body1"
                    sx={{ position: "relative" }}
                    underline="hover"
                  >
                    {included.get(post, "author", "attributes.name")}
                  </LinkText>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
