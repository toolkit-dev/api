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

// lib
import { LinkBox } from "../components/link-box.js";
import { rqtk } from "../toolkit/rqtk.js";

/* -----------------------------------------------------------------------------
 * UsersList
 * -------------------------------------------------------------------------- */

export type UsersListProps = BoxProps;

export function UsersList({ ...props }: UsersListProps) {
  const usersQuery = useQuery(
    rqtk.useQueryOptions(client.user.list, { fetch: {} }),
  );

  if (usersQuery.isPending) {
    return <div>Loading...</div>;
  }

  if (usersQuery.isError) {
    return <div>Error: {usersQuery.error.message}</div>;
  }

  const users = usersQuery.data;

  return (
    <Box {...props}>
      <Grid container spacing={2}>
        {users.map((user, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card key={index} sx={{ height: "100%", position: "relative" }}>
              <LinkBox
                to="/user/$userId"
                params={{ userId: user.id }}
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
              />
              <CardContent>
                <Typography variant="h6">{user.attributes.name}</Typography>
                <Typography variant="body1">{user.attributes.email}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
