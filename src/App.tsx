import Calendar from "./components/Calendar";
import ModeSelectionModal from "./components/ModeSelectionModal";
import { ThemeProvider, CssBaseline, Box, Typography } from "@mui/material";
import { theme } from "./theme";
import { useEffect, useState } from "react";
import { useUser } from "./stores/user";
import { IntlProvider } from "react-intl";
import { flattenMessages } from "./common/utils";
import dictionary from "./common/dictionary";
import LoginModal from "./components/LoginModal";
import { BrowserRouter } from "react-router";
import { Routing } from "./components/Routing";

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

        {/* Mode Selection Modal */}
        <ModeSelectionModal
          isOpen={showModeSelection}
          onModeSelect={handleModeSelection}
        />

        {/* Main App Content */}
        {(appMode || user) && !showModeSelection && (
          <div className="App">
            <Calendar />
          </div>
        )}

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
      <ThemeProvider theme={theme}>
        <CssBaseline />
    <BrowserRouter>
      <Routing indexNode={<Application />} />
    </BrowserRouter>
    </ThemeProvider>
    </IntlProvider>
  );
}
