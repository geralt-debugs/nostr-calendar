import { useTheme, Theme } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { HTMLAttributes } from "react";
import { Locale } from "date-fns";
import CalendarSmall from "../engine_components/CalendarSmall";
import { Filters } from "./Filters";
import { isMobile } from "../common/utils";
import Typography from "@mui/material/Typography";
import LayoutSelector from "./LayoutSelector";
import { styled } from "@mui/material/styles";

const drawerWidth = 260;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const getStyles = (
  theme: Theme,
): Record<string, HTMLAttributes<HTMLDivElement>["style"]> => ({
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  calendarSmall: {
    marginTop: theme.spacing(4),
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(4),
    marginLeft: theme.spacing(1),
    minHeight: 265,
    minWidth: 240,
    backgroundColor: theme.palette.background.paper,
  },
  layoutSection: {
    padding: theme.spacing(2),
  },
  layoutTitle: {
    marginBottom: theme.spacing(1),
    fontSize: "0.875rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
  layoutSelect: {
    width: "100%",
  },
});

interface CalendarDrawerProps {
  selectedDate: Date;
  next: () => void;
  previous: () => void;
  open: boolean;
  handleDrawerClose: () => void;
  layout: "month" | "week" | "day";
  locale: Locale | null;
}

function CalendarDrawer(props: CalendarDrawerProps) {
  const { open, handleDrawerClose } = props;
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <Drawer
      style={{ ...styles.drawer }}
      PaperProps={{ style: styles.drawerPaper }}
      variant={isMobile ? "temporary" : "persistent"}
      anchor="left"
      open={open}
      onClose={handleDrawerClose}
    >
      <DrawerHeader>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === "ltr" ? (
            <ChevronLeftIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </IconButton>
      </DrawerHeader>
      <Divider />

      {/* Layout Selector - Show for mobile or always if you prefer */}
      {isMobile && (
        <>
          <div style={styles.layoutSection}>
            <Typography style={styles.layoutTitle}>Calendar View</Typography>
            <LayoutSelector style={styles.layoutSelect} />
          </div>
          <Divider />
        </>
      )}

      <div style={{ ...styles.calendarSmall }}>
        <CalendarSmall />
      </div>
      <Divider />
      <Filters />
    </Drawer>
  );
}

export default CalendarDrawer;
