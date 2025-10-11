import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { format } from "date-fns";
import Typography from "@mui/material/Typography";
import Markdown from "react-markdown";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import remarkGfm from "remark-gfm";
import { Participant } from "./Participant";
import { getRSVPStatusColor, getRSVPButtonStyle } from "../utils/rsvpHelpers";
import Grid from "@mui/material/Grid";
import { RSVPResponse } from "../stores/events";
import { RSVPStatus } from "../utils/types";

const RenderContent = ({isMobile, styles, calendarEvent , locale, isLoadingRSVPs, participantRSVPs, currentRSVPStatus, isUpdatingRSVP, handleRSVPUpdate , formatMessage}: any) => {
  return (
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
            {isLoadingRSVPs && (
              <span style={{ fontSize: "0.8em", color: "#666", marginLeft: "8px" }}>
                (Loading RSVPs...)
              </span>
            )}
          </Typography>
          <Typography variant="body2" component="div">
            {calendarEvent.participants.map((participant: string) => {
              const rsvpResponse = participantRSVPs[participant] || RSVPResponse.pending;
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
            {calendarEvent.location.map((location: string, index: number) => (
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
      
      <div style={styles.rsvpContainer}>
        <div>
          <Typography variant="subtitle1" gutterBottom>
            RSVP Status
          </Typography>
          <div 
            style={{
              ...styles.rsvpStatus,
              ...getRSVPStatusColor(currentRSVPStatus)
            }}
          >
            {currentRSVPStatus.toUpperCase()}
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "8px", width: "100%" }}>
          <button
            style={getRSVPButtonStyle(RSVPStatus.accepted, currentRSVPStatus === RSVPStatus.accepted, isUpdatingRSVP , styles)}
            onClick={() => handleRSVPUpdate(RSVPStatus.accepted)}
            disabled={isUpdatingRSVP}
          >
            <CheckIcon style={{ fontSize: "18px" }} />
            Accept
          </button>
          
          <button
            style={getRSVPButtonStyle(RSVPStatus.declined, currentRSVPStatus === RSVPStatus.declined, isUpdatingRSVP , styles)}
            onClick={() => handleRSVPUpdate(RSVPStatus.declined)}
            disabled={isUpdatingRSVP}
          >
            <CloseOutlinedIcon style={{ fontSize: "18px" }} />
            Decline
          </button>
          
          <button
            style={getRSVPButtonStyle(RSVPStatus.tentative, currentRSVPStatus === RSVPStatus.tentative, isUpdatingRSVP, styles)}
            onClick={() => handleRSVPUpdate(RSVPStatus.tentative)}
            disabled={isUpdatingRSVP}
          >
            <HelpOutlineIcon style={{ fontSize: "18px" }} />
            Maybe
          </button>
        </div>
        
        {isUpdatingRSVP && (
          <Typography variant="body2" color="textSecondary" align="center">
            Updating RSVP...
          </Typography>
        )}
      </div>
    </div>
  )
}

export default RenderContent;
