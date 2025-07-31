import { useState, useEffect, useContext, useMemo } from "react";
import { CalendarContext } from "../common/CalendarContext";
import { styled, Theme, useTheme } from "@mui/material/styles";
import { format, differenceInMinutes } from "date-fns";
import Grid from "@mui/material/Grid";
import { grey } from "@mui/material/colors";
import { IGetStyles } from "../common/types";
import { useSettings } from "../stores/settings";

const HeaderContainer = styled(Grid)`
  height: 100px;
  &:after {
    content: "";
    position: absolute;
    top: 165px;
    left: 300px;
    height: 1px;
    width: calc(100% + 145px);
    border-top: 1px solid #dadce0;
  }
`;

const DayLabel = styled("span")<{
  isToday: boolean;
  paperColour: string;
  primaryColour: string;
  hoverColour: string;
}>`
  vertical-align: top;
  overflow: hidden;
  position: relative;
  width: 45px;
  height: 45px;
  line-height: 45px;
  border-color: ${({ isToday, primaryColour }) => (isToday ? primaryColour : "transparent")};
  background-color:${({ isToday, paperColour, primaryColour }) => (isToday ? primaryColour : paperColour)};
  color: ${({ isToday }) => (isToday ? "#fff" : "inherit")};
  border: ${({ isToday, primaryColour }) => (isToday ? `1px solid ${primaryColour}` : "none")};
  border-radius: 100%;
  text-align: center;
  cursor: pointer;
  &:hover {
    border-color: ${({ isToday, hoverColour }) => (isToday ? hoverColour : "transparent")};
    background-color:${({ isToday, primaryColour }) => (isToday ? primaryColour : grey[200])};
  },

`;

const getStyles: IGetStyles = (theme: Theme) => ({
  headerFirstColumn: {
    height: 15,
    marginTop: 85,
    paddingLeft: 8,
    borderRight: "1px solid #dadce0",
  },
  headerColumn: {
    borderRight: "1px solid #dadce0",
    position: "relative",
    paddingRight: 12,
    flex: "1 1 auto",
    height: 15,
    marginTop: 85,
  },
  headerColumnWeekend: {
    backgroundColor: "#F5F5F5",
  },
  headerLabelsFirst: {
    position: "absolute",
    top: -75,
    left: -1,
    height: 20,
    width: "100%",
    // border: '1px solid red',
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    color: "#70757a",
    fontWeight: 500,
    textTransform: "uppercase",
  },
  headerLabelsSecond: {
    position: "absolute",
    top: -55,
    left: -1,
    height: 45,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    color: "#70757a",
  },
  headerLabelsThird: {
    position: "absolute",
    top: -7,
    left: -1,
    height: 20,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
  },
  headerLabelColumn: {
    borderRight: "1px solid green",
  },
  headerLabelText: {
    borderRight: "1px solid green",
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
  },
  timeColumnElement: {
    position: "relative",
    height: 60,
    paddingRight: 8,
    textAlign: "right",
    color: "#70757a",
    fontSize: 12,
  },
});

function CalendarHeader(props: any) {
  const theme = useTheme();
  const styles = getStyles(theme);

  const { selectedWeekIndex, selectedWeek } = props;
  const { layout } = useSettings((state) => state.settings);

  const { stateCalendar, setStateCalendar } = useContext(CalendarContext);
  const { selectedDate, locale, defaultEventDuration } = stateCalendar;
  const [currentTimePosition, setCurrentTimePosition] = useState<number>();

  useEffect(() => {
    setInterval(() => {
      const now = new Date();
      const initTime = new Date(format(now, "yyyy/MM/dd 0:0:0"));
      const position = differenceInMinutes(now, initTime);
      setCurrentTimePosition(position);
    }, 1000);
  }, []);

  return useMemo(() => {
    const viewLayout = Array.from(
      Array(layout === "week" ? 7 : layout === "day" ? 1 : 0).keys(),
    );

    const handleDayClick = (event: any) => {
      const gridParent = event.target.parentElement.parentElement;
      setStateCalendar({
        ...stateCalendar,
        layout: "day",
        selectedDate: new Date(gridParent.dataset.day),
      });
      // handleOpenCloseDialog()
    };

    return (
      <HeaderContainer
        container
        spacing={0}
        direction="row"
        justifyContent={"center"}
        alignItems="stretch"
      >
        <Grid style={{ ...styles.timeColumnContainer, ...styles.timeColumn }}>
          {/* <div className={classes.timeColumn}> */}
          <div style={{ ...styles.timeColumnElement }} />
          {/* </div> */}
        </Grid>

        <Grid style={{ width: "calc(100% - 40px)" }}>
          <Grid
            container
            spacing={0}
            direction="row"
            justifyContent="center"
            alignItems="flex-start"
            style={{ ...styles.board }}
          >
            <div style={{ ...styles.headerFirstColumn }} />
            {viewLayout.map((index) => {
              const day =
                layout === "week" ? selectedWeek[index] : selectedDate;
              const isToday =
                format(day, "ddMMyyyy") === format(new Date(), "ddMMyyyy");

              return (
                <Grid
                  id={`headerDay${index}`}
                  data-group="day-header"
                  data-day={day}
                  style={{ ...styles.headerColumn }}
                  key={`header-label-${layout}-${selectedWeekIndex}-${day}`}
                >
                  <div style={{ ...styles.headerLabelsFirst }}>
                    <span>{format(day, "ccc", { locale: locale })}</span>
                  </div>
                  <div style={{ ...styles.headerLabelsSecond }}>
                    <DayLabel
                      primaryColour={theme.palette.primary.main}
                      hoverColour={theme.palette.primary.dark}
                      paperColour={theme.palette.background.paper}
                      onClick={handleDayClick}
                      isToday={isToday}
                    >
                      {format(day, "d", { locale: locale })}
                    </DayLabel>
                  </div>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </HeaderContainer>
    );
    // ....
    // ....
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentTimePosition,
    selectedDate,
    locale,
    layout,
    defaultEventDuration,
    selectedWeek,
    selectedWeekIndex,
  ]);
}

export default CalendarHeader;
