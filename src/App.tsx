import ModeSelectionModal from "./components/ModeSelectionModal";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Typography,
  Toolbar,
} from "@mui/material";
import { theme } from "./theme";
import { useEffect, useState } from "react";
import { useUser } from "./stores/user";
import { IntlProvider } from "react-intl";
import { flattenMessages } from "./common/utils";
import dictionary from "./common/dictionary";
import LoginModal from "./components/LoginModal";
import { BrowserRouter } from "react-router";
import { Routing } from "./components/Routing";
import { Header } from "./components/Header";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

let _locale =
  (navigator.languages && navigator.languages[0]) ||
  navigator.language ||
  "en-US";
_locale = ~Object.keys(dictionary).indexOf(_locale) ? _locale : "en-US";

function Application() {
  const {
    user,
    isInitialized,
    initializeUser,
    showLoginModal,
    updateLoginModal,
  } = useUser();
  const [appMode, setAppMode] = useState<"login" | "guest" | null>(null);
  const [showModeSelection, setShowModeSelection] = useState(false);

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (!user && !appMode && isInitialized) {
      setShowModeSelection(true);
    }
  }, [user, isInitialized, appMode]);

  useEffect(() => {
    if (appMode === "login" && isInitialized && !user) {
      const handleLogin = async () => {
        try {
          updateLoginModal(true);
        } catch (error) {
          console.error("Login failed:", error);
        }
      };

      handleLogin();
    }
  }, [appMode, user, isInitialized, updateLoginModal]);

  const handleModeSelection = (mode: "login" | "guest") => {
    setAppMode(mode);
    setShowModeSelection(false);
  };

  return (
    <>
      <Header />
      {/* Mode Selection Modal */}
      <ModeSelectionModal
        isOpen={showModeSelection}
        onModeSelect={handleModeSelection}
      />
      {/* Loading State */}
      {!showModeSelection && !appMode && !user && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <Typography>Loading...</Typography>
        </Box>
      )}
      <LoginModal
        open={showLoginModal}
        onClose={() => updateLoginModal(false)}
      />
      <Toolbar />
      <Box>
        <Routing />
      </Box>
    </>
  );
}

export default function App() {
  const i18nLocale = _locale;
  const locale_dictionary = {
    ...flattenMessages(dictionary["en-US"]),
    ...flattenMessages(dictionary[i18nLocale]),
  };
  return (
    <IntlProvider locale={i18nLocale} messages={locale_dictionary}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <Application />
          </BrowserRouter>
        </ThemeProvider>
      </LocalizationProvider>
    </IntlProvider>
  );
}
