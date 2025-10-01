import { Skeleton, useTheme, Tooltip, IconButton } from "@mui/material";
import { useGetParticipant } from "../stores/participants";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HelpIcon from "@mui/icons-material/Help";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { nip19 } from "nostr-tools";
import { RSVPResponse } from "../stores/events";
import { useState } from "react";

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
    case "tentative":
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

const truncateText = (text: string, maxLength: number = 20) => {
  if (text.length <= maxLength) return text;
  
  // For npub, show first 25 and last 4 characters
  if (text.startsWith("npub")) {
    return `${text.slice(0, 25)}...${text.slice(-4)}`;
  }
  
  // For regular names, truncate with ellipsis
  return `${text.slice(0, maxLength)}...`;
};

export const Participant = ({ pubKey, rsvpResponse = "pending"}: ParticipantProps) => {
  const theme = useTheme();
  const { participant, loading } = useGetParticipant({ pubKey });
  const npub = nip19.npubEncode(pubKey);
  const [copyTooltip, setCopyTooltip] = useState("Click to copy");

  const displayName = participant?.name || npub;
  const isLongText = displayName.length > 20;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(displayName);
      setCopyTooltip("Copied!");
      setTimeout(() => setCopyTooltip("Click to copy"), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!participant || !participant.publicKey) {
    return (
      <div
        style={{
          display: "flex",
          maxWidth: "92%",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <Skeleton variant="circular" width={"24px"} height={"24px"} />
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
          <Skeleton width={100} height={20} />
          {rsvpResponse && getRSVPIcon(rsvpResponse, theme)}
        </div>
      </div>
    );
  }
  
  return (
    <div
      style={{
        display: "flex",
        maxWidth: "92%",
        alignItems: "center",
        gap: "12px",
      }}
    >
      {rsvpResponse && getRSVPIcon(rsvpResponse, theme)}
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
          gap: "4px",
        }}
      >
        <Tooltip 
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{displayName}</span>
            </div>
          }
          arrow
        >
          <span style={{ cursor: isLongText ? "pointer" : "default" }}>
            {truncateText(displayName)}
          </span>
        </Tooltip>
        {isLongText && (
          <Tooltip title={copyTooltip} arrow>
            <IconButton
              size="small"
              onClick={handleCopy}
              style={{ padding: "2px" }}
            >
              <ContentCopyIcon style={{ fontSize: "14px" }} />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
