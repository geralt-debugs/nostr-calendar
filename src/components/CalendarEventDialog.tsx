import React, { useContext, useState } from "react";
import { CalendarContext } from "../common/CalendarContext";
import {
  FormControlLabel,
  FormGroup,
  Switch,
  Theme,
  Tooltip,
  useTheme,
  Box,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SubjectIcon from "@mui/icons-material/Subject";
import EventIcon from "@mui/icons-material/Event";
import ImageIcon from "@mui/icons-material/Image";
import PeopleIcon from "@mui/icons-material/People";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import { format } from "date-fns";
import TimeSelect from "../engine_components/TimeSelect";
import Datepicker from "../engine_components/Datepicker";
import { IGetStyles } from "../common/types";
import { useIntl } from "react-intl";
import { useEventDetails } from "../stores/eventDetails";
import {
  publishPrivateCalendarEvent,
  publishPublicCalendarEvent,
} from "../common/nostr";
import { ParticipantAdd } from "./ParticipantAdd";
import { Participant } from "./Participant";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import InfoIcon from "@mui/icons-material/Info";

const getStyles: IGetStyles = (theme: Theme) => ({
  dialogPaper: {
    borderRadius: '24px',
    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
    boxShadow: '0 32px 64px rgba(0, 0, 0, 0.12)',
    overflow: 'hidden',
  },
  dialogTitle: {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.light}10 100%)`,
    borderBottom: `1px solid ${theme.palette.divider}`,
    position: 'relative',
    padding: theme.spacing(3, 3, 2, 3),
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  titleIcon: {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
    borderRadius: '12px',
    padding: theme.spacing(1),
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divTitleButton: {
    position: "absolute",
    right: theme.spacing(2),
    top: theme.spacing(2),
    display: 'flex',
    gap: theme.spacing(0.5),
  },
  actionButton: {
    borderRadius: '12px',
    padding: theme.spacing(1),
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.1)',
      background: theme.palette.action.hover,
    },
  },
  closeButton: {
    color: theme.palette.error.main,
    '&:hover': {
      background: theme.palette.error.light + '20',
    },
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3),
    padding: theme.spacing(1, 0),
  },
  section: {
    background: theme.palette.background.paper,
    borderRadius: '16px',
    padding: theme.spacing(3),
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    },
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  sectionIcon: {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
    borderRadius: '10px',
    padding: theme.spacing(0.8),
    color: 'white',
    fontSize: '20px',
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
      '&.Mui-focused': {
        transform: 'translateY(-1px)',
        boxShadow: `0 4px 12px ${theme.palette.primary.main}30`,
      },
    },
  },
  timeSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  timeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    background: theme.palette.background.default,
    borderRadius: '12px',
    border: `1px solid ${theme.palette.divider}`,
  },
  datepicker: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
    },
  },
  participantSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  participantItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1.5, 2),
    background: theme.palette.background.default,
    borderRadius: '12px',
    border: `1px solid ${theme.palette.divider}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 2px 8px ${theme.palette.primary.main}20`,
    },
  },
  removeButton: {
    color: theme.palette.error.main,
    borderRadius: '8px',
    padding: theme.spacing(0.5),
    transition: 'all 0.3s ease',
    '&:hover': {
      background: theme.palette.error.light + '20',
      transform: 'scale(1.1)',
    },
  },
  privacySection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2, 3),
    background: theme.palette.background.default,
    borderRadius: '16px',
    border: `1px solid ${theme.palette.divider}`,
  },
  privacyToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  privacyChip: {
    borderRadius: '12px',
    padding: theme.spacing(0.5, 1),
    fontWeight: 600,
  },
  saveButton: {
    borderRadius: '16px',
    padding: theme.spacing(1.5, 4),
    fontSize: '16px',
    fontWeight: 600,
    textTransform: 'none',
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    boxShadow: `0 4px 16px ${theme.palette.primary.main}40`,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 24px ${theme.palette.primary.main}50`,
    },
    '&:disabled': {
      background: theme.palette.action.disabledBackground,
      color: theme.palette.action.disabled,
      transform: 'none',
      boxShadow: 'none',
    },
  },
  loadingButton: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
});

const interval = 30;
const timeOptions = Array.from(Array(24).keys()).reduce<{ value: string }[]>(
  (time, hour: number) => {
    Array.from(Array(60 / interval).keys()).map((i) => {
      const timeItem = (+(hour + "." + i * interval))
        .toFixed(2)
        .replace(".", ":");
      time.push({ value: timeItem });
      return null;
    });
    return time;
  },
  [],
);

