import Calendar from "./components/Calendar";
import ModeSelectionModal from "./components/ModeSelectionModal";
import { ThemeProvider, CssBaseline, Box, Typography } from "@mui/material";
import { theme } from "./theme";
import { useEffect, useState } from 'react';
import { useUser } from './stores/user';
import { init as initNostrLogin } from "nostr-login";
import { getUserPublicKey } from "./common/nostr";

function App() {
  const { user, isInitialized, initializeUser, updateUser } = useUser();
  const [appMode, setAppMode] = useState<string | null>(null); // null, 'login', or 'guest'
  const [showModeSelection, setShowModeSelection] = useState(false);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  useEffect(() => {
    if (!user && !appMode && isInitialized) {
      setShowModeSelection(true);
    }
  }, [user, isInitialized, appMode]);

  useEffect(() => {
    if (appMode === 'login' && isInitialized && !user) {
      const handleLogin = async () => {
        try {
          // Initialize nostr-login
          initNostrLogin({
            darkMode: false,
            title: "Calendar by Formstr",
            noBanner: true,
            description: "Login to manage your events",
          });
          const publicKey = await getUserPublicKey();
          updateUser({ publicKey });
        } catch (error) {
          console.error("Login failed:", error);
        }
      };
      
      handleLogin();
    }
  }, [appMode, user, isInitialized, updateUser]);

  const handleModeSelection = (mode: string) => {
    setAppMode(mode);
    setShowModeSelection(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
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
    </ThemeProvider>
  );
}

export default App;
