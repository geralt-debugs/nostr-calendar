import {
  DateCalendar,
  DateCalendarProps,
} from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useLayout } from "../hooks/useLayout";
import { useDateWithRouting } from "../hooks/useDateWithRouting";

dayjs.extend(utc);

export const DatePicker = ({ onSelect }: { onSelect?: () => void }) => {
  const { layout } = useLayout();
  const { date, setDate } = useDateWithRouting();
  const parsedDate = date.format();
  const onChange: DateCalendarProps["onChange"] = (newDate) => {
    if (newDate) {
      setDate(newDate, layout);
    }
    onSelect?.();
  };
  const views: DateCalendarProps["views"] =
    layout === "month" ? ["month", "year"] : undefined;
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar
        onChange={onChange}
        views={views}
        referenceDate={dayjs(parsedDate)}
        displayWeekNumber
      />
    </LocalizationProvider>
  );
};
