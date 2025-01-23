/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { Box, BoxProps } from "@mui/material";
import { createLink } from "@tanstack/react-router";

/* -----------------------------------------------------------------------------
 * LinkBox
 * -------------------------------------------------------------------------- */

export const LinkBox = createLink((props: BoxProps) => (
  <Box component="a" sx={{ textDecoration: "none" }} {...props} />
));
