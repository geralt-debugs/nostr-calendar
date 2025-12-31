import { ReactNode } from "react";
import { Route, Routes } from "react-router";
import { ViewEventPage } from "./ViewEventPage";
import { ROUTES } from "../utils/routingHelper";

export const Routing = ({ indexNode }: { indexNode: ReactNode }) => {
  return (
    <Routes>
      <Route index element={indexNode} />
      <Route path={ROUTES.EventPage} element={<ViewEventPage />} />
    </Routes>
  );
};
