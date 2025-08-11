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
  return await window.nostr.getPublicKey();
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
    pubkey: nip19.npubEncode(userPublicKey), // Your public key here
    created_at: Math.floor(Date.now() / 1000),
    kind: 32678,
    content: eventContent,
    tags: [
      ["d", uniqueCalId], // Replace with a unique id for the event
    ],
  };

  const signedEvent = await window.nostr.signEvent(unsignedCalendarEvent);
  const evtId = getEventHash(unsignedCalendarEvent);
  signedEvent.id = evtId;

  // Publish the private event to a relay
  await publishToRelays(signedEvent);
  const giftWraps: Event[] = [];
  const ownGift = await nip59.wrapEvent(
    {
      pubkey: nip19.npubEncode(userPublicKey),
      created_at: Math.floor(Date.now() / 1000),
      kind: 52,
      content: "",
      tags: [
        ["a", `32678:${userPublicKey}:${uniqueCalId}`],
        ["viewKey", nip19.nsecEncode(viewSecretKey)],
      ],
    },
    userPublicKey,
  );
  giftWraps.push(ownGift);
  for (const participant of participants) {
    // Create a rumor
    const giftWrap = await nip59.wrapEvent(
      {
        pubkey: nip19.npubEncode(userPublicKey),
        created_at: Math.floor(Date.now() / 1000),
        kind: 52,
        content: "",
        tags: [
          ["a", `32678:${participant}:${uniqueCalId}`],
          ["viewKey", nip19.nsecEncode(viewSecretKey)],
        ],
      },
      participant,
    );
    giftWrap.kind = 1052;
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
  { participants }: { participants: string[] },
  onEvent: (event: { eventId: string; viewKey: string }) => void,
) => {
  const relayList = getRelays();
  const filter = {
    kinds: [1052],
    "#p": participants,
  };

  return pool.subscribeMany(relayList, [filter], {
    onevent: async (event: Event) => {
      const unWrappedEvent = await getDetailsFromGiftWrap(event);
      onEvent(unWrappedEvent);
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
  { eventIds }: { eventIds: string[] },
  onEvent: (event: Event) => void,
) {
  const relayList = getRelays();
  const filter = {
    kinds: [32678],
    "#d": eventIds,
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

export const fetchCalendarEvents = (onEvent: (event: Event) => void) => {
  const relayList = getRelays();
  const filter = {
    kinds: [31923],
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
  const fullEvent = await window.nostr.signEvent(baseEvent);
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
