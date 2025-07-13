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
import { format, getTime } from "date-fns";
import TimeSelect from "../engine_components/TimeSelect";
import Datepicker from "../engine_components/Datepicker";
import { IGetStyles } from "../common/types";

// maxWidth: xs, sm, md, lg, xl

const Transition = React.forwardRef<unknown, TransitionProps>(
  function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
  },
);

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
const timeOptions = Array.from(Array(24).keys()).reduce(
  (time: any[], hour: number) => {
    Array.from(Array(60 / interval).keys()).map((i) => {
      const timeItem = (+(hour + "." + i * interval))
        .toFixed(2)
        .replace(".", ":");
      time.push({ value: timeItem, label: timeItem });
      return null;
    });
    return time;
  },
  [],
);

function CalendarEventDialog(props: any) {
  const theme = useTheme();
  const styles = getStyles(theme);

  // const { stateCalendar, setStateCalendar } = useContext(CalendarContext)
  const { stateCalendar, setStateCalendar } = useContext(CalendarContext);
  const {
    modal = false,
    eventDialogMaxWidth = "md",
    fullscreen = false,
    allowFullScreen = false,
    withCloseIcon = true,
    eventID = 0,
    title,
    description,
    openDialog,
    eventBeginDate,
    eventBeginTime,
    eventEndDate,
    eventEndTime,
    // minutes,
    locale,
  } = stateCalendar;

  const handleCloseDialog = () => {
    setStateCalendar({
      ...stateCalendar,
      openDialog: false,
      openViewDialog: false,
    });
  };

  const [fullScreen, setFullScreen] = useState(false);

  // useEffect(() => {
  //     console.log("useEffect for eventBeginDate", eventBeginDate)
  //     console.log("useEffect for eventEndDate", eventEndDate)
  // }, [eventBeginDate, eventEndDate])

  // useEffect(() => {
  //     console.log("useEffect for eventBeginDate", eventBeginDate)
  //     console.log("useEffect for eventEndDate", eventEndDate)
  // }, [eventBeginDate, eventEndDate])

  const textFieldTitle = useRef<HTMLInputElement | null>(null);
  const [titleTF, setTitleTF] = useState(title);
  const [descriptionTF, setDescriptionTF] = useState(description);

  useEffect(() => {
    setTitleTF(title);
  }, [title]);

  useEffect(() => {
    setDescriptionTF(description);
  }, [description]);

  return useMemo(() => {
    // console.group('CalendarEventDialog')
    // console.log('memo?!')
    // console.groupEnd()

    const onExited = () => {
      setFullScreen(false);
      setDescriptionTF("");
      setTitleTF("");
    };

    const handleOnClose = () => {
      if (!modal) {
        handleClose();
      }
    };

    const handleClose = () => {
      handleCloseDialog();
    };

    const handleFullScreen = () => {
      setFullScreen(!fullScreen);
    };

    const handleOk = () => {
      const localStorageMarckers = window.localStorage.getItem("markers");
      const markers =
        (localStorageMarckers && JSON.parse(localStorageMarckers)) || [];
      const marker = {
        id: eventID > 0 ? eventID : getTime(new Date()),
        title: titleTF,
        begin: format(
          formatDateTime(eventBeginDate, eventBeginTime.value),
          "yyyy/MM/dd HH:mm:ss",
        ),
        end: format(
          formatDateTime(eventEndDate, eventEndTime.value),
          "yyyy/MM/dd HH:mm:ss",
        ),
        description: descriptionTF,
      };

      console.log({ eventID });
      window.localStorage.setItem(
        "markers",
        JSON.stringify([
          ...markers.filter((markEvent: any) => markEvent.id !== eventID),
          marker,
        ]),
      );

      handleClose();
    };

    // function handleCancel() {
    //     handleClose()
    // }

    const formatDateTime = (newDate: Date, newTime: string) => {
      // console.log("formatDateTime: newDate", newDate)
      // console.log("formatDateTime: newTime", newTime)
      const dateTxt = format(newDate, "yyyy/MM/dd");
      return new Date(dateTxt + " " + newTime);
    };

    const onChangeBeginDate = (newDate: Date) => {
      setStateCalendar({
        ...stateCalendar,
        eventBeginDate: newDate,
        eventEndDate: new Date(
          format(newDate, "yyyy/MM/dd ") + format(eventEndDate, "HH:mm"),
        ),
      });
    };
    const onChangeEndDate = (newDate: Date) => {
      setStateCalendar({ ...stateCalendar, eventEndDate: newDate });
    };

    const onChangeBeginTime = (newValue: any) => {
      setStateCalendar({ ...stateCalendar, eventBeginTime: newValue });
    };

    const onChangeEndTime = (newValue: any) => {
      setStateCalendar({ ...stateCalendar, eventEndTime: newValue });
    };

    const dateFormat = "dd/MM/yyyy";

    // const buttonDisabled = titleTF.length <= 0 || eventBeginDate > eventEndDate
    const buttonDisabled =
      eventBeginTime && eventEndTime
        ? formatDateTime(eventBeginDate, eventBeginTime.value) >
          formatDateTime(eventEndDate, eventEndTime.value)
        : false;

    return (
      <Dialog
        onEntered={() => {
          setTitleTF(title);
          setDescriptionTF(description);
          if (textFieldTitle.current !== null) {
            textFieldTitle.current!.focus();
          }
        }}
        onExited={onExited}
        fullScreen={fullscreen || fullScreen}
        fullWidth={true}
        maxWidth={eventDialogMaxWidth}
        open={openDialog}
        onClose={handleOnClose}
        aria-labelledby="max-width-dialog-title"
        TransitionComponent={Transition}
        keepMounted={false}
      >
        <DialogTitle>
          {title}
          <div style={{ ...styles.divTitleButton }}>
            {allowFullScreen ? (
              <IconButton
                aria-label="Close"
                style={{ ...styles.fullScreenButton }}
                onClick={handleFullScreen}
              >
                {!fullScreen ? <FullscreenIcon /> : <FullscreenExitIcon />}
              </IconButton>
            ) : null}
            {withCloseIcon ? (
              <IconButton
                aria-label="Close"
                style={{ ...styles.closeButton }}
                onClick={handleClose}
              >
                <CloseIcon />
              </IconButton>
            ) : null}
          </div>
        </DialogTitle>
        <DialogContent>
          <form style={{ ...styles.form }} noValidate>
            <FormControl style={{ ...styles.formControl }}>
              <TextField
                inputRef={textFieldTitle}
                style={{ ...styles.title }}
                fullWidth={true}
                placeholder="Title"
                name="title"
                value={titleTF}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setTitleTF(event.target.value);
                }}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter" && !buttonDisabled) {
                    handleOk();
                    handleClose();
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
                originalValue={new Date(eventBeginDate)}
                onChange={onChangeBeginDate}
              />
              <TimeSelect
                placeholder={""}
                options={timeOptions}
                originalValue={{
                  value: eventBeginTime.value,
                  label: eventBeginTime.label,
                }}
                onChange={onChangeBeginTime}
              />
              <Typography style={{ ...styles.dayOfWeek }}>
                {format(eventBeginDate, "ccc", { locale: locale })}
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
                originalValue={eventEndDate}
                onChange={onChangeEndDate}
              />
              <TimeSelect
                placeholder={""}
                options={timeOptions}
                originalValue={{
                  value: eventEndTime.value,
                  label: eventEndTime.label,
                }}
                onChange={onChangeEndTime}
              />
              <Typography style={{ ...styles.dayOfWeek }}>
                {format(eventEndDate, "ccc", { locale: locale })}
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
                // style={{...styles.textField} }
                // margin='normal'
                onChange={(event: any) => {
                  setDescriptionTF(event.target.value);
                }}
                value={descriptionTF}
              />
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOk} color="primary" disabled={buttonDisabled}>
            save
          </Button>
          {/* <Button onClick={handleCancel} style={{...styles.cancelButton}> */}
          {/* cancel */}
          {/* </Button> */}
        </DialogActions>
      </Dialog>
    );
    // ....
    // ....
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    openDialog,
    titleTF,
    descriptionTF,
    eventBeginDate,
    eventBeginTime,
    eventEndDate,
    eventEndTime,
    allowFullScreen,
    eventDialogMaxWidth,
    eventID,
    fullScreen,
    fullscreen,
    handleCloseDialog,
    locale,
    modal,
    title,
    description,
    withCloseIcon,
  ]);
}

export default CalendarEventDialog;
