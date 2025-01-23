/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { createRoute } from "@tanstack/react-router";
import { Container } from "@mui/material";

// lib
import { rootRoute } from "./root-route.js";
import { UserProfile } from "../features/user-profile.js";

/* -----------------------------------------------------------------------------
 * userRoute
 * -------------------------------------------------------------------------- */

export const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/user/$userId",
  component: UserPage,
});

export function UserPage() {
  const { userId } = userRoute.useParams();

  return (
    <Container maxWidth="xl" sx={{ marginTop: 4 }}>
      <UserProfile userId={userId} />
    </Container>
  );
}
