import { create } from "zustand";
import { fetchUserInfo } from "../common/nostr";
import { SubCloser } from "nostr-tools/abstract-pool";

export interface IParticipant {
  publicKey: string;
  picture?: string;
  name?: string;
  createdAt?: number;
  fetching: boolean;
}

export const useParticipants = create<{
  participants: Record<string, IParticipant>;
  fetchParticipant: (participant: IParticipant["publicKey"]) => void;
}>((set) => ({
  participants: {},
  fetchParticipant: async (participantPubKey) => {
    let newParticipant: IParticipant = {
      publicKey: participantPubKey,
      fetching: true,
    };
    set(({ participants }) => {
      return {
        participants: {
          ...participants,
          [participantPubKey]: newParticipant,
        },
      };
    });
    let closer: SubCloser | null = null;
    return new Promise<void>((resolve) => {
      closer = fetchUserInfo([participantPubKey], (event) => {
        const parsedContent = JSON.parse(event.content) as {
          name: string;
          picture: string;
        };

        newParticipant = {
          name: parsedContent.name,
          publicKey: event.pubkey,
          picture: parsedContent.picture,
          createdAt: event.created_at,
          fetching: false,
        };
        set(({ participants }) => {
          return {
            participants: {
              ...participants,
              [participantPubKey]: newParticipant,
            },
          };
        });
      });

      closer?.close();
      resolve();
    });
  },
}));

export const useGetParticipant = ({ pubKey }: { pubKey: string }) => {
  const { participants, fetchParticipant } = useParticipants((state) => state);
  const isParticipantInCache = !!participants[pubKey];
  if (!isParticipantInCache) {
    fetchParticipant(pubKey);
  }
  return {
    participant: participants[pubKey] ?? { publicKey: pubKey },
    loading: participants[pubKey]?.fetching ?? true,
  };
};
