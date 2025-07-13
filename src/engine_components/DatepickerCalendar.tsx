import { createPortal } from "react-dom";
import { useTheme, Theme } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Collapse from "@mui/material/Collapse";
import CalendarSmall from "./CalendarSmall";
import { IGetStyles } from "../common/types";

const getStyles: IGetStyles = (theme: Theme) => ({
  collapseCalendar: {
    position: "absolute",
    zIndex: 1600,
  },
  paper: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    // marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
    maxWidth: 272,
  },
});

function DatepickerCalendar(props: any) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const {
    datepickerValue = new Date(),
    calendarPosition = { top: 0, left: 0 },
    openCalendar,
    handleClickAway,
    handleChangeDateCalendar,
  } = props;

  const popupCalendar = (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Collapse
        in={openCalendar}
        style={{
          top: calendarPosition.top,
          left: calendarPosition.left,
          ...styles.collapseCalendar,
        }}
        // style={{ top: 200, left: 400 }}
      >
        <Paper
          style={{
            ...styles.paper,
          }}
        >
          <CalendarSmall
            isDatepicker={true}
            datepickerOnChange={handleChangeDateCalendar}
            datepickerValue={datepickerValue}
          />
        </Paper>
      </Collapse>
    </ClickAwayListener>
  );

  const appRoot = document.body;
  return createPortal(popupCalendar, appRoot);
}

export default DatepickerCalendar;
