import { create } from "zustand";
import { fetchUserInfo } from "../common/nostr";
import { SubCloser } from "nostr-tools/abstract-pool";
import { useState } from "react";

export interface IParticipant {
  publicKey: string;
  picture?: string;
  name?: string;
  createdAt: number;
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
          if (
            !newParticipants?.[event.pubkey]?.createdAt ||
            newParticipants?.[event.pubkey]?.createdAt < event.created_at
          ) {
            newParticipants[event.pubkey] = {
              name: parsedContent.name,
              publicKey: event.pubkey,
              picture: parsedContent.picture,
              createdAt: event.created_at,
            };
          }
        });
        if (participantPubKeys.length === Object.keys(newParticipants).length) {
          closer?.close();
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
  const isParticipantInCache = !!participants[pubKey];
  const [loading, updateLoading] = useState(!isParticipantInCache);
  if (!isParticipantInCache) {
    fetchParticipants([pubKey]).then(() => {
      updateLoading(false);
    });
  }
  return {
    participant: participants[pubKey] ?? { publicKey: pubKey },
    loading,
  };
};
