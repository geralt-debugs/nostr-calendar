import { useGetParticipant } from "../stores/participants";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export const Participant = ({ pubKey }: { pubKey: string }) => {
  const { participant } = useGetParticipant({ pubKey });
  return (
    <div
      style={{
        display: "flex",
        maxWidth: "92%",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <object
        style={{
          width: "24px",
          height: "24px",
        }}
        data={participant.picture}
      >
        <AccountCircleIcon />
      </object>
      <div
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%%",
        }}
      >
        {participant.name || participant.publicKey}
      </div>
    </div>
  );
};
