import Calendar from "./components/Calendar";
import { ThemeProvider, CssBaseline, Button, Box, Typography, Paper } from "@mui/material";
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

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (showModeSelection) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [showModeSelection]);

  const handleModeSelection = (mode : string) => {
    setAppMode(mode);
    setShowModeSelection(false);
  };


  if (showModeSelection) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App" style={{ 
          position: 'relative',
          height: '100vh',
          overflow: 'hidden'
        }}>
          <div style={{ 
            filter: 'blur(2px)', 
            opacity: 0.3,
            height: '100vh',
            overflow: 'hidden',
            pointerEvents: 'none'
          }}>
            <Calendar />
          </div>
          
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            display="flex"
            justifyContent="center"
            alignItems="center"
            bgcolor="rgba(0, 0, 0, 0.4)"
            zIndex={1000}
            sx={{
              backdropFilter: 'blur(4px)',
            }}
          >
            <Paper 
              elevation={6} 
              sx={{ 
                p: 4, 
                maxWidth: 400, 
                textAlign: 'center', 
                borderRadius: 2,
                mx: 2,
                transform: 'scale(1)',
                animation: 'fadeIn 0.3s ease-in-out'
              }}
            >
              <Typography variant="h4" component="h1" gutterBottom>
                Calendar by Formstr
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Choose how you'd like to use the calendar
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => handleModeSelection('login')}
                  sx={{ py: 1.5 }}
                >
                  Login with Nostr
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={() => handleModeSelection('guest')}
                  sx={{ py: 1.5 }}
                >
                  Continue as Guest
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Login to save and sync events across devices
              </Typography>
            </Paper>
          </Box>
        </div>
        
        {/* Add CSS animation */}
        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </ThemeProvider>
    );
  }

  if (appMode || user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App">
          <Calendar />
        </div>
      </ThemeProvider>
    );
  }

  // Loading state
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <Typography>Loading...</Typography>
      </Box>
    </ThemeProvider>
  );
}

export default App;
