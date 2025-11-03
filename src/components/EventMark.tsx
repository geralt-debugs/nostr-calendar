import React, { useEffect } from "react";
import { styled, Theme, useTheme } from "@mui/material/styles";
import { format, differenceInMinutes } from "date-fns";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { IGetStyles } from "../common/types";
import { useEventDetails } from "../stores/eventDetails";
import { ICalendarEvent } from "../stores/events";
import { teal } from "@mui/material/colors";

const MarkerStyle = styled("div")<{
  position: number;
  duration: number;
  len: number;
  sq: number;
  isPrivateEvent: boolean;
  isSelected: boolean;
}>(({ theme, position, duration, len, sq, isPrivateEvent, isSelected }) => ({
  marginTop: position,
  height: duration,
  width: `calc((100% / ${len}) - 2px)`,
  marginLeft: `calc(100% / ${len} * ${sq})`,
  overflow: "hidden",
  position: "absolute",
  border: `1px solid ${isPrivateEvent ? teal[200] : theme.palette.primary.dark}`,
  borderRadius: "12px",
  backgroundColor: isPrivateEvent ? teal[100] : theme.palette.primary.main,
  padding: "4px 8px",
  cursor: "pointer",
  boxShadow: isSelected
    ? "6px 6px 8px 0px rgba(0,0,0,0.4)"
    : "4px 4px 4px 0px rgba(0,0,0,0.25)",
  zIndex: isSelected ? 53 : 50,
  "&:hover": {
    backgroundColor: isPrivateEvent ? teal[50] : theme.palette.primary.light,
  },
  minHeight: 24,
}));

const getBaseStyles: IGetStyles = (theme: Theme) => ({
  markerText: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  beginEnd: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    fontSize: 10,
  },
  extraInfo: {
    fontSize: 7,
  },
  content: {
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

function getStyles(
  left: number,
  top: number,
  isDragging: boolean,
): React.CSSProperties {
  const transform = `translate3d(${left}px, ${top}px, 0)`;

  return {
    position: "absolute",
    transform: isDragging ? transform : "initial",
    WebkitTransform: isDragging ? transform : "initial",
    // IE fallback: hide the real node using CSS when dragging
    // because IE will ignore our custom "empty image" drag preview.
    opacity: isDragging ? 0 : 1,
    height: isDragging ? 0 : "",
  };
}

function EventMark({
  calendarEvent,
  sq,
  len,
}: {
  calendarEvent: ICalendarEvent;
  sq: number;
  len: number;
}) {
  const theme = useTheme();
  const styles = getBaseStyles(theme);
  const { updateEvent, selectedEventId } = useEventDetails((state) => state);
  const isSelected = selectedEventId === calendarEvent.id;

  const beginDate = new Date(calendarEvent.begin);
  const endDate = new Date(calendarEvent.end);

  const beginDateFormatted = format(
    beginDate,
    format(beginDate, "mm") === "00" ? "HH" : "HH:mm",
  );
  const endDateFormatted = format(
    endDate,
    format(endDate, "mm") === "00" ? "HH" : "HH:mm",
  );

  const currentDay = beginDate;
  const initTime = new Date(format(currentDay, "yyyy/MM/dd 0:0:0"));
  const position = differenceInMinutes(currentDay, initTime) + 2;

  const duration = differenceInMinutes(endDate, beginDate) - 3;

  const viewEvent = () => {
    updateEvent(calendarEvent);
  };

  const [{ isDragging }, drag, preview] = useDrag({
    type: "box",
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: false });
  }, [preview]);

  // function getRandomColor() {
  //     var hex = Math.floor(Math.random() * 0xffffff)
  //     return "#" + ("000000" + hex.toString(16)).substr(-6)
  // }

  const left = (100 / len) * sq + 1;

  const onDragStart = (
    eventEl: React.DragEvent<HTMLDivElement>,
    calendarEvent: ICalendarEvent,
  ) => {
    const width =
      eventEl.currentTarget.parentElement?.parentElement?.offsetWidth;
    const height = eventEl.currentTarget.clientHeight + 5;
    console.log(width, height);
  };

  return (
    <MarkerStyle
      id={calendarEvent.id}
      position={position}
      duration={duration}
      len={len}
      sq={sq}
      isPrivateEvent={calendarEvent.isPrivateEvent}
      isSelected={isSelected}
      onDragStart={(eventEl) => onDragStart(eventEl, calendarEvent)}
      onDragEnd={(eventEl) => onDragStart(eventEl, calendarEvent)}
      style={{
        ...getStyles(left, position / 57 - 2, isDragging),
      }}
      onClick={(eventEl) => {
        eventEl.stopPropagation();
        viewEvent();
      }}
    >
      <div style={{ ...styles.markerText }}>
        {calendarEvent.title || calendarEvent.description}
      </div>
      <div style={{ ...styles.beginEnd }}>
        <span>{beginDateFormatted}</span>
        <span> - </span>
        <span>{endDateFormatted}</span>
      </div>
    </MarkerStyle>
  );
}

export default EventMark;
