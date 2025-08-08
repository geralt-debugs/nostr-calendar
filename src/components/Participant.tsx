import { Skeleton } from "@mui/material";
import { useGetParticipant } from "../stores/participants";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { nip19 } from "nostr-tools";

export const Participant = ({ pubKey }: { pubKey: string }) => {
  const { participant, loading } = useGetParticipant({ pubKey });
  const nip19PubKey = nip19.npubEncode(participant.publicKey);
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
          maxWidth: "100%%",
        }}
      >
        {participant.name || nip19PubKey}
      </div>
    </div>
  );
};
