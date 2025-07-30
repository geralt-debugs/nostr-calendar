import { useContext } from "react";
import { CalendarContext } from "../common/CalendarContext";
import { Grid, Theme, useTheme } from "@mui/material";
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
    // margin: "auto",
    // marginTop: -30,
    // width: 'fit-content',
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
  console.log(calendarEvent);
  const { locale } = stateCalendar;

  const handleCloseViewDialog = () => {
    closeEventDetails();
  };
  console.log(calendarEvent);

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
      open={true}
      onClose={handleCloseViewDialog}
      aria-labelledby="max-width-dialog-title"
      keepMounted={false}
    >
      <DialogTitle>
        <Typography variant="h5">{calendarEvent.title || ""}</Typography>
        <div style={{ ...styles.divTitleButton }}>
          <IconButton aria-label="Close" onClick={handleCloseViewDialog}>
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent style={{ ...styles.dialogContent }}>
        {calendarEvent.image && (
          <img style={{ width: "100%" }} src={calendarEvent.image}></img>
        )}
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
        <div>
          <Typography variant="subtitle1">
            {formatMessage({ id: "navigation.description" })}
          </Typography>
          <Typography variant="body2">
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
            <Typography variant="body2">
              {calendarEvent.location.map((location) => (
                <Grid
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <LocationOnOutlinedIcon style={{ height: "20px" }} />{" "}
                  {<Markdown remarkPlugins={[remarkGfm]}>{location}</Markdown>}
                </Grid>
              ))}
            </Typography>
          </div>
        )}
      </DialogContent>
      <DialogActions />
    </Dialog>
  );
}

export default CalendarEventViewDialog;
