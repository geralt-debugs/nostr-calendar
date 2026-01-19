import { useLocation } from "react-router";

export type Layout = "week" | "month" | "day";

export const useLayout = (): { layout: Layout } => {
  const location = useLocation();
  let currentLayout = "week";
  if (location.pathname.startsWith("/m")) {
    currentLayout = "month";
  } else if (location.pathname.startsWith("/d")) {
    currentLayout = "day";
  }
  return { layout: currentLayout };
};
