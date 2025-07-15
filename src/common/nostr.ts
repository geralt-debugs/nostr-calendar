import { Event, SimplePool } from "nostr-tools";

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

export const pool = new SimplePool();

export const getRelays = () => {
  return defaultRelays;
};

export function checkWindowNostr() {
  if (!window?.nostr) {
    throw Error("No method provided to access nostr");
  }
}

export async function getUserPublicKey() {
  return await window.nostr.getPublicKey();
}

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
