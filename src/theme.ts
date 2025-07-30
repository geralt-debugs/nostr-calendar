import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  cssVariables: true,
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
    },
  },
  palette: {
    primary: {
      main: "#fbb17b",
    },
    secondary: {
      main: "#163f5e",
    },
    info: {
      main: "#3e63dd",
    },
    error: {
      main: "#d32f2f",
    },
  },
  typography: {
    subtitle1: {
      fontWeight: "bold",
    },
    body2: {
      color: "hsl(215.4 16.3% 46.9%)",
    },
    h5: {
      fontWeight: "bold",
    },
    fontFamily: [
      "Menlo",
      "Monaco",
      "Consolas",
      "Liberation Mono",
      "system-ui",
      "Avenir",
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(","),
  },
});
