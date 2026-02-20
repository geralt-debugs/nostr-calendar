// import { useDraggable } from "@dnd-kit/core";
import {
  alpha,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Link,
  Paper,
  Stack,
  Theme,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ICalendarEvent } from "../utils/types";
import { PositionedEvent } from "../common/calendarEngine";
import { TimeRenderer } from "./TimeRenderer";
import { useState } from "react";
import { Participant } from "./Participant";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopy from "@mui/icons-material/ContentCopy";
import OpenInNew from "@mui/icons-material/OpenInNew";
import Download from "@mui/icons-material/Download";
import { exportICS, isMobile } from "../common/utils";
import { encodeNAddr } from "../common/nostr";
import { getEventPage } from "../utils/routingHelper";
import { isNative } from "../utils/platform";

interface CalendarEventCardProps {
  event: PositionedEvent;
  offset?: string;
}

interface CalendarEventViewProps {
  event: ICalendarEvent;
}

function getColorScheme(event: ICalendarEvent, theme: Theme) {
  if (event.isPrivateEvent) {
    return {
      color: "#fff",
      backgroundColor: theme.palette.primary.light,
    };
  } else {
    return {
      backgroundColor: alpha(theme.palette.primary.main, 0.3),
      color: "#fff",
    };
  }
}

export function CalendarEventCard({
  event,
  offset = "0px",
}: CalendarEventCardProps) {
  // const { attributes, listeners, setNodeRef } = useDraggable({ id: event.id });
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const maxDescLength = 20;
  const theme = useTheme();
  const colorScheme = getColorScheme(event, theme);
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const title =
    event.title ??
    (event.description.length > maxDescLength
      ? `${event.description.substring(0, maxDescLength)}...`
      : event.description);
  return (
    <>
      <Paper
        // ref={setNodeRef}
        // {...listeners}
        // {...attributes}
        onClick={() => setOpen(true)}
        sx={{
          position: "absolute",
          backgroundColor: colorScheme.backgroundColor,
          top: `calc(${event.top}px + ${offset})`,
          left: `${(event.col / event.colSpan) * 100}%`,
          width: `${100 / event.colSpan}%`,
          height: event.height,
          p: 0.5,
          cursor: "pointer",
          userSelect: "none",
          overflow: "hidden",
          textOverflow: "clip",
        }}
      >
        <Typography
          variant="caption"
          color={colorScheme.color}
          fontWeight={600}
        >
          {title}
        </Typography>
      </Paper>
      <Dialog
        fullWidth
        maxWidth="lg"
        fullScreen={fullScreen}
        slotProps={{
          paper: {
            sx: {
              height: {
                sm: "100vh",
                md: "60vh",
              },
            },
          },
        }}
        open={open}
        onClose={handleClose}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography component={"p"} variant="h5">
            {title}
          </Typography>
          <ActionButtons event={event} closeModal={handleClose} />
        </DialogTitle>
        <DialogContent dividers>
          <CalendarEvent event={event}></CalendarEvent>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ActionButtons({
  event,
  closeModal,
}: {
  event: ICalendarEvent;
  closeModal: () => void;
}) {
  const linkToEvent = getEventPage(
    encodeNAddr({
      pubkey: event.user,
      identifier: event.eventId,
      kind: event.kind,
    }),
    event.viewKey,
  );
  const copyLinkToEvent = () => {
    navigator.clipboard.writeText(`${window.location.origin}${linkToEvent}`);
  };
  return (
    <Box minWidth={isMobile ? "inherit" : "160px"}>
      {!isMobile && (
        <>
          <IconButton onClick={copyLinkToEvent}>
            <Tooltip title="Copy link to this event">
              <ContentCopy />
            </Tooltip>
          </IconButton>

          <IconButton component={Link} href={linkToEvent}>
            <Tooltip title="Open event in new tab">
              <OpenInNew />
            </Tooltip>
          </IconButton>
        </>
      )}

      {!isNative && (
        <IconButton onClick={() => exportICS(event)}>
          <Tooltip title="Download event details">
            <Download />
          </Tooltip>
        </IconButton>
      )}
      <IconButton aria-label="close" onClick={closeModal}>
        <CloseIcon />
      </IconButton>
    </Box>
  );
}

function CalendarEvent({ event }: CalendarEventViewProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const locations = event.location.filter((location) => !!location?.trim?.());
  return (
    <Box
      sx={{
        display: "flex",
        gap: theme.spacing(4),
        height: "100%",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      {event.image && (
        <Box
          sx={{
            flex: 1,
            backgroundImage: `url(${event.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "8px",
          }}
        />
      )}
      <Box
        sx={{
          overflowY: "auto",
          flex: "1",
          padding: 3,
        }}
      >
        <Stack spacing={2}>
          <TimeRenderer
            begin={event.begin}
            end={event.end}
            repeat={event.repeat}
          ></TimeRenderer>

          {event.description && (
            <>
              <Typography variant="subtitle1">Description</Typography>
              <Typography variant="body2">
                <Markdown remarkPlugins={[remarkGfm]}>
                  {event.description}
                </Markdown>
              </Typography>

              <Divider />
            </>
          )}

          {locations.length > 0 && (
            <>
              <Typography variant="subtitle1">Location</Typography>
              <Typography>{locations.join(", ")}</Typography>

              <Divider />
            </>
          )}

          <Box display={"flex"} flexWrap={"wrap"} gap={1}>
            <Typography width={"100%"} fontWeight={600}>
              Participants
            </Typography>
            <Stack direction="row" gap={0.5} flexWrap="wrap">
              {event.participants.map((p) => (
                <Box width={"100%"} key={p}>
                  <Participant pubKey={p} />
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
