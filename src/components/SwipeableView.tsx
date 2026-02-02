import { useMediaQuery, Box, useTheme } from "@mui/material";
import { MotionNodeDragHandlers, AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDateWithRouting } from "../hooks/useDateWithRouting";
import { Dayjs } from "dayjs";
import { ICalendarEvent } from "../utils/types";
import { useLayout } from "../hooks/useLayout";

const SWIPE_THRESHOLD = 100;

export interface ViewProps {
  events: ICalendarEvent[];
  date: Dayjs;
}

interface SwipeableViewProps {
  events: ICalendarEvent[];
  View: React.FC<ViewProps>;
}

export function SwipeableView({ events, View }: SwipeableViewProps) {
  const { date, setDate } = useDateWithRouting();
  const { layout } = useLayout();
  const previousDay = date.subtract(1, layout);
  // const nextDay = date.add(1, layout);
  const [direction, setDirection] = useState(0);
  const [key, setKey] = useState(0); // forces re-mount to snap back
  const move = (dir: number) => setDate(date.add(dir, layout), layout);
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (ref.current) {
      setWidth(ref.current?.offsetWidth);
    }
  }, []);

  const [x, setX] = useState(0);

  useEffect(() => {
    setX(width);
  }, [width]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!isMobile) {
    return <View events={events} date={date} />;
  }
  const handleDragEnd: MotionNodeDragHandlers["onDragEnd"] = (_, info) => {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      setDirection(1);
      setTimeout(() => {
        move(1);
      }, 600);
      setKey((k) => k + 1);
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      setDirection(-1);
      setTimeout(() => {
        move(-1);
      }, 600);
      setKey((k) => k + 1);
    }
  };

  return (
    <Box overflow="hidden" width="100%" ref={ref}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={key}
          custom={direction}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          initial={{ x: 0 }}
          animate={{ x: 0 }}
          exit={{ x: direction > 0 ? -300 : 300 }}
          transition={{
            type: "spring",
          }}
          style={{
            display: "flex",
            width: "200%",
            x,
          }}
        >
          <Box width="100%">{<View events={events} date={previousDay} />}</Box>
          <Box width="100%">{<View events={events} date={date} />}</Box>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}
