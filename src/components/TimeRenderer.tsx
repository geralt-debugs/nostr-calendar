import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import { Box, Typography } from "@mui/material";
import { format, FormatOptions } from "date-fns";
import { ICalendarEvent } from "../stores/events";

const Repeat = ({ repeat }: { repeat: ICalendarEvent["repeat"] }) => {
  if (!repeat.frequency) {
    return null;
  }
  return (
    <>
      <EventRepeatIcon />
      <Typography>Repeats {repeat.frequency}</Typography>
    </>
  );
};

export const TimeRenderer = ({
  begin,
  end,
  locale,
  repeat,
}: {
  begin: number;
  end: number;
  locale: FormatOptions["locale"];
  repeat: ICalendarEvent["repeat"];
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <AccessTimeIcon />
        <Typography>
          {format(new Date(begin), "ccc, d MMMM yyyy ⋅ HH:mm -", {
            locale: locale,
          })}{" "}
          {format(new Date(end), "HH:mm", {
            locale: locale,
          })}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Repeat repeat={repeat} />
      </Box>
    </Box>
  );
};
