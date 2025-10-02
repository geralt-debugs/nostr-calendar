import {
  Event,
  generateSecretKey,
  Relay,
  SimplePool,
  UnsignedEvent,
  nip44,
  getPublicKey,
  nip19,
  getEventHash,
  Filter,
} from "nostr-tools";
import { normalizeURL } from "nostr-tools/utils";
import { v4 as uuid } from "uuid";
import { ICalendarEvent } from "../stores/events";
import { TEMP_CALENDAR_ID } from "../stores/eventDetails";
import { AbstractRelay } from "nostr-tools/abstract-relay";
import * as nip59 from "./nip59";
import { NSec } from "nostr-tools/nip19";
import { signerManager } from "./signer";

const defaultRelays = [
  "wss://relay.damus.io/",
  "wss://relay.primal.net/",
  "wss://nos.lol",
  "wss://relay.nostr.wirednet.jp/",
  "wss://nostr-01.yakihonne.com",
  "wss://relay.snort.social",
  "wss://relay.nostr.band",
  "wss://nostr21.com",
];

const _onAcceptedRelays = console.log.bind(
  console,
  "Successfully published to relay: ",
);

export const pool = new SimplePool();

export const getRelays = () => {
  return defaultRelays;
};

export async function getUserPublicKey() {
  const signer = await signerManager.getSigner();
  const pubKey = await signer.getPublicKey();
  return pubKey;
}

export const ensureRelay = async (
  url: string,
  params?: { connectionTimeout?: number },
): Promise<AbstractRelay> => {
  const relay = new Relay(url);
  if (params?.connectionTimeout)
    relay.connectionTimeout = params.connectionTimeout;
  await relay.connect();
  return relay;
};

export async function publishPrivateRSVPEvent({
  authorpubKey, // Public key of the event author
  eventId, // The dtag of the event
  status, // Status of the RSVP event
  participants, // List of participant public keys
}: {
  eventId: string;
  authorpubKey: string;
  status: string;
  participants: string[];
}) {
  const uniqueRSVPId = uuid();
  const userPublicKey = await getUserPublicKey();

  const viewSecretKey = generateSecretKey();
  const viewPublicKey = getPublicKey(viewSecretKey);
  // Encrypt the RSVP data
  const eventData = [
    ["a", `32678:${authorpubKey}:${eventId}`],
    ["d", uniqueRSVPId],
    ["L", "status"],
    ["l", `${status}`, "status"],
    ["L", "freebusy"],
    ["l", "free", "freebusy"],
  ];
  const eventContent = nip44.encrypt(
    JSON.stringify(eventData),
    nip44.getConversationKey(viewSecretKey, viewPublicKey),
  );
  const unsignedRSVPEvent: UnsignedEvent = {
    pubkey: userPublicKey, // Your public key here
    created_at: Math.floor(Date.now() / 1000),
    kind: 32069,
    content: eventContent,
    tags: [
      ["d", uniqueRSVPId], // Unique identifier for the RSVP event
    ],
  };
  const signer = await signerManager.getSigner();
  const signedRSVPEvent = await signer.signEvent(unsignedRSVPEvent);
  signedRSVPEvent.id = getEventHash(unsignedRSVPEvent);
  await publishToRelays(signedRSVPEvent);
  const giftWraps: Event[] = [];
  const ownGift = await nip59.wrapEvent(
    {
      pubkey: nip19.npubEncode(userPublicKey),
      created_at: Math.floor(Date.now() / 1000),
      kind: 55,
      content: "",
      tags: [
        ["a", `32069:${userPublicKey}:${uniqueRSVPId}`],
        ["viewKey", nip19.nsecEncode(viewSecretKey)],
      ],
    },
    userPublicKey,
    1055,
  );
  giftWraps.push(ownGift);
  for (const participant of participants) {
    // Create a rumor
    const giftWrap = await nip59.wrapEvent(
      {
        pubkey: nip19.npubEncode(userPublicKey),
        created_at: Math.floor(Date.now() / 1000),
        kind: 55,
        content: "",
        tags: [
          ["a", `32069:${participant}:${uniqueRSVPId}`],
          ["viewKey", nip19.nsecEncode(viewSecretKey)],
        ],
      },
      participant,
      1055,
    );
    giftWraps.push(giftWrap);
  }
  await Promise.all(
    giftWraps.map((gift) => {
      return publishToRelays(gift);
    }),
  );
  return {
    rsvpEvent: signedRSVPEvent,
    giftWraps,
  };
}

