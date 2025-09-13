import { useEffect } from 'react';
import { Box, Typography, Paper, Button } from "@mui/material";
import Calendar from "./Calendar";
import { useIntl } from "react-intl";

interface ModeSelectionModalProps {
  isOpen: boolean;
  onModeSelect: (mode: string) => void;
}

const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({ 
  isOpen, 
  onModeSelect 
}) => {
    const intl = useIntl();
    
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div style={{ 
      position: 'relative',
      height: '100vh',
      overflow: 'hidden'
    }}>
      {/* Blurred background */}
      <div style={{ 
        filter: 'blur(2px)', 
        opacity: 0.3,
        height: '100vh',
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        <Calendar />
      </div>
      
      {/* Modal overlay */}
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
            {intl.formatMessage({ id: "message.title" })}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {intl.formatMessage({ id : "message.modeSelection_description" })}
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => onModeSelect('login')}
              sx={{ py: 1.5 }}
            >
              {intl.formatMessage({ id: "message.modeSelection_loginButton" })}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => onModeSelect('guest')}
              sx={{ py: 1.5 }}
            >
              {intl.formatMessage({ id: "message.modeSelection_guestButton" })}
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            {intl.formatMessage({ id: "message.modeSelection_loginInfo" })}
          </Typography>
        </Paper>
      </Box>
      
      {/* CSS animation */}
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
    </div>
  );
};

export default ModeSelectionModal;