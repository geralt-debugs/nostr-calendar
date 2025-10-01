import { useContext, useState, useEffect, useMemo, useCallback } from "react";
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
import CheckIcon from "@mui/icons-material/Check";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import remarkGfm from "remark-gfm";
import { Participant } from "./Participant";
import { 
  publishPrivateRSVPEvent, 
  publishPublicRSVPEvent, 
  fetchAndDecryptPrivateRSVPEvents,
  fetchPublicRSVPEvents,
  getUserPublicKey
} from "../common/nostr";
import { getTimeRangeConfig } from "../stores/events";

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
    height: "500px",
  },
  imageContainer: {
    width: "100%",
    marginBottom: "16px",
  },
  imageContainerWeb: {
    width: "50%",
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
  formControl: {},
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
  rsvpContainer: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  rsvpStatus: {
    padding: "8px 12px",
    borderRadius: "4px",
    textAlign: "center",
    fontWeight: "bold",
  },
  rsvpButtonGroup: {
    width: "100%",
  },
  rsvpButton: {
    flex: 1,
    padding: "8px 16px",
    borderRadius: "4px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#ccc",
    backgroundColor: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    transition: "all 0.2s ease",
    "&:hover": {
      opacity: 0.8,
    },
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
});

type RSVPStatus = "accepted" | "declined" | "tentative" | "pending";

interface RSVPTimeRangeConfig {
  daysBefore: number;
  daysAfter: number;
}

// Default configuration - fetch 7 days before and after current date
const DEFAULT_TIME_RANGE_CONFIG = getTimeRangeConfig();

// Function to calculate time range based on configuration
const calculateTimeRange = (config: RSVPTimeRangeConfig = DEFAULT_TIME_RANGE_CONFIG) => {
  const now = Date.now();
  const nowInSeconds = Math.floor(now / 1000);
  const oneDayInSeconds = 86400;
  
  const since = nowInSeconds - (config.daysBefore * oneDayInSeconds);
  const until = nowInSeconds + (config.daysAfter * oneDayInSeconds);
  
  return { since, until };
};

