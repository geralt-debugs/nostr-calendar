import { styled, Theme } from "@mui/material";

export const DrawerHeader = styled("div")(({ theme }: { theme: Theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-center",
  ...theme.mixins.toolbar,
}));
