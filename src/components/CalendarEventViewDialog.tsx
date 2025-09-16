import { useContext } from "react";
import { CalendarContext } from "../common/CalendarContext";
import { Grid, Theme, useTheme, useMediaQuery } from "@mui/material";
import { format } from "date-fns";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { IGetStyles } from "../common/types";
import { useEventDetails } from "../stores/eventDetails";
import Markdown from "react-markdown";
import { useIntl } from "react-intl";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import remarkGfm from "remark-gfm";
import { Participant } from "./Participant";

const getStyles: IGetStyles = (theme: Theme) => ({
  divTitleButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  dialogContentWeb: {
    display: "flex",
    flexDirection: "row",
    gap: "24px",
    height: "500px", // Fixed height for web view
  },
  imageContainer: {
    width: "100%",
    marginBottom: "16px",
  },
  imageContainerWeb: {
    width: "50%", // Fixed width for web
    minWidth: "300px",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "auto",
    borderRadius: "8px",
  },
  imageWeb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "8px",
  },
  contentContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  contentContainerWeb: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    flex: 1,
    overflowY: "auto",
    paddingRight: "8px",
  },
  formControl: {
    // minWidth: 120,
  },
  formControlFlex: {
    display: "inline-flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  icon: {},
  optionsBar: {
    display: "inline-flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});

function CalendarEventViewDialog() {
  const theme = useTheme();
  const styles = getStyles(theme);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    event: calendarEvent,
    action,
    closeEventDetails,
  } = useEventDetails((state) => state);
  const { formatMessage } = useIntl();
  const { stateCalendar } = useContext(CalendarContext);
  
  if (!calendarEvent || action === "create") {
    return null;
  }
  const { locale } = stateCalendar;

  const handleCloseViewDialog = () => {
    closeEventDetails();
  };

  const renderContent = () => (
    <div style={isMobile ? styles.contentContainer : styles.contentContainerWeb}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <AccessTimeIcon />
        {calendarEvent.begin && (
          <Typography>
            {format(
              new Date(calendarEvent.begin),
              "ccc, d MMMM yyyy ⋅ HH:mm -",
              {
                locale: locale,
              },
            )}{" "}
            {format(new Date(calendarEvent.end), "HH:mm", {
              locale: locale,
            })}
          </Typography>
        )}
      </div>
      
      {calendarEvent.participants.length > 0 && (
        <div>
          <Typography variant="subtitle1">
            {formatMessage({ id: "navigation.participants" })}
          </Typography>
          <Typography variant="body2" component="div">
            {calendarEvent.participants.map((participant) => {
              const rsvpResponse = calendarEvent.rsvpResponses?.find(
                (response) => response.participantId === participant
              )?.response || "pending";
              return (
                <Participant 
                  key={participant} 
                  pubKey={participant} 
                  rsvpResponse={rsvpResponse}
                />
              );
            })}
          </Typography>
        </div>
      )}
      
      <div>
        <Typography variant="subtitle1">
          {formatMessage({ id: "navigation.description" })}
        </Typography>
        <Typography variant="body2" component="div">
          <Markdown remarkPlugins={[remarkGfm]}>
            {calendarEvent.description}
          </Markdown>
        </Typography>
      </div>
      
      {calendarEvent.location.length > 0 && (
        <div>
          <Typography variant="subtitle1">
            {formatMessage({ id: "navigation.location" })}
          </Typography>
          <Typography variant="body2" component="div">
            {calendarEvent.location.map((location, index) => (
              <Grid
                key={index}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <LocationOnOutlinedIcon style={{ height: "20px" }} />{" "}
                {<Markdown remarkPlugins={[remarkGfm]}>{location}</Markdown>}
              </Grid>
            ))}
          </Typography>
        </div>
      )}
      
      <button 
        style={{ 
          backgroundColor: "rgb(251, 177, 123)",
          color: "grey.900", 
          padding: '8px', 
          borderRadius: '4px', 
          border: 'none', 
          cursor: 'pointer',
          marginTop: 'auto'
        }}
      >
        <div>RSVP EVENT</div>
      </button>
    </div>
  );

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
      
      <DialogContent style={isMobile ? styles.dialogContent : styles.dialogContentWeb}>
        {/* Mobile Layout - Image on top */}
        {isMobile && calendarEvent.image && (
          <div style={styles.imageContainer}>
            <img style={styles.image} src={calendarEvent.image} alt="Event" />
          </div>
        )}
        
        {/* Web Layout - Image on left, content on right */}
        {!isMobile && calendarEvent.image && (
          <div style={styles.imageContainerWeb}>
            <img style={styles.imageWeb} src={calendarEvent.image} alt="Event" />
          </div>
        )}
        
        {renderContent()}
      </DialogContent>
      
      <DialogActions />
    </Dialog>
  );
}

export default CalendarEventViewDialog;
