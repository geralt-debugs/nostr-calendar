import { Skeleton, useTheme } from "@mui/material";
import { useGetParticipant } from "../stores/participants";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HelpIcon from "@mui/icons-material/Help";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { nip19 } from "nostr-tools";
import { RSVPResponse } from "../stores/events";

interface ParticipantProps {
  pubKey: string;
  rsvpResponse?: RSVPResponse;
}

const getRSVPIcon = (response: RSVPResponse, theme: any) => {
  switch (response) {
    case "accepted":
      return (
        <CheckCircleIcon
          style={{ color: theme.palette.success.main, fontSize: "16px" }}
        />
      );
    case "declined":
      return (
        <CancelIcon
          style={{ color: theme.palette.error.main, fontSize: "16px" }}
        />
      );
    case "maybe":
      return (
        <HelpIcon
          style={{ color: theme.palette.warning.main, fontSize: "16px" }}
        />
      );
    case "pending":
      return (
        <ScheduleIcon
          style={{ color: theme.palette.text.secondary, fontSize: "16px" }}
        />
      );
    default:
      return null;
  }
};

export const Participant = ({ pubKey, rsvpResponse }: ParticipantProps) => {
  const theme = useTheme();
  const { participant, loading } = useGetParticipant({ pubKey });
  const npub = nip19.npubEncode(pubKey);

  return (
    <div
      style={{
        display: "flex",
        maxWidth: "92%",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <object
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "100%",
        }}
        data={participant.picture}
      >
        {loading ? (
          <Skeleton variant="circular" width={"24px"} height={"24px"} />
        ) : (
          <AccountCircleIcon />
        )}
      </object>
      <div
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span>{participant.name || npub}</span>
        {rsvpResponse && getRSVPIcon(rsvpResponse, theme)}
      </div>
    </div>
  );
};
