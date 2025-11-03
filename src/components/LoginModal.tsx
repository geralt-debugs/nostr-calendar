import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { signerManager } from "../common/signer";
import { getAppSecretKeyFromLocalStorage } from "../common/signer/utils";
import { getPublicKey } from "nostr-tools";
import { createNostrConnectURI } from "../common/signer/nip46";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Alert,
  // Link,
} from "@mui/material";
import KeyIcon from "@mui/icons-material/VpnKey";
import LinkIcon from "@mui/icons-material/Link";
// import { ThemedUniversalModal } from "./ThemedUniversalModal";

// NIP-46 Section (Manual + QR)
interface Nip46SectionProps {
  onSuccess: () => void;
}
const Nip46Section: React.FC<Nip46SectionProps> = ({ onSuccess }) => {
  const [activeTab, setActiveTab] = useState("manual");
  const [bunkerUri, setBunkerUri] = useState("");
  const [loadingConnect, setLoadingConnect] = useState(false);

  const [qrPayload] = useState(() => generateNostrConnectURI());

  function generateNostrConnectURI() {
    const clientSecretKey = getAppSecretKeyFromLocalStorage();
    const clientPubkey = getPublicKey(clientSecretKey);

    // Required secret (short random string)
    const secret = Math.random().toString(36).slice(2, 10);

    // Permissions you want (optional, but usually good to ask explicitly)
    const perms = [
      "nip44_encrypt",
      "nip44_decrypt",
      "sign_event",
      "get_public_key",
    ];

    // Build query params
    const params = {
      clientPubkey,
      relays: ["wss://relay.nsec.app"],
      secret,
      perms,
      name: "Calendar",
      url: window.location.origin,
    };

    const finalUrl = createNostrConnectURI(params);
    console.log("FINAL URL is", finalUrl);
    return finalUrl;
  }

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const showMessage = (
    message: string,
    severity: "success" | "error" = "success",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const connectToBunkerUri = async (bunkerUri: string) => {
    await signerManager.loginWithNip46(bunkerUri);
    showMessage("Connected to Remote Signer", "success");
    onSuccess();
  };

  const handleConnectManual = async () => {
    if (!bunkerUri) {
      showMessage("Please enter a bunker URI.", "error");
      return;
    }
    setLoadingConnect(true);
    try {
      await connectToBunkerUri(bunkerUri);
    } catch {
      showMessage("Connection failed.", "error");
    } finally {
      setLoadingConnect(false);
    }
  };
  return (
    <div style={{ marginTop: 16 }}>
      <Tabs
        value={activeTab}
        onChange={(_event: React.SyntheticEvent, newValue: string) => {
          setActiveTab(newValue);
          if (newValue === "qr") {
            connectToBunkerUri(qrPayload);
          }
        }}
        aria-label="NIP-46 connection tabs"
      >
        <Tab label="Paste URI" value="manual" />
        <Tab label="QR Code" value="qr" />
      </Tabs>
      {activeTab === "manual" && (
        <Stack spacing={2} sx={{ width: "100%", marginTop: 2 }}>
          <TextField
            placeholder="Enter bunker URI"
            value={bunkerUri}
            onChange={(e) => setBunkerUri(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleConnectManual}
            disabled={loadingConnect}
          >
            Connect
          </Button>
        </Stack>
      )}
      {activeTab === "qr" && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <QRCodeCanvas value={qrPayload} size={180} />
          <Typography color="textSecondary" sx={{ fontSize: 12, marginTop: 1 }}>
            Using relay.nsec.app for communication
          </Typography>
        </div>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

// Footer info component
const FooterInfo: React.FC = () => {
  // const [isFAQModalVisible, setIsFAQModalVisible] = useState(false);

  return (
    <div style={{ marginTop: 24, textAlign: "center" }}>
      <Typography color="textSecondary" sx={{ fontSize: 12 }}>
        Your keys never leave your control.
      </Typography>
      <br />
      {/* <Link
        component="button"
        variant="body2"
        sx={{ fontSize: 12 }}
        onClick={() => {
          setIsFAQModalVisible(true);
        }}
      >
        Need help?
      </Link>
      <ThemedUniversalModal
        visible={isFAQModalVisible}
        onClose={() => {
          setIsFAQModalVisible(false);
        }}
        filePath="/docs/faq.md"
        title="Frequently Asked Questions"
      /> */}
    </div>
  );
};

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

const LoginOptionButton: React.FC<{
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
  type?: "outlined" | "contained";
  loading?: boolean;
}> = ({ icon, text, onClick, type, loading = false }) => (
  <Button
    variant={type}
    startIcon={icon}
    size="large"
    onClick={onClick}
    style={{ marginBottom: 8 }}
    disabled={loading}
  >
    {text}
  </Button>
);

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose }) => {
  const [showNip46, setShowNip46] = useState(false);

  const [loadingNip07, setLoadingNip07] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const showMessage = (
    message: string,
    severity: "success" | "error" = "success",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleNip07 = async () => {
    console.log("handle nip07 called");
    if (window.nostr) {
      setLoadingNip07(true);
      try {
        await signerManager.loginWithNip07();
        showMessage("Logged in with NIP-07", "success");
        onClose();
      } catch {
        showMessage("Login failed.", "error");
      } finally {
        setLoadingNip07(false);
      }
    } else {
      showMessage("No NIP-07 extension found.", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Typography variant="h6" align="center">
          Sign in to Formstr
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center">
          Choose your preferred login method
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ width: "100%" }}>
          <LoginOptionButton
            icon={<KeyIcon />}
            text="Sign in with Nostr Extension (NIP-07)"
            type="contained"
            onClick={handleNip07}
            loading={loadingNip07}
          />
          <LoginOptionButton
            icon={<LinkIcon />}
            text="Connect with Remote Signer (NIP-46)"
            onClick={() => setShowNip46(!showNip46)}
          />
          {showNip46 && <Nip46Section onSuccess={onClose} />}
        </Stack>
      </DialogContent>
      <DialogActions>
        <FooterInfo />
      </DialogActions>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default LoginModal;
