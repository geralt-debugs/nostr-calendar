import { IconButton, TextField } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useState } from "react";
import { useIntl } from "react-intl";
import { nip19 } from "nostr-tools";
import { NPub } from "nostr-tools/nip19";

export const ParticipantAdd = ({
  onAdd,
}: {
  onAdd: (pubKey: string) => void;
}) => {
  const [pubKey, updatePubkey] = useState("");
  const [error, updateError] = useState(false);
  const canSubmit = !!pubKey;
  const intl = useIntl();
  const onSubmit = () => {
    if (!canSubmit) {
      return;
    }
    let encodedPubKey = pubKey;
    if (pubKey.startsWith("npub")) {
      encodedPubKey = nip19.decode(pubKey as NPub).data;
    } else if (encodedPubKey.length !== 64) {
      updateError(true);
      return;
    }
    onAdd(encodedPubKey);
    updatePubkey("");
  };
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <TextField
        error={error}
        style={{
          width: "100%",
        }}
        placeholder={intl.formatMessage({ id: "navigation.addParticipants" })}
        value={pubKey}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSubmit();
          }
        }}
        onChange={(e) => {
          updateError(false);
          updatePubkey(e.target.value);
        }}
      />
      <IconButton
        style={{
          height: "100%",
        }}
        disabled={!canSubmit}
        onClick={onSubmit}
      >
        <PersonAddIcon />
      </IconButton>
    </div>
  );
};
