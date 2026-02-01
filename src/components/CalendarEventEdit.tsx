import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  SelectChangeEvent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { format } from "date-fns";
import { ICalendarEvent, RepeatingFrequency } from "../utils/types";
import { ParticipantAdd } from "./ParticipantAdd";
import { Participant } from "./Participant";
import {
  publishPrivateCalendarEvent,
  publishPublicCalendarEvent,
} from "../common/nostr";

interface CalendarEventEditProps {
  open: boolean;
  event: ICalendarEvent | null;
  initialDateTime?: number;
  onClose: () => void;
  onSave?: (event: ICalendarEvent) => void;
  mode?: "create" | "edit";
}

export function CalendarEventEdit({
  open,
  event: initialEvent,
  initialDateTime,
  onClose,
  onSave,
  mode = "create",
}: CalendarEventEditProps) {
  const [processing, setProcessing] = useState(false);
  const [isPrivate, setIsPrivate] = useState(
    initialEvent?.isPrivateEvent ?? true,
  );

  const [eventDetails, setEventDetails] = useState<ICalendarEvent>(() => {
    if (initialEvent) {
      return { ...initialEvent };
    }

    const begin = initialDateTime || Date.now();
    const end = begin + 60 * 60 * 1000;

    return {
      begin,
      end,
      id: "",
      eventId: "",
      kind: 0,
      title: "",
      createdAt: Date.now(),
      description: "",
      location: [],
      categories: [],
      reference: [],
      geoHash: [],
      participants: [],
      rsvpResponses: [],
      website: "",
      user: "",
      isPrivateEvent: true,
      repeat: {
        frequency: null,
      },
    } as ICalendarEvent;
  });

  const handleClose = () => {
    onClose();
  };

  const updateField = <K extends keyof ICalendarEvent>(
    key: K,
    value: ICalendarEvent[K],
  ) => {
    setEventDetails((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setProcessing(true);
    try {
      const eventToSave = { ...eventDetails, isPrivateEvent: isPrivate };

      if (isPrivate) {
        await publishPrivateCalendarEvent(eventToSave);
      } else {
        await publishPublicCalendarEvent(eventToSave);
      }

      if (onSave) {
        onSave(eventToSave);
      }

      setProcessing(false);
      onClose();
    } catch (e) {
      console.error(e instanceof Error ? e.message : "Unknown error");
      setProcessing(false);
    }
  };

  const onChangeBeginDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    const currentBeginTime = new Date(eventDetails.begin);
    const newBegin = new Date(
      newDate.getFullYear(),
      newDate.getMonth(),
      newDate.getDate(),
      currentBeginTime.getHours(),
      currentBeginTime.getMinutes(),
    );
    updateField("begin", newBegin.getTime());
  };

  const onChangeEndDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    const currentEndTime = new Date(eventDetails.end);
    const newEnd = new Date(
      newDate.getFullYear(),
      newDate.getMonth(),
      newDate.getDate(),
      currentEndTime.getHours(),
      currentEndTime.getMinutes(),
    );
    updateField("end", newEnd.getTime());
  };

  const onChangeBeginTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const currentBeginDate = new Date(eventDetails.begin);
    const newBegin = new Date(
      currentBeginDate.getFullYear(),
      currentBeginDate.getMonth(),
      currentBeginDate.getDate(),
      hours,
      minutes,
    );
    updateField("begin", newBegin.getTime());
  };

  const onChangeEndTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const currentEndDate = new Date(eventDetails.end);
    const newEnd = new Date(
      currentEndDate.getFullYear(),
      currentEndDate.getMonth(),
      currentEndDate.getDate(),
      hours,
      minutes,
    );
    updateField("end", newEnd.getTime());
  };

  const handleFrequencyChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    updateField("repeat", {
      frequency:
        value !== RepeatingFrequency.None
          ? (value as RepeatingFrequency)
          : null,
    });
  };

  const buttonDisabled = !(
    !processing &&
    eventDetails.title &&
    eventDetails.begin &&
    eventDetails.end &&
    eventDetails.begin < eventDetails.end
  );

  if (!open || !eventDetails) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: 8,
        },
      }}
    >
      <DialogTitle>
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" style={{ fontWeight: 600 }}>
            {mode === "edit" ? "Edit Event" : "Create New Event"}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Title */}
          <Box>
            <Typography
              variant="subtitle2"
              style={{ marginBottom: 8, fontWeight: 500 }}
            >
              Title *
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter event title"
              value={eventDetails.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                updateField("title", e.target.value);
              }}
              required
              size="small"
            />
          </Box>

          {/* Image URL */}
          <Box>
            <Typography
              variant="subtitle2"
              style={{ marginBottom: 8, fontWeight: 500 }}
            >
              Image URL
            </Typography>
            <TextField
              fullWidth
              placeholder="https://example.com/image.jpg"
              value={eventDetails.image || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                updateField("image", e.target.value);
              }}
              size="small"
            />
          </Box>

          {/* Date and Time */}
          <Box>
            <Typography
              variant="subtitle2"
              style={{ marginBottom: 8, fontWeight: 500 }}
            >
              Date and Time *
            </Typography>
            <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Start Date/Time */}
              <Box>
                <Typography
                  variant="caption"
                  style={{ marginBottom: 4, display: "block", color: "#666" }}
                >
                  Start
                </Typography>
                <Box style={{ display: "flex", gap: 8 }}>
                  <TextField
                    type="date"
                    value={format(new Date(eventDetails.begin), "yyyy-MM-dd")}
                    onChange={onChangeBeginDate}
                    size="small"
                    style={{ flex: 1 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    type="time"
                    value={format(new Date(eventDetails.begin), "HH:mm")}
                    onChange={onChangeBeginTime}
                    size="small"
                    style={{ width: 120 }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Box>

              {/* End Date/Time */}
              <Box>
                <Typography
                  variant="caption"
                  style={{ marginBottom: 4, display: "block", color: "#666" }}
                >
                  End
                </Typography>
                <Box style={{ display: "flex", gap: 8 }}>
                  <TextField
                    type="date"
                    value={format(new Date(eventDetails.end), "yyyy-MM-dd")}
                    onChange={onChangeEndDate}
                    size="small"
                    style={{ flex: 1 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    type="time"
                    value={format(new Date(eventDetails.end), "HH:mm")}
                    onChange={onChangeEndTime}
                    size="small"
                    style={{ width: 120 }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Location */}
          <Box>
            <Typography
              variant="subtitle2"
              style={{ marginBottom: 8, fontWeight: 500 }}
            >
              Location
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter location"
              value={eventDetails.location.join(", ")}
              onChange={(e) => {
                updateField(
                  "location",
                  e.target.value.split(",").map((loc) => loc.trim()),
                );
              }}
              size="small"
            />
          </Box>

          {/* Recurrence */}
          <Box>
            <Typography
              variant="subtitle2"
              style={{ marginBottom: 8, fontWeight: 500 }}
            >
              Recurrence
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Select recurrence pattern</InputLabel>
              <Select
                value={eventDetails.repeat.frequency || RepeatingFrequency.None}
                label="Select recurrence pattern"
                onChange={handleFrequencyChange}
              >
                <MenuItem value={RepeatingFrequency.None}>
                  Does not repeat
                </MenuItem>
                <MenuItem value={RepeatingFrequency.Daily}>Daily</MenuItem>
                <MenuItem value={RepeatingFrequency.Weekly}>Weekly</MenuItem>
                <MenuItem value={RepeatingFrequency.Weekday}>
                  Weekdays (Mon-Fri)
                </MenuItem>
                <MenuItem value={RepeatingFrequency.Monthly}>Monthly</MenuItem>
                <MenuItem value={RepeatingFrequency.Quarterly}>
                  Quarterly
                </MenuItem>
                <MenuItem value={RepeatingFrequency.Yearly}>Yearly</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Participants */}
          <Box>
            <Typography
              variant="subtitle2"
              style={{ marginBottom: 8, fontWeight: 500 }}
            >
              Participants
            </Typography>
            <Box style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <ParticipantAdd
                onAdd={(pubKey) => {
                  const newParticipants = Array.from(
                    new Set([...eventDetails.participants, pubKey]),
                  );
                  updateField("participants", newParticipants);
                }}
              />

              {eventDetails.participants.length > 0 && (
                <Box
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {eventDetails.participants.map((participant) => (
                    <Box
                      key={participant}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: 4,
                      }}
                    >
                      <Participant pubKey={participant} />
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {
                          const newParticipants =
                            eventDetails.participants.filter(
                              (pubKey) => pubKey !== participant,
                            );
                          updateField("participants", newParticipants);
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          {/* Description */}
          <Box>
            <Typography
              variant="subtitle2"
              style={{ marginBottom: 8, fontWeight: 500 }}
            >
              Description
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Add event description..."
              value={eventDetails.description}
              onChange={(e) => {
                updateField("description", e.target.value);
              }}
              size="small"
            />
          </Box>

          {/* Privacy Toggle */}
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 12,
              backgroundColor: "#f9f9f9",
              borderRadius: 4,
            }}
          >
            <Typography variant="body2" style={{ fontWeight: 500 }}>
              Private Event
            </Typography>
            <Button
              variant={isPrivate ? "contained" : "outlined"}
              size="small"
              onClick={() => setIsPrivate(!isPrivate)}
              style={{ minWidth: 100 }}
            >
              {isPrivate ? "Private" : "Public"}
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions style={{ padding: 16 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={buttonDisabled}
        >
          {processing ? "Saving..." : "Save Event"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CalendarEventEdit;
