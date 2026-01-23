import {
  alpha,
  Box,
  IconButton,
  Paper,
  styled,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { ICalendarEvent } from "../utils/types";
import { DateLabel } from "./DateLabel";
import { useDateWithRouting } from "../hooks/useDateWithRouting";
import { isWeekend } from "../utils/dateHelper";
import ShortcutIcon from "@mui/icons-material/Shortcut";

interface MonthViewProps {
  events: ICalendarEvent[];
}

const StyledPaper = styled(Paper)`
  .goto-week {
    visibility: hidden;
  }
  &:hover > .goto-week {
    visibility: visible;
  }
`;

export function MonthView({ events }: MonthViewProps) {
  const { date, setDate } = useDateWithRouting();
  const end = date.endOf("month").endOf("week");
  const start = date.startOf("month").startOf("week");
  const theme = useTheme();

  const days: Dayjs[] = [];
  let d = start;
  while (d.isBefore(end)) {
    days.push(d);
    d = d.add(1, "day");
  }

  return (
    <Box display="grid" gridTemplateColumns="repeat(7, 1fr)">
      {Array(7)
        .fill(null)
        .map((_, index) => {
          return (
            <Typography
              display={"flex"}
              justifyContent={"center"}
              variant="body1"
              key={index}
              fontWeight={600}
              marginBottom={theme.spacing(1)}
            >
              {dayjs().isoWeekday(index).format("ddd")}
            </Typography>
          );
        })}
      {days.map((day) => (
        <StyledPaper
          elevation={0}
          square
          key={day.toString()}
          sx={{
            position: "relative",
            minHeight: 120,
            p: 0.5,
            background: isWeekend(day)
              ? alpha(theme.palette.primary.main, 0.1)
              : "transparent",
          }}
        >
          <DateLabel day={day} />
          <Box display={"flex"} flexDirection={"column"}>
            {events
              .filter((e) => dayjs(e.begin).isSame(day, "day"))
              .slice(0, 3)
              .map((e) => (
                <Typography key={e.id} variant="caption" noWrap>
                  • {e.title}
                </Typography>
              ))}
          </Box>
          <IconButton
            className="goto-week"
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
            }}
            title="go to week"
            onClick={() => {
              setDate(day, "week");
            }}
          >
            <ShortcutIcon />
          </IconButton>
        </StyledPaper>
      ))}
    </Box>
  );
}
