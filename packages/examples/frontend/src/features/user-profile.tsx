/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { Box, BoxProps, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

// toolkit
import { client } from "@toolkit-dev/examples-backend/client";
import { PostsList } from "./posts-list.js";
import { rqtk } from "../toolkit/rqtk.js";

/* -----------------------------------------------------------------------------
 * UserProfile
 * -------------------------------------------------------------------------- */

export type UserProfileProps = BoxProps & {
  userId: string;
};

export function UserProfile({ userId, ...props }: UserProfileProps) {
  const userQuery = useQuery(
    rqtk.useQueryOptions(client.user.get, {
      fetch: {
        path: { id: userId },
      },
    }),
  );

  if (userQuery.isPending) {
    return <div>Loading...</div>;
  }

  if (userQuery.isError) {
    return <div>Error: {userQuery.error.message}</div>;
  }

  const user = userQuery.data;

  return (
    <Box {...props}>
      <Typography mb={2} variant="h2">
        {user.attributes.name}
      </Typography>
      <PostsList authorId={userId} />
    </Box>
  );
}
