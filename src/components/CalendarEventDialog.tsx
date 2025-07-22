import React, { useContext, useState, useMemo, useRef, useEffect } from "react";
import { CalendarContext } from "../common/CalendarContext";
import { Theme, useTheme } from "@mui/material";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
// import red from "@mui/material/colors/red"
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
import { format } from "date-fns";
import TimeSelect from "../engine_components/TimeSelect";
import Datepicker from "../engine_components/Datepicker";
import { IGetStyles } from "../common/types";
import { useIntl } from "react-intl";
import { useEventDetails } from "../stores/eventDetails";
import { publishCalendarEvent } from "../common/nostr";

const getStyles: IGetStyles = (theme: Theme) => ({
  divTitleButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
  },
  fullScreenButton: {
    color: theme.palette.grey[900],
  },
  closeButton: {
    // color: theme.palette.grey[900],
    // color: theme.palette.secondary.light,
    // color: red[500],
    // "&:hover": {
    // backgroundColor: red[100],
    // },
  },
  cancelButton: {
    // color: red[500],
    // "&:hover": {
    //     backgroundColor: red[100],
    // },
  },
  form: {
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    // marginTop: -30,
    // width: 'fit-content',
  },
  formControl: {
    marginTop: theme.spacing(2),
    // minWidth: 120,
  },
  formControlFlex: {
    display: "inline-flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  title: {
    marginTop: 0,
  },
  descriptionIcon: {
    // marginTop: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
  formControlLabel: {
    marginTop: theme.spacing(1),
  },
  betweenDates: {
    textAlign: "center",
    fontSize: 16,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  datepicker: {
    width: 130,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    "&:hover": {
      backgroundColor: grey[100],
    },
  },
  dayOfWeek: {
    marginLeft: theme.spacing(1),
    color: grey[500],
  },
});

// const firstTime = "8:00"
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

  // const { stateCalendar, setStateCalendar } = useContext(CalendarContext)
  const { stateCalendar } = useContext(CalendarContext);
  const { locale } = stateCalendar;

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

  const handleOk = () => {
    publishCalendarEvent(eventDetails);

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
    updateEvent({
      ...eventDetails,
      begin: newBegin.getTime(),
      end: newEnd.getTime(),
    });
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

  // const buttonDisabled = titleTF.length <= 0 || eventBeginDate > eventEndDate
  const buttonDisabled = !(
    eventDetails.title &&
    eventDetails.begin &&
    eventDetails.end &&
    eventDetails.begin < eventDetails.end
  );

  return (
    <Dialog
      fullScreen={false}
      fullWidth={true}
      maxWidth={"md"}
      open={open}
      onClose={handleOnClose}
      aria-labelledby="max-width-dialog-title"
      keepMounted={false}
    >
      <DialogTitle>
        {eventDetails.title}
        <div style={{ ...styles.divTitleButton }}>
          {fullScreen ? (
            <IconButton
              aria-label="Close"
              style={{ ...styles.fullScreenButton }}
              onClick={handleFullScreen}
            >
              {!fullScreen ? <FullscreenIcon /> : <FullscreenExitIcon />}
            </IconButton>
          ) : null}
          <IconButton
            aria-label="Close"
            style={{ ...styles.closeButton }}
            onClick={handleOnClose}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent>
        <form style={{ ...styles.form }} noValidate>
          <FormControl style={{ ...styles.formControl }}>
            <TextField
              style={{ ...styles.title }}
              fullWidth={true}
              placeholder="Title"
              name="title"
              value={eventDetails.title}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                updateEventDetails("title", event.target.value);
              }}
              onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.key === "Enter" && !buttonDisabled) {
                  handleOk();
                }
              }}
              margin="normal"
              required={true}
            />
          </FormControl>
          <FormControl
            style={{
              ...styles.formControl,
              ...styles.formControlFlex,
            }}
          >
            <AccessTimeIcon />
            <Datepicker
              style={{ ...styles.datepicker }}
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
            <Typography style={{ ...styles.dayOfWeek }}>
              {format(eventDetails.begin, "ccc", { locale: locale })}
            </Typography>
          </FormControl>
          <FormControl
            style={{
              ...styles.formControl,
              ...styles.formControlFlex,
            }}
          >
            <AccessTimeIcon />
            <Datepicker
              style={{ ...styles.datepicker }}
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
            />
            <Typography style={{ ...styles.dayOfWeek }}>
              {format(eventDetails.end, "ccc", { locale: locale })}
            </Typography>
          </FormControl>
          <FormControl
            style={{
              ...styles.formControl,
              ...styles.formControlFlex,
            }}
          >
            <SubjectIcon style={{ ...styles.descriptionIcon }} />
            <TextField
              fullWidth={true}
              placeholder="Description"
              multiline
              onChange={(event) => {
                updateEventDetails("description", event.target.value);
              }}
              value={eventDetails.description}
            />
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOk} color="primary" disabled={buttonDisabled}>
          {intl.formatMessage({ id: "navigation.save" })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CalendarEventDialog;