export async function publishPublicRSVPEvent({
  authorpubKey,
  eventId,
  status,
}: {
  authorpubKey: string;
  eventId: string;
  status: string;
}) {
  const uniqueRSVPId = uuid();
  const userPublicKey = await getUserPublicKey();

  const unsignedRSVPEvent: UnsignedEvent = {
    pubkey: userPublicKey, // Your public key here
    created_at: Math.floor(Date.now() / 1000),
    kind: 31925,
    content: "",
    tags: [
      ["d", uniqueRSVPId],
      ["a", `31923:${authorpubKey}:${eventId}`],
      ["d", uniqueRSVPId],
      ["L", "status"],
      ["l", `${status}`, "status"],
      ["L", "freebusy"],
      ["l", "free", "freebusy"],
    ],
  };
  const signer = await signerManager.getSigner();
  const signedRSVPEvent = await signer.signEvent(unsignedRSVPEvent);
  signedRSVPEvent.id = getEventHash(unsignedRSVPEvent);
  await publishToRelays(signedRSVPEvent);

  return {
    rsvpEvent: signedRSVPEvent,
  };
}

export const fetchPublicRSVPEvents = (
  { eventReference }: { eventReference?: string },
  onEvent: (event: Event) => void
) => {
  const relayList = getRelays();
  const filter: Filter = {
    kinds: [31925],
    ...(eventReference && { "#a": [eventReference] }),
  };

  return pool.subscribeMany(relayList, [filter], {
    onevent: (event: Event) => {
      onEvent(event);
    },
  });
};

export async function publishPrivateCalendarEvent({
  title,
  description,
  begin: start,
  end,
  participants,
}: ICalendarEvent) {
  const viewSecretKey = generateSecretKey();
  const uniqueCalId = uuid();
  const eventData = [
    ["title", title],
    ["description", description],
    ["start", start / 1000],
    ["end", end / 1000],
    ["d", uniqueCalId],
  ];

  participants.forEach((participant) => {
    eventData.push(["p", participant]);
  });
  const viewPublicKey = getPublicKey(viewSecretKey);
  const userPublicKey = await getUserPublicKey();
  const eventContent = nip44.encrypt(
    JSON.stringify(eventData),
    nip44.getConversationKey(viewSecretKey, viewPublicKey),
  );

  const unsignedCalendarEvent: UnsignedEvent = {
    pubkey: userPublicKey, // Your public key here
    created_at: Math.floor(Date.now() / 1000),
    kind: 32678,
    content: eventContent,
    tags: [
      ["d", uniqueCalId], // Replace with a unique id for the event
    ],
  };
  const signer = await signerManager.getSigner();
  const signedEvent = await signer.signEvent(unsignedCalendarEvent);
  const evtId = getEventHash(unsignedCalendarEvent);
  signedEvent.id = evtId;

  // Publish the private event to a relay
  await publishToRelays(signedEvent);
  const giftWraps: Event[] = [];
  const targetPubKeys = Array.from(new Set([userPublicKey, ...participants]));
  console.log(targetPubKeys);
  for (const participant of targetPubKeys) {
    // Create a rumor
    const giftWrap = await nip59.wrapEvent(
      {
        pubkey: userPublicKey,
        created_at: Math.floor(Date.now() / 1000),
        kind: 52,
        content: "",
        tags: [
          ["a", `32678:${participant}:${uniqueCalId}`],
          ["viewKey", nip19.nsecEncode(viewSecretKey)],
        ],
      },
      participant,
      1052,
    );
    giftWraps.push(giftWrap);
  }
  await Promise.all(
    giftWraps.map((gift) => {
      return publishToRelays(gift);
    }),
  );
  return {
    calendarEvent: signedEvent,
    giftWraps,
  };
}

