import Calendar from "./components/Calendar";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <Calendar />
      </div>
    </ThemeProvider>
  );
}

export default App;
