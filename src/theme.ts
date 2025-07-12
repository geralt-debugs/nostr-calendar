import { ThemeProvider, createTheme } from "@mui/material/styles";

export const theme = createTheme({
  cssVariables: true,
  components: {
    MuiButtonBase: {},
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
    },
  },
  palette: {
    primary: {
      main: "#3e63dd",
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
    fontFamily: [
      "system-ui",
      "Avenir",
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(","),
  },
});
