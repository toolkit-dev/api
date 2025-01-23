/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { AppBar, Toolbar, Link, Button, Typography, Box } from "@mui/material";
import { Outlet, createLink } from "@tanstack/react-router";

/* -----------------------------------------------------------------------------
 * DefaultLayout
 * -------------------------------------------------------------------------- */

const TextLink = createLink(Link);
const ButtonLink = createLink(Button);

export function DefaultLayout() {
  return (
    <>
      <AppBar position="relative" variant="outlined" color="transparent">
        <Toolbar>
          <Typography variant="h6" component="h1">
            <TextLink to="/" underline="hover" variant="h6" color="black">
              MiniPress
            </TextLink>
          </Typography>
          <Box
            display="flex"
            flexGrow={1}
            gap={2}
            alignItems="center"
            justifyContent="flex-end"
          >
            <TextLink to="/users" underline="hover" variant="body1">
              Users
            </TextLink>
            <ButtonLink to="/post/create" variant="outlined">
              New Post
            </ButtonLink>
          </Box>
        </Toolbar>
      </AppBar>
      <Outlet />
    </>
  );
}
