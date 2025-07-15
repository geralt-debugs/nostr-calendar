import React, { useContext, useMemo } from "react";
import { CalendarContext } from "../common/CalendarContext";
import { Theme, useTheme } from "@mui/material";
import { format } from "date-fns";
import FormControl from "@mui/material/FormControl";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import createEditEvent from "./createEditEvent";
import { IGetStyles } from "../common/types";

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
  closeButton: {
    // color: theme.palette.grey[900],
    // color: theme.palette.secondary.light,
    // color: red[500],
    // "&:hover": {
    // backgroundColor: red[100],
    // },
  },
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    // margin: "auto",
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
  icon: {
    marginRight: theme.spacing(1),
  },
  optionsBar: {
    marginTop: theme.spacing(-1),
    display: "inline-flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});

function CalendarEventViewDialog(props: any) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const { stateCalendar, setStateCalendar } = useContext(CalendarContext);
  const { openViewDialog, locale, calendarEvent } = stateCalendar;

  return useMemo(() => {
    // console.group('CalendarEventViewDialog')
    // console.log(calendarEvent)
    // console.groupEnd()

    const handleCloseViewDialog = () => {
      setStateCalendar({ ...stateCalendar, openViewDialog: false });
    };

    return (
      <Dialog
        // onEntered={() => {
        //     console.log(textFieldTitle)
        //     textFieldTitle.current !== null && textFieldTitle.current!.focus()
        // }}
        // onExited={onExited}
        fullScreen={false}
        fullWidth={true}
        maxWidth="sm"
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        aria-labelledby="max-width-dialog-title"
        TransitionComponent={Transition}
        keepMounted={false}
      >
        <DialogTitle>
          {calendarEvent.title || ""}
          <div style={{ ...styles.divTitleButton }}>
            <IconButton
              aria-label="Close"
              style={{ ...styles.closeButton }}
              onClick={handleCloseViewDialog}
            >
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent style={{ ...styles.dialogContent }}>
          {/* <FormControl style={{ ...styles.optionsBar }}>
            <Tooltip title="Edit">
              <IconButton
                size="medium"
                aria-label="Edit event"
                // onClick={() => }
                onClick={(eventEl: any) => {
                  createEditEvent({
                    eventEl,
                    // defaultEventDuration,
                    stateCalendar,
                    setStateCalendar,
                    calendarEvent,
                  });
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="medium"
                edge="end"
                aria-label="Delete event"
                // onClick={() => }
                onClick={() => {
                  console.log("DELETE!!!!");
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </FormControl> */}
          <FormControl
            style={{ ...styles.formControl, ...styles.formControlFlex }}
          >
            <AccessTimeIcon style={{ ...styles.icon }} />
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
          </FormControl>
        </DialogContent>
        <DialogActions />
      </Dialog>
    );
    // ....
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarEvent, locale, openViewDialog]);
}

export default CalendarEventViewDialog;
