import React from "react";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import {
  Box,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button,
  useTheme,
} from "@mui/material";
import { useLayout } from "../hooks/useLayout";
import dayjs, { Dayjs } from "dayjs";
import { getRouteFromDate } from "../utils/dateBasedRouting";
import { useNavigate } from "react-router";

interface CalendarHeaderProps {
  date: Dayjs;
  setDate: (d: Dayjs) => void;
}

export function CalendarHeader({ date, setDate }: CalendarHeaderProps) {
  const { layout, updateLayout } = useLayout();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const navigate = useNavigate();
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const move = (dir: number) => setDate(date.add(dir, layout));
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={2}
    >
      <Box display="flex" alignItems="center">
        <IconButton onClick={() => move(-1)}>
          <ChevronLeft />
        </IconButton>
        <IconButton onClick={() => move(1)}>
          <ChevronRight />
        </IconButton>
        <Typography ml={2} fontWeight={600}>
          {layout === "month" && date.format("MMMM YYYY")}
          {layout === "week" &&
            `${date.startOf("week").format("MMM D")} – ${date.endOf("week").format("MMM D")}`}
          {layout === "day" && date.format("MMMM D, YYYY")}
        </Typography>
      </Box>
      <Box display="flex" gap={theme.spacing(2)} alignItems="center">
        <IconButton
          onClick={() => {
            const route = getRouteFromDate(dayjs(), layout);
            if (route !== location.pathname) {
              navigate(route);
            }
          }}
        >
          <TodayIcon />
        </IconButton>
        <Button
          onClick={handleClick}
          variant="outlined"
          startIcon={<KeyboardArrowDown />}
        >
          {layout}
        </Button>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem
            selected={layout === "day"}
            disabled={layout === "day"}
            onClick={() => {
              updateLayout("day");
              handleClose();
            }}
          >
            Day
          </MenuItem>
          <MenuItem
            selected={layout === "week"}
            disabled={layout === "week"}
            onClick={() => {
              updateLayout("week");
              handleClose();
            }}
          >
            Week
          </MenuItem>
          <MenuItem
            selected={layout === "month"}
            disabled={layout === "month"}
            onClick={() => {
              updateLayout("month");
              handleClose();
            }}
          >
            Month
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
