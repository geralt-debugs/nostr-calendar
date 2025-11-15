import { useContext, useState, useEffect } from "react";
import { CalendarContext } from "../common/CalendarContext";
import { useTheme, useMediaQuery } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
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

  const exportICS = () => {
    const start =
      new Date(calendarEvent.begin)
        .toISOString()
        .replace(/[-:]/g, "")
        .split(".")[0] + "Z";
    const end =
      new Date(calendarEvent.end)
        .toISOString()
        .replace(/[-:]/g, "")
        .split(".")[0] + "Z";
    const dtstamp =
      new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const uid = `${calendarEvent.id}@calendar.formstr.app`;

    let title = calendarEvent.title?.trim();
    if (!title) {
      title = calendarEvent.description
        ? calendarEvent.description.split(" ").slice(0, 8).join(" ") + "..."
        : "Event";
    }

    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Formstr Inc//Calendar By Formstr//EN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART:${start}
DTEND:${end}
SUMMARY:${title}
DESCRIPTION:${calendarEvent.description || ""}
`;

    if (calendarEvent.location.length > 0) {
      icsContent += `LOCATION:${calendarEvent.location.join(", ")}\n`;
    }

    if (calendarEvent.image) {
      icsContent += `ATTACH;FMTTYPE=image/jpeg:${calendarEvent.image}\n`;
    }

    if (
      calendarEvent.repeat?.frequency &&
      calendarEvent.repeat.frequency !== "none"
    ) {
      let rule = "RRULE:";

      switch (calendarEvent.repeat.frequency) {
        case "daily":
          rule += "FREQ=DAILY";
          break;
        case "weekly":
          rule += "FREQ=WEEKLY";
          break;
        case "weekdays":
          rule += "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR";
          break;
        case "monthly":
          rule += "FREQ=MONTHLY";
          break;
        case "quarterly":
          rule += "FREQ=MONTHLY;INTERVAL=3";
          break;
        case "yearly":
          rule += "FREQ=YEARLY";
          break;
      }

      icsContent += rule + "\n";
    }

    icsContent += `END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}.ics`;
    link.click();
    URL.revokeObjectURL(url);
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
            onClick={exportICS}
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
          formatMessage,
        })}
      </DialogContent>
    </Dialog>
  );
}

export default CalendarEventViewDialog;
