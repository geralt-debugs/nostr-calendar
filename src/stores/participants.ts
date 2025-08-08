import { create } from "zustand";
import { fetchUserInfo } from "../common/nostr";
import { SubCloser } from "nostr-tools/abstract-pool";

export interface IParticipant {
  publicKey: string;
  picture?: string;
  name?: string;
}

export const useParticipants = create<{
  participants: Record<string, IParticipant>;
  fetchParticipants: (
    participants: IParticipant["publicKey"][],
  ) => Promise<Record<string, IParticipant>>;
}>((set) => ({
  participants: {},
  fetchParticipants: async (participantPubKeys) => {
    const newParticipants: Record<string, IParticipant> = {};
    let closer: SubCloser | null = null;
    await Promise.race([
      new Promise<void>((resolve) => {
        closer = fetchUserInfo(participantPubKeys, (event) => {
          const parsedContent = JSON.parse(event.content) as {
            name: string;
            picture: string;
          };
          newParticipants[event.pubkey] = {
            name: parsedContent.name,
            publicKey: event.pubkey,
            picture: parsedContent.picture,
          };
        });
        if (participantPubKeys.length === Object.keys(newParticipants).length) {
          resolve();
        }
      }),
      new Promise<void>((resolve) => {
        setTimeout(() => {
          closer?.close();
          resolve();
        }, 5000);
      }),
    ]);
    set(({ participants }) => {
      return {
        participants: {
          ...participants,
          ...newParticipants,
        },
      };
    });
    return newParticipants;
  },
}));

export const useGetParticipant = ({ pubKey }: { pubKey: string }) => {
  const { participants, fetchParticipants } = useParticipants((state) => state);
  if (!participants[pubKey]) {
    fetchParticipants([pubKey]);
  }
  return {
    participant: participants[pubKey] ?? { publicKey: pubKey },
  };
};
