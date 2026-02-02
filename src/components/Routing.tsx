import { Route, Routes } from "react-router";
import { ViewEventPage } from "./ViewEventPage";
import { ROUTES } from "../utils/routingHelper";
import { Index } from "./Index";
import Calendar from "./Calendar";

export const Routing = () => {
  return (
    <Routes>
      <Route path={ROUTES.EventPage} element={<ViewEventPage />} />
      <Route path={ROUTES.WeekCalendar} element={<Calendar />} />
      <Route path={ROUTES.MonthCalendar} element={<Calendar />} />
      <Route path={ROUTES.DayCalendar} element={<Calendar />} />
      <Route path="*" element={<Index />} />
    </Routes>
  );
};
