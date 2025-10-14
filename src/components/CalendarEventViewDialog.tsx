import { useContext, useState, useEffect } from "react";
import { CalendarContext } from "../common/CalendarContext";
import { useTheme, useMediaQuery } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useEventDetails } from "../stores/eventDetails";
import { useIntl } from "react-intl";
import { getUserPublicKey } from "../common/nostr";
import { getStyles } from "../styles/calendarEventStyles";
import { useRSVPManager } from "./rsvpManager";
import { DEFAULT_TIME_RANGE_CONFIG } from "./useRSVPTimeRange";
import RenderContent from "./RenderContent";

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

  const [userPublicKey, setUserPublicKey] = useState<string>("");
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
      }
    };

    initializeUser();
  }, []);

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
      <DialogTitle>
        {calendarEvent.title || ""}
        <div style={{ ...styles.divTitleButton }}>
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
          formatMessage,
        })}
      </DialogContent>

      <DialogActions />
    </Dialog>
  );
}

export default CalendarEventViewDialog;
