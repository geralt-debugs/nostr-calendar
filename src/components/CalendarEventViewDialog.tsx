import { useContext, useState, useEffect } from "react";
import { CalendarContext } from "../common/CalendarContext";
import { useTheme, useMediaQuery } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { useEventDetails } from "../stores/eventDetails";
import { useIntl } from "react-intl";
import { getUserPublicKey } from "../common/nostr";
import { getStyles } from "../styles/calendarEventStyles";
import { useRSVPManager } from "./rsvpManager";
import { DEFAULT_TIME_RANGE_CONFIG } from "./useRSVPTimeRange";
import RenderContent from "./RenderContent";
import DownloadIcon from "@mui/icons-material/Download";
import { exportICS } from "../common/utils";
import { useUser } from "../stores/user";

function CalendarEventViewDialog() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const {
    event: calendarEvent,
    action,
    closeEventDetails,
  } = useEventDetails((state) => state);
  const { formatMessage } = useIntl();
  const { stateCalendar } = useContext(CalendarContext);
  const { user } = useUser();

  const [userPublicKey, setUserPublicKey] = useState("");
  const customTimeRange = DEFAULT_TIME_RANGE_CONFIG;

  const {
    currentRSVPStatus,
    participantRSVPs,
    isLoadingRSVPs,
    isUpdatingRSVP,
    handleRSVPUpdate,
  } = useRSVPManager(calendarEvent, userPublicKey, customTimeRange);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const pubKey = await getUserPublicKey();
        setUserPublicKey(pubKey);
      } catch (error) {
        console.error("Failed to get user public key:", error);
        setUserPublicKey("");
      }
    };

    initializeUser();
  }, [user]);

  if (!calendarEvent || action === "create") {
    return null;
  }

  const { locale } = stateCalendar;

  const handleCloseViewDialog = () => {
    closeEventDetails();
  };

  return (
    <Dialog
      fullScreen={false}
      fullWidth={true}
      maxWidth={isMobile ? "sm" : "md"}
      open={true}
      onClose={handleCloseViewDialog}
      aria-labelledby="max-width-dialog-title"
      keepMounted={false}
    >
      <DialogTitle
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>
          {calendarEvent.title || ""}
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={() => exportICS(calendarEvent)}
            style={{ borderRadius: "10px", fontWeight: 600 }}
          >
            Export ICS
          </Button>

          <IconButton aria-label="Close" onClick={handleCloseViewDialog}>
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent
        style={isMobile ? styles.dialogContent : styles.dialogContentWeb}
      >
        {isMobile && calendarEvent.image && (
          <div style={styles.imageContainer}>
            <img style={styles.image} src={calendarEvent.image} alt="Event" />
          </div>
        )}

        {!isMobile && calendarEvent.image && (
          <div style={styles.imageContainerWeb}>
            <img
              style={styles.imageWeb}
              src={calendarEvent.image}
              alt="Event"
            />
          </div>
        )}

        {RenderContent({
          isMobile,
          styles,
          calendarEvent,
          locale,
          isLoadingRSVPs,
          participantRSVPs,
          currentRSVPStatus,
          isUpdatingRSVP,
          handleRSVPUpdate,
          userPublicKey,
          formatMessage,
        })}
      </DialogContent>
    </Dialog>
  );
}

export default CalendarEventViewDialog;
