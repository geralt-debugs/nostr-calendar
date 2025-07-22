import { Event, Relay, SimplePool, UnsignedEvent } from "nostr-tools";
import { normalizeURL } from "nostr-tools/utils";
import { v4 as uuid } from "uuid";
import { ICalendarEvent } from "../stores/events";
import { TEMP_CALENDAR_ID } from "../stores/eventDetails";
import { AbstractRelay } from "nostr-tools/abstract-relay";

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

export const publishToRelays = (
  event: Event,
  onAcceptedRelays: (url: string) => void = _onAcceptedRelays,
) => {
  return Promise.all(
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

export const fetchCalendarEvents = async (
  onEvent: (event: Event) => void,
): Promise<void> => {
  const relayList = getRelays();
  const filter = {
    kinds: [31923],
  };

  const subCloer = pool.subscribeMany(relayList, [filter], {
    onevent: (event: Event) => {
      onEvent(event);
      subCloer.close();
    },
  });
};

export const publishCalendarEvent = async (
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
  const baseEvent: UnsignedEvent = {
    kind: 31923,
    pubkey: pubKey,
    tags: tags,
    content: event.description,
    created_at: Math.floor(Date.now() / 1000),
  };
  const fullEvent = await window.nostr.signEvent(baseEvent);
  await publishToRelays(fullEvent, onAcceptedRelays);
};