export async function getDetailsFromGiftWrap(giftWrap: Event) {
  const rumor = await nip59.unwrapEvent(giftWrap);
  const aTag = rumor.tags.find((tag) => tag[0] === "a");
  if (!aTag) {
    console.log(rumor);
    throw new Error("invalid rumor. a tag not found");
  }
  const eventId = aTag[1].split(":")[2]; // Extract event id from the tag
  const viewKey = rumor.tags.find((tag) => tag[0] === "viewKey")?.[1];
  if (!viewKey) {
    throw new Error("invalid rumor: viewKey not found");
  }
  return {
    eventId,
    viewKey,
  };
}

export const fetchCalendarGiftWraps = (
  { participants, since, until }: { participants: string[]; since?: number; until?: number },
  onEvent: (event: { eventId: string; viewKey: string }) => void,
) => {
  const relayList = getRelays();
  const filter: Filter = {
    kinds: [1052],
    "#p": participants,
    ...(since && { since }),
    ...(until && { until }),
  };

  return pool.subscribeMany(relayList, [filter], {
    onevent: async (event: Event) => {
      const unWrappedEvent = await getDetailsFromGiftWrap(event);
      onEvent(unWrappedEvent);
    },
  });
};

export async function getDetailsFromRSVPGiftWrap(giftWrap: Event) {
  const rumor = await nip59.unwrapEvent(giftWrap);
  const aTag = rumor.tags.find((tag) => tag[0] === "a");
  if (!aTag || !aTag[1]) {
    console.log(rumor);
    throw new Error("invalid rumor. a tag not found or malformed");
  }

  const parts = aTag[1].split(":");
  if (parts.length < 3) {
    throw new Error("invalid a tag format");
  }

  const eventId = parts[2];
  const viewKey = rumor.tags.find((tag) => tag[0] === "viewKey")?.[1];

  // Fetch the RSVP event using the a tag reference
  const relayList = getRelays();
  const filter: Filter = {
    kinds: [32069], // RSVP event kind
    "#d": [eventId], // Match the dtag
  };

  return new Promise((resolve, reject) => {
    const closer = pool.subscribeMany(relayList, [filter], {
      onevent: async (rsvpEvent: Event) => {
        try {
          const viewPrivateKey = nip19.decode(viewKey as NSec).data;
          const decryptedContent = nip44.decrypt(
            rsvpEvent.content,
            nip44.getConversationKey(
              viewPrivateKey,
              getPublicKey(viewPrivateKey),
            ),
          );
          const eventData = JSON.parse(decryptedContent);

          closer.close();
          resolve({
            rsvpEvent: {
              ...rsvpEvent,
              decryptedData: eventData,
            },
            eventId,
            viewKey,
            aTag: aTag[1],
            isPrivate: true,
          });
        } catch (error: unknown) {
          closer.close();
          reject(
            new Error(
              `Failed to process RSVP event: ${(error as Error).message}`,
            ),
          );
        }
      },
      oneose: () => {
        closer.close();
        // If no RSVP event is found, return tentative status
        resolve({
          rsvpEvent: null,
          eventId,
          viewKey,
          aTag: aTag[1],
          isPrivate: viewKey ? true : false,
          status: "tentative", // Default status when no RSVP is present
        });
      },
    });

    setTimeout(() => {
      closer.close();
      reject(new Error("Timeout: RSVP event fetch timed out"));
    }, 10000);
  });
}

