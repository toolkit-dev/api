/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { createRoute } from "@tanstack/react-router";
import { Container, Typography } from "@mui/material";

// lib
import { rootRoute } from "./root-route.js";
import { UsersList } from "../features/users-list.js";

/* -----------------------------------------------------------------------------
 * userRoute
 * -------------------------------------------------------------------------- */

export const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  component: UsersPage,
});

export function UsersPage() {
  return (
    <Container maxWidth="xl" sx={{ marginTop: 4 }}>
      <Typography mb={2} variant="h2">
        Users
      </Typography>
      <UsersList />
    </Container>
  );
}
