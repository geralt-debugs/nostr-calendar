import { IconButton, Typography } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { useNavigate } from "react-router";
import { getRouteFromDate } from "../utils/dateBasedRouting";
import React from "react";

const today = dayjs();

export function DateLabel({ day }: { day: Dayjs }) {
  const isToday = today.isSame(day, "date");
  const navigate = useNavigate();
  console.log(isToday, day.toISOString());
  const onDateClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    navigate(getRouteFromDate(day, "day"));
    e.stopPropagation();
  };
  return (
    <IconButton
      variant={isToday ? "highlighted" : undefined}
      color="primary"
      onClick={onDateClick}
      style={{
        width: "36px",
        height: "36px",
      }}
    >
      <Typography variant="body1" fontWeight={600}>
        {day.date()}
      </Typography>
    </IconButton>
  );
}