const useRSVPTimeRange = (initialConfig?: RSVPTimeRangeConfig) => {
  const [config, setConfig] = useState<RSVPTimeRangeConfig>(
    initialConfig || DEFAULT_TIME_RANGE_CONFIG
  );
  
  const updateTimeRange = useCallback((newConfig: Partial<RSVPTimeRangeConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);
  
  const setDaysBefore = useCallback((days: number) => {
    setConfig(prev => ({ ...prev, daysBefore: Math.max(0, days) }));
  }, []);
  
  const setDaysAfter = useCallback((days: number) => {
    setConfig(prev => ({ ...prev, daysAfter: Math.max(0, days) }));
  }, []);
  
  const resetToDefault = useCallback(() => {
    setConfig(DEFAULT_TIME_RANGE_CONFIG);
  }, []);
  
  const timeRange = useMemo(() => calculateTimeRange(config), [config]);
  
  return {
    config,
    timeRange,
    updateTimeRange,
    setDaysBefore,
    setDaysAfter,
    resetToDefault,
  };
};

const useRSVPManager = (calendarEvent: any, userPublicKey: string, timeRangeConfig?: RSVPTimeRangeConfig) => {
  const [rsvpStateByEvent, setRsvpStateByEvent] = useState<Record<string, RSVPStatus>>({});
  const [participantRSVPs, setParticipantRSVPs] = useState<Record<string, RSVPStatus>>({});
  const [isLoadingRSVPs, setIsLoadingRSVPs] = useState(false);
  const [isUpdatingRSVP, setIsUpdatingRSVP] = useState(false);
  const [rsvpTimestamps, setRsvpTimestamps] = useState<Record<string, number>>({});

  const { timeRange, config } = useRSVPTimeRange(timeRangeConfig);

  const eventKey = useMemo(() => 
    calendarEvent ? `${calendarEvent.id}-${calendarEvent.user}` : null, 
    [calendarEvent?.id, calendarEvent?.user]
  );

  const eventReference = useMemo(() => {
    if (!calendarEvent) return null;
    const eventKind = calendarEvent.isPrivateEvent ? '32678' : '31923';
    return `${eventKind}:${calendarEvent.user}:${calendarEvent.id}`;
  }, [calendarEvent?.isPrivateEvent, calendarEvent?.user, calendarEvent?.id]);

  const initializeRSVPStates = useCallback(() => {
    if (!calendarEvent || !eventKey || !userPublicKey) return;

    const initialRsvpState: Record<string, RSVPStatus> = {};
    const initialParticipantRSVPs: Record<string, RSVPStatus> = {};
    const initialTimestamps: Record<string, number> = {};

    calendarEvent.participants.forEach((participant: string) => {
      initialParticipantRSVPs[participant] = "pending";
    });

    if (calendarEvent.rsvpResponses?.length > 0) {
      calendarEvent.rsvpResponses.forEach((response: any) => {
        const timestamp = response.timestamp || 0;
        
        if (response.participantId === userPublicKey) {
          initialRsvpState[eventKey] = response.response as RSVPStatus;
          initialTimestamps[userPublicKey] = timestamp;
        }
        if (calendarEvent.participants.includes(response.participantId)) {
          initialParticipantRSVPs[response.participantId] = response.response as RSVPStatus;
          initialTimestamps[response.participantId] = timestamp;
        }
      });
    }

    setRsvpStateByEvent(prev => ({ ...prev, ...initialRsvpState }));
    setParticipantRSVPs(initialParticipantRSVPs);
    setRsvpTimestamps(initialTimestamps);
  }, [calendarEvent, eventKey, userPublicKey]);

  const processRSVPEvent = useCallback((rsvpEvent: any, decryptedTags?: any[]) => {
    if (!eventReference || !eventKey) return;

    const tags = decryptedTags || rsvpEvent.tags;
    
    const aTag = tags.find((tag: string[]) => tag[0] === "a");
    
    if (aTag?.[1] !== eventReference) return;

    let statusTag = tags.find(
      (tag: string[]) => tag[0] === "l" && tag.length > 2 && tag[2] === "status"
    );
    
    if (!statusTag) {
      statusTag = tags.find((tag: string[]) => tag[0] === "status");
    }

    if (statusTag) {
      const rsvpStatus = statusTag[1] as RSVPStatus;
      const participantPubKey = rsvpEvent.pubkey;
      const eventTimestamp = rsvpEvent.created_at || 0;

      // Only update if this is a newer event
      setRsvpTimestamps(prev => {
        const currentTimestamp = prev[participantPubKey] || 0;
        
        if (eventTimestamp <= currentTimestamp) {
          return prev; // Skip older events
        }

        // Update the RSVP states for newer events
        if (participantPubKey === userPublicKey) {
          setRsvpStateByEvent(state => ({
            ...state,
            [eventKey]: rsvpStatus
          }));
        }

        if (calendarEvent.participants.includes(participantPubKey)) {
          setParticipantRSVPs(state => ({
            ...state,
            [participantPubKey]: rsvpStatus
          }));
        }

        return {
          ...prev,
          [participantPubKey]: eventTimestamp
        };
      });
    }
  }, [eventReference, eventKey, userPublicKey, calendarEvent?.participants]);

  useEffect(() => {
    if (!calendarEvent || !userPublicKey || !eventKey || !eventReference) return;

    // Initialize states first
    initializeRSVPStates();
    setIsLoadingRSVPs(true);

    let subscription: any;
    
    if (calendarEvent.isPrivateEvent) {
      subscription = fetchAndDecryptPrivateRSVPEvents(
        { 
          participants: calendarEvent.participants,
        },
        (decryptedRSVPData: any) => {
          try {
            if (decryptedRSVPData?.rsvpEvent?.decryptedData) {
              processRSVPEvent(decryptedRSVPData.rsvpEvent, decryptedRSVPData.rsvpEvent.decryptedData);
            }
          } catch (error) {
            console.error("Error processing private RSVP data:", error);
          }
        }
      );
    } else {
      subscription = fetchPublicRSVPEvents(
        {
          eventReference,
        },
        (rsvpEvent: any) => {
          processRSVPEvent(rsvpEvent);
        }
      );
    }

    const loadingTimeout = setTimeout(() => {
      setIsLoadingRSVPs(false);
    }, 5000);

    return () => {
      subscription?.close();
      clearTimeout(loadingTimeout);
    };
  }, [calendarEvent, userPublicKey, eventKey, eventReference, timeRange.since, timeRange.until, initializeRSVPStates, processRSVPEvent]);

  const handleRSVPUpdate = useCallback(async (status: RSVPStatus) => {
    const currentStatus = eventKey ? (rsvpStateByEvent[eventKey] || "pending") : "pending";
    
    if (isUpdatingRSVP || status === currentStatus || !eventKey) return;
    
    setIsUpdatingRSVP(true);
    
    try {
      if (calendarEvent.isPrivateEvent) {
        await publishPrivateRSVPEvent({
          authorpubKey: calendarEvent.user,
          eventId: calendarEvent.id,
          status: status,
          participants: calendarEvent.participants || [],
        });
      } else {
        await publishPublicRSVPEvent({
          authorpubKey: calendarEvent.user,
          eventId: calendarEvent.id,
          status: status,
        });
      }
      
      // Optimistically update with current timestamp
      setRsvpStateByEvent(prev => ({
        ...prev,
        [eventKey]: status
      }));
      
      setRsvpTimestamps(prev => ({
        ...prev,
        [userPublicKey]: Math.floor(Date.now() / 1000)
      }));
      
    } catch (error) {
      console.error("Failed to update RSVP:", error);
      const originalStatus = eventKey ? (rsvpStateByEvent[eventKey] || "pending") : "pending";
      setRsvpStateByEvent(prev => ({
        ...prev,
        [eventKey]: originalStatus
      }));
    } finally {
      setIsUpdatingRSVP(false);
    }
  }, [calendarEvent, eventKey, rsvpStateByEvent, isUpdatingRSVP, userPublicKey]);

  return {
    currentRSVPStatus: eventKey ? (rsvpStateByEvent[eventKey] || "pending") : "pending",
    participantRSVPs,
    isLoadingRSVPs,
    isUpdatingRSVP,
    handleRSVPUpdate,
    timeRangeConfig: config,
    timeRange,
  };
};

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
  
  const [userPublicKey, setUserPublicKey] = useState<string>("");
  const customTimeRange = DEFAULT_TIME_RANGE_CONFIG;
  
  // Use the custom hook with configurable time range
  const {
    currentRSVPStatus,
    participantRSVPs,
    isLoadingRSVPs,
    isUpdatingRSVP,
    handleRSVPUpdate,
    timeRange,
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

  const getRSVPStatusColor = (status: RSVPStatus) => {
    switch (status) {
      case "accepted":
        return { backgroundColor: "#4CAF50", color: "white" };
      case "declined":
        return { backgroundColor: "#f44336", color: "white" };
      case "tentative":
        return { backgroundColor: "#FF9800", color: "white" };
      default:
        return { backgroundColor: "#e0e0e0", color: "#666" };
    }
  };

  const getRSVPButtonStyle = (status: RSVPStatus, isSelected: boolean) => {
    const baseStyle = {
      ...styles.rsvpButton,
      opacity: isUpdatingRSVP ? 0.5 : 1,
    };

    if (isSelected) {
      switch (status) {
        case "accepted":
          return { 
            ...baseStyle, 
            backgroundColor: "#4CAF50",
            color: "white", 
            borderColor: "#4CAF50" 
          };
        case "declined":
          return { 
            ...baseStyle, 
            backgroundColor: "#f44336",
            color: "white", 
            borderColor: "#f44336" 
          };
        case "tentative":
          return { 
            ...baseStyle, 
            backgroundColor: "#FF9800",
            color: "white", 
            borderColor: "#FF9800" 
          };
      }
    }

    return baseStyle;
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
            {isLoadingRSVPs && (
              <span style={{ fontSize: "0.8em", color: "#666", marginLeft: "8px" }}>
                (Loading RSVPs...)
              </span>
            )}
          </Typography>
          <Typography variant="body2" component="div">
            {calendarEvent.participants.map((participant: string) => {
              const rsvpResponse = participantRSVPs[participant] || "pending";
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
            style={getRSVPButtonStyle("accepted", currentRSVPStatus === "accepted")}
            onClick={() => handleRSVPUpdate("accepted")}
            disabled={isUpdatingRSVP}
          >
            <CheckIcon style={{ fontSize: "18px" }} />
            Accept
          </button>
          
          <button
            style={getRSVPButtonStyle("declined", currentRSVPStatus === "declined")}
            onClick={() => handleRSVPUpdate("declined")}
            disabled={isUpdatingRSVP}
          >
            <CloseOutlinedIcon style={{ fontSize: "18px" }} />
            Decline
          </button>
          
          <button
            style={getRSVPButtonStyle("tentative", currentRSVPStatus === "tentative")}
            onClick={() => handleRSVPUpdate("tentative")}
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
        
        {/* Debug info */}
        <Typography variant="caption" color="textSecondary" style={{ fontSize: "10px" }}>
          Fetching from: {new Date(timeRange.since * 1000).toLocaleDateString()} to {new Date(timeRange.until * 1000).toLocaleDateString()}
        </Typography>
      </div>
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
        {isMobile && calendarEvent.image && (
          <div style={styles.imageContainer}>
            <img style={styles.image} src={calendarEvent.image} alt="Event" />
          </div>
        )}
        
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
