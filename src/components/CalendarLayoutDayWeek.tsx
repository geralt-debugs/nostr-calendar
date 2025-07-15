import { useContext, useMemo } from "react";
import { CalendarContext } from "../common/CalendarContext";
import { styled, Theme, useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import { cyan } from "@mui/material/colors";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import CalendarHeader from "./CalendarHeader";
import CalendarBoard from "./CalendarBoard";
import CalendarBoardDragLayer from "./CalendarBoardDragLayer";
import { IGetStyles } from "../common/types";

const Body = styled(Grid)`
  height: calc(100% - 150px);
  overflow-x: scroll;
  overflow: scroll;
  align-items: stretch;
`;

const getStyles: IGetStyles = (theme: Theme) => ({
  hide: {
    display: "none",
  },
  show: {
    display: "initial",
  },
  root: {
    flexGrow: 1,
    height: "100%",
    // border: '1px solid darkred',
    overflow: "hidden",
    paddingTop: 1,
    backgroundColor: theme.palette.background.paper,
  },
  timeColumnContainer: {
    color: theme.palette.text.secondary,
    backgroundColor: "transparent",
    height: "auto",
    overflowY: "hidden",
    flex: "none",
    display: "flex",
    alignItems: "flex-start",
    minWidth: 40,
    maxWidth: 40,
    marginTop: -8,
  },
  timeColumn: {
    position: "relative",
    webkitBoxSizing: "border-box",
    marginLeft: "auto",
  },
  timeColumnElement: {
    position: "relative",
    height: 60,
    paddingRight: 8,
    textAlign: "right",
    color: "#70757a",
    fontSize: 12,
  },
  boardContainer: {
    // borderRight: '1px solid #dadce0',
    overflowX: "auto",
    overflowY: "scroll",
    display: "flex",
    alignItems: "flex-start",
    width: "calc(100% - 40px)",
    // backgroundColor: 'rgba(245, 245, 220, 0.30)',
    // height: '100%',
  },
  board: {
    minWidth: "100%",
    height: "100%",
    flex: "none",
    verticalAlign: "top",
    overflow: "hidden",
    position: "relative",
  },
  columnDivisor: {
    height: "100%",
    paddingLeft: 8,
    borderRight: "1px solid #dadce0",
  },
  dayContainer: {
    borderRight: "1px solid #dadce0",
    position: "relative",
    paddingRight: 12,
    flex: "1 1 auto",
    height: "100%",
  },
  eventsContainer: {
    backgroundColor: "transparent",
    position: "relative",
    height: "100%",
    width: "100%",
  },
  dayContainerWeekend: {
    backgroundColor: "#F5F5F5",
  },
  currentTimeDot: {
    background: cyan[500],
    borderRadius: "50%",
    content: "''",
    position: "absolute",
    height: 12,
    width: 12,
    zIndex: 52,
    marginTop: -1000,
    marginLeft: -6.5,
  },
  currentTimeLine: {
    position: "absolute",
    zIndex: 51,
    borderColor: cyan[500],
    borderTop: "2px solid",
    left: 0,
    right: -1,
  },
});

function CalendarLayoutDayWeek(props: any) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const { selectedWeekIndex, selectedWeek } = props;

  const { stateCalendar } = useContext(CalendarContext);
  const { selectedDate, locale, layout, defaultEventDuration } = stateCalendar;

  return useMemo(() => {
    return (
      <div style={{ ...styles.root }}>
        <CalendarHeader
          selectedWeekIndex={selectedWeekIndex}
          selectedWeek={selectedWeek}
        />

        <Body
          container
          spacing={0}
          direction="row"
          justifyContent="center"
          alignItems="stretch"
        >
          <Grid size={1} style={{ ...styles.timeColumnContainer }}>
            <div style={{ ...styles.timeColumn }}>
              <div style={{ ...styles.timeColumnElement }} />
              {Array.from(Array(23).keys()).map((index) => {
                return (
                  <div
                    style={{ ...styles.timeColumnElement }}
                    key={`time-${index}`}
                  >
                    <span>{index + 1}</span>
                  </div>
                );
              })}
              <div style={{ ...styles.timeColumnContainer }} />
            </div>
          </Grid>

          <Grid style={{ ...styles.boardContainer }}>
            <DndProvider backend={HTML5Backend}>
              {/* <Container /> */}
              <CalendarBoard
                selectedWeekIndex={selectedWeekIndex}
                selectedWeek={selectedWeek}
              />
              <CalendarBoardDragLayer />
            </DndProvider>
          </Grid>
        </Body>
      </div>
    );
    // ....
    // ....
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedDate,
    locale,
    layout,
    defaultEventDuration,
    selectedWeek,
    selectedWeekIndex,
  ]);
}

export default CalendarLayoutDayWeek;