export const fetchAndDecryptPrivateRSVPEvents = (
  { participants }: { participants: string[] },
  onEvent: (decryptedRSVP: unknown) => void,
) => {
  const relayList = getRelays();
  const filter: Filter = {
    kinds: [1055],
    "#p": participants,
  };

  return pool.subscribeMany(relayList, [filter], {
    onevent: async (giftWrap: Event) => {
      try {
        const decryptedRSVP = await getDetailsFromRSVPGiftWrap(giftWrap);
        onEvent(decryptedRSVP);
      } catch (error) {
        console.error("Failed to process RSVP gift wrap:", error);
      }
    },
  });
};

export async function viewPrivateEvent(calendarEvent: Event, viewKey: string) {
  const viewPrivateKey = nip19.decode(viewKey as NSec).data;
  const decryptedContent = nip44.decrypt(
    calendarEvent.content,
    nip44.getConversationKey(viewPrivateKey, getPublicKey(viewPrivateKey)),
  );

  return {
    ...calendarEvent,
    tags: JSON.parse(decryptedContent),
  }; // Return the decrypted event details
}

export async function fetchPrivateCalendarEvents(
  { eventIds, since, until }: { eventIds: string[]; since?: number; until?: number },
  onEvent: (event: Event) => void,
) {
  const relayList = getRelays();
  const filter: Filter = {
    kinds: [32678],
    "#d": eventIds,
    ...(since && { since }),
    ...(until && { until }),
  };

  const closer = pool.subscribeMany(relayList, [filter], {
    onevent: async (event: Event) => {
      onEvent(event);
      closer.close();
    },
  });
}

export const publishToRelays = (
  event: Event,
  onAcceptedRelays: (url: string) => void = _onAcceptedRelays,
) => {
  return Promise.any(
    getRelays()
      .map(normalizeURL)
      .map(async (url) => {
        let relay: AbstractRelay | null = null;
        try {
          relay = await ensureRelay(url, { connectionTimeout: 5000 });
          return await Promise.race<string>([
            relay.publish(event).then((reason) => {
              // console.log("accepted relays", url);
              onAcceptedRelays(url);
              return reason;
            }),
            new Promise<string>((_, reject) =>
              setTimeout(() => reject("timeout"), 5000),
            ),
          ]);
        } finally {
          if (relay) {
            try {
              await relay.close();
            } catch {
              // Ignore closing errors
            }
          }
        }
      }),
  );
};

export const fetchCalendarEvents = (
  { since , until }: { since?: number; until?: number },
  onEvent: (event: Event) => void
) => {
  const relayList = getRelays();
  const filter: Filter = {
    kinds: [31923],
    ...(since && { since }),
    ...(until && { until }),
  };

  return pool.subscribeMany(relayList, [filter], {
    onevent: (event: Event) => {
      onEvent(event);
    },
  });
};

export const publishPublicCalendarEvent = async (
  event: ICalendarEvent,
  onAcceptedRelays?: (url: string) => void,
) => {
  const pubKey = await getUserPublicKey();
  const id = event.id !== TEMP_CALENDAR_ID ? event.id : uuid();
  const tags = [
    ["name", event.title],
    ["d", id],
    ["start", String(Math.floor(event.begin / 1000))],
    ["end", String(Math.floor(event.end / 1000))],
  ];
  if (event.image) {
    tags.push(["image", event.image]);
  }

  if (event.participants.length > 0) {
    event.participants.forEach((participant) => {
      tags.push(["p", participant]);
    });
  }
  const baseEvent: UnsignedEvent = {
    kind: 31923,
    pubkey: pubKey,
    tags: tags,
    content: event.description,
    created_at: Math.floor(Date.now() / 1000),
  };
  const signer = await signerManager.getSigner();
  const fullEvent = await signer.signEvent(baseEvent);
  fullEvent.id = getEventHash(baseEvent);
  return publishToRelays(fullEvent, onAcceptedRelays);
};

export const fetchUserInfo = (
  userPublicKeys: string[],
  onEvent: (event: Event) => void,
) => {
  const relayList = getRelays();
  const filter: Filter = {
    kinds: [0],
    authors: userPublicKeys,
  };

  return pool.subscribeMany(relayList, [filter], {
    onevent: (event: Event) => {
      onEvent(event);
    },
  });
};