function CalendarEventDialog() {
  const theme = useTheme();
  const styles = getStyles(theme);

  const { stateCalendar } = useContext(CalendarContext);
  const { locale } = stateCalendar;
  const [processing, updateProcessing] = useState(false);
  const [eventMetaDetails, updateEventMetaDetails] = useState<{
    type: "public" | "private";
  }>({ type: "private" });

  const intl = useIntl();

  const {
    event: eventDetails,
    closeEventDetails: closeDialog,
    updateEventDetails,
    updateEvent,
    action,
  } = useEventDetails((state) => state);
  const open = !!eventDetails;
  const [fullScreen, setFullScreen] = useState(false);

  if (!eventDetails || action !== "create") {
    return null;
  }

  const handleOnClose = () => {
    closeDialog();
  };

  const handleFullScreen = () => {
    setFullScreen(!fullScreen);
  };

  const handleOk = async () => {
    updateProcessing(true);
    if (eventMetaDetails.type === "private") {
      await publishPrivateCalendarEvent(eventDetails);
    } else {
      await publishPublicCalendarEvent(eventDetails);
    }
    updateProcessing(false);
    closeDialog();
  };

  const onChangeBeginDate = (newDate: Date) => {
    const currentBeginTime = new Date(eventDetails.begin);
    const currentBeginHour = currentBeginTime.getHours();
    const currentBeginMinutes = currentBeginTime.getMinutes();
    const currentEndTime = new Date(eventDetails.end);
    const currentEndHour = currentEndTime.getHours();
    const currentEndMinutes = currentEndTime.getMinutes();
    const newBegin = new Date(
      `${format(newDate, "yyyy/MM/dd")} ${currentBeginHour}:${currentBeginMinutes}`,
    );
    const newEnd = new Date(
      `${format(newDate, "yyyy/MM/dd")} ${currentEndHour}:${currentEndMinutes}`,
    );
    updateEvent(
      {
        ...eventDetails,
        begin: newBegin.getTime(),
        end: newEnd.getTime(),
      },
      "create",
    );
  };

  const onChangeEndDate = (newDate: Date) => {
    const currentEndTime = new Date(eventDetails.end);
    const currentEndHour = currentEndTime.getHours();
    const currentEndMinutes = currentEndTime.getMinutes();
    const newEnd = new Date(
      `${format(newDate, "yyyy/MM/dd")} ${currentEndHour}:${currentEndMinutes}`,
    );
    updateEventDetails("end", newEnd.getTime());
  };

  const onChangeBeginTime = (newValue: string) => {
    const currentBeginTime = new Date(eventDetails.begin);
    const newBegin = new Date(
      `${format(currentBeginTime, "yyyy/MM/dd")} ${newValue}`,
    );
    updateEventDetails("begin", newBegin.getTime());
  };

  const onChangeEndTime = (newValue: string) => {
    const currentBeginTime = new Date(eventDetails.end);
    const newBegin = new Date(
      `${format(currentBeginTime, "yyyy/MM/dd")} ${newValue}`,
    );
    updateEventDetails("end", newBegin.getTime());
  };

  const dateFormat = "dd/MM/yyyy";

  const buttonDisabled = !(
    !processing &&
    eventDetails.title &&
    eventDetails.begin &&
    eventDetails.end &&
    eventDetails.begin < eventDetails.end
  );

  return (
    <Dialog
      fullScreen={fullScreen}
      fullWidth={true}
      maxWidth="md"
      open={open}
      onClose={handleOnClose}
      aria-labelledby="calendar-event-dialog"
      keepMounted={false}
      PaperProps={{
        sx: styles.dialogPaper,
      }}
    >
      <DialogTitle sx={styles.dialogTitle}>
        <div style={styles.titleContainer}>
          <div style={styles.titleIcon}>
            <EventIcon />
          </div>
          <Typography variant="h5" component="h2" fontWeight={600}>
            {eventDetails.title || "New Event"}
          </Typography>
        </div>
        <div style={styles.divTitleButton}>
          {!fullScreen && (
            <IconButton
              sx={{ ...styles.actionButton }}
              onClick={handleFullScreen}
              aria-label="Fullscreen"
            >
              <FullscreenIcon />
            </IconButton>
          )}
          {fullScreen && (
            <IconButton
              sx={{ ...styles.actionButton }}
              onClick={handleFullScreen}
              aria-label="Exit fullscreen"
            >
              <FullscreenExitIcon />
            </IconButton>
          )}
          <IconButton
            sx={{ ...styles.actionButton, ...styles.closeButton }}
            onClick={handleOnClose}
            aria-label="Close"
          >
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      
      <DialogContent sx={{ padding: theme.spacing(3) }}>
        <form style={styles.form} noValidate>
          {/* Event Details Section */}
          <Box sx={styles.section}>
            <div style={styles.sectionHeader}>
              <EventIcon sx={styles.sectionIcon} />
              <Typography variant="h6" fontWeight={600}>
                Event Details
              </Typography>
            </div>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                placeholder="Event title..."
                name="title"
                value={eventDetails.title}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  updateEventDetails("title", event.target.value);
                }}
                required
                sx={styles.textField}
                variant="outlined"
              />

              <TextField
                fullWidth
                placeholder="Image URL (optional)"
                name="image"
                value={eventDetails.image}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  updateEventDetails("image", event.target.value);
                }}
                sx={styles.textField}
                InputProps={{
                  startAdornment: <ImageIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Box>
          </Box>

          {/* Time & Date Section */}
          <Box sx={styles.section}>
            <div style={styles.sectionHeader}>
              <AccessTimeIcon sx={styles.sectionIcon} />
              <Typography variant="h6" fontWeight={600}>
                When
              </Typography>
            </div>
            
            <Box sx={styles.timeSection}>
              <Box sx={styles.timeRow}>
                <Typography variant="body2" fontWeight={600} sx={{ minWidth: '60px' }}>
                  Starts
                </Typography>
                <Datepicker
                  style={styles.datepicker}
                  dateFormat={dateFormat}
                  originalValue={new Date(eventDetails.begin)}
                  onChange={onChangeBeginDate}
                />
                <TimeSelect
                  options={timeOptions}
                  value={{
                    value: format(eventDetails.begin, "H:mm"),
                  }}
                  onChange={onChangeBeginTime}
                />
                <Chip 
                  label={format(eventDetails.begin, "ccc", { locale })}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>

              <Box sx={styles.timeRow}>
                <Typography variant="body2" fontWeight={600} sx={{ minWidth: '60px' }}>
                  Ends
                </Typography>
                <Datepicker
                  style={styles.datepicker}
                  dateFormat={dateFormat}
                  originalValue={new Date(eventDetails.end)}
                  onChange={onChangeEndDate}
                />
                <TimeSelect
                  options={timeOptions}
                  value={{
                    value: format(eventDetails.end, "H:mm"),
                  }}
                  onChange={onChangeEndTime}
                  style={styles.timeSelect}
                />
                <Chip 
                  label={format(eventDetails.end, "ccc", { locale })}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>

          {/* Participants Section */}
          <Box sx={styles.section}>
            <div style={styles.sectionHeader}>
              <PeopleIcon sx={styles.sectionIcon} />
              <Typography variant="h6" fontWeight={600}>
                Participants
              </Typography>
            </div>
            
            <Box sx={styles.participantSection}>
              <ParticipantAdd
                onAdd={(pubKey) => {
                  const newParticipants = Array.from(
                    new Set([...eventDetails.participants, pubKey]),
                  );
                  updateEventDetails("participants", newParticipants);
                }}
              />
              
              {eventDetails.participants.map((participant) => (
                <Box key={participant} sx={styles.participantItem}>
                  <Participant pubKey={participant} />
                  <IconButton
                    sx={styles.removeButton}
                    onClick={() => {
                      const newParticipants = eventDetails.participants.filter(
                        (pubKey) => pubKey !== participant,
                      );
                      updateEventDetails("participants", newParticipants);
                    }}
                    size="small"
                  >
                    <PersonRemoveIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Description Section */}
          <Box sx={styles.section}>
            <div style={styles.sectionHeader}>
              <SubjectIcon sx={styles.sectionIcon} />
              <Typography variant="h6" fontWeight={600}>
                Description
              </Typography>
            </div>
            
            <TextField
              fullWidth
              placeholder="Add event description..."
              multiline
              rows={4}
              onChange={(event) => {
                updateEventDetails("description", event.target.value);
              }}
              value={eventDetails.description}
              sx={styles.textField}
            />
          </Box>
        </form>
      </DialogContent>
      
      <DialogActions sx={{ padding: theme.spacing(2, 3, 3, 3) }}>
        <Box sx={styles.privacySection}>
          <div style={styles.privacyToggle}>
            {eventMetaDetails.type === "private" ? (
              <LockIcon color="primary" />
            ) : (
              <PublicIcon color="secondary" />
            )}
            <FormControlLabel
              control={
                <Switch
                  onChange={(event) => {
                    updateEventMetaDetails((details) => ({
                      ...details,
                      type: event.target.checked ? "private" : "public",
                    }));
                  }}
                  checked={eventMetaDetails.type === "private"}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {intl.formatMessage({ id: "navigation.privateEvent" })}
                  </Typography>
                  <Chip
                    label={eventMetaDetails.type}
                    size="small"
                    color={eventMetaDetails.type === "private" ? "primary" : "secondary"}
                    sx={styles.privacyChip}
                  />
                </Box>
              }
            />
            <Tooltip
              placement="top"
              title={intl.formatMessage({ id: "navigation.privateEventCaption" })}
            >
              <IconButton size="small">
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </div>
        </Box>
        
        <Button 
          onClick={handleOk} 
          color="primary" 
          disabled={buttonDisabled}
          sx={styles.saveButton}
        >
          {processing ? (
            <div style={styles.loadingButton}>
              <CircularProgress size={20} color="inherit" />
              <span>Publishing...</span>
            </div>
          ) : (
            intl.formatMessage({ id: "navigation.save" })
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CalendarEventDialog;