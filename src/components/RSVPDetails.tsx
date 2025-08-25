import React from "react";
import { Typography, Box } from "@mui/material";
import { useIntl } from "react-intl";
import { Participant } from "./Participant";
import { IRSVPResponse, RSVPResponse } from "../stores/events";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HelpIcon from "@mui/icons-material/Help";
import ScheduleIcon from "@mui/icons-material/Schedule";

interface RSVPDetailsProps {
  participants: string[];
  rsvpResponses: IRSVPResponse[];
}

const getRSVPIcon = (response: RSVPResponse) => {
  switch (response) {
    case "accepted":
      return <CheckCircleIcon style={{ color: "#4caf50", fontSize: "16px" }} />;
    case "declined":
      return <CancelIcon style={{ color: "#f44336", fontSize: "16px" }} />;
    case "maybe":
      return <HelpIcon style={{ color: "#ff9800", fontSize: "16px" }} />;
    case "pending":
      return <ScheduleIcon style={{ color: "#9e9e9e", fontSize: "16px" }} />;
    default:
      return null;
  }
};

const getRSVPColor = (response: RSVPResponse) => {
  switch (response) {
    case "accepted":
      return "#4caf50";
    case "declined":
      return "#f44336";
    case "maybe":
      return "#ff9800";
    case "pending":
      return "#9e9e9e";
    default:
      return "#9e9e9e";
  }
};

export const RSVPDetails: React.FC<RSVPDetailsProps> = ({
  participants,
  rsvpResponses,
}) => {
  const { formatMessage } = useIntl();

  // Group participants by their RSVP status
  const participantsByStatus = participants.reduce((acc, participantId) => {
    const rsvpResponse = rsvpResponses.find(
      (response) => response.participantId === participantId
    );
    const status = rsvpResponse?.response || "pending";
    
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(participantId);
    return acc;
  }, {} as Record<RSVPResponse, string[]>);

  const statusLabels: Record<RSVPResponse, string> = {
    accepted: formatMessage({ id: "rsvp.accepted" }, { defaultMessage: "Accepted" }),
    declined: formatMessage({ id: "rsvp.declined" }, { defaultMessage: "Declined" }),
    maybe: formatMessage({ id: "rsvp.maybe" }, { defaultMessage: "Maybe" }),
    pending: formatMessage({ id: "rsvp.pending" }, { defaultMessage: "Pending" }),
  };

  const statusOrder: RSVPResponse[] = ["accepted", "maybe", "pending", "declined"];

  return (
    <div>
      <Typography variant="subtitle1" style={{ marginBottom: "8px" }}>
        {formatMessage({ id: "navigation.rsvpDetails" }, { defaultMessage: "RSVP Details" })}
      </Typography>
      
      {statusOrder.map((status) => {
        const participantsInStatus = participantsByStatus[status] || [];
        if (participantsInStatus.length === 0) return null;

        return (
          <Box key={status} style={{ marginBottom: "12px" }}>
            <Box style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              {getRSVPIcon(status)}
              <Typography variant="body2" style={{ fontWeight: 500, color: getRSVPColor(status) }}>
                {statusLabels[status]} ({participantsInStatus.length})
              </Typography>
            </Box>
            <Box style={{ marginLeft: "24px" }}>
              {participantsInStatus.map((participantId) => (
                <Box key={participantId} style={{ marginBottom: "4px" }}>
                  <Participant pubKey={participantId} />
                </Box>
              ))}
            </Box>
          </Box>
        );
      })}
    </div>
  );
};
