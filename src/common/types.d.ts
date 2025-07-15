import { Theme } from "@mui/material";

export interface IGetStyles {
  (theme: Theme): Record<string, HTMLAttributes<HTMLDivElement>["style"]>;
}


declare global {
  // TODO: make this better
  interface Window {
    __FORMSTR__FORM_IDENTIFIER__: {
      naddr?: string;
      viewKey?: string;
      formContent?: string;
    };
    nostr: {
      getPublicKey: () => Promise<string>;
      signEvent: <Event>(
        event: Event,
      ) => Promise<Event & { id: string; sig: string }>;
      nip04: {
        encrypt: (pubKey: string, message: string) => Promise<string>;
        decrypt: (pubkey: string, message: string) => Promise<string>;
      };
      nip44: {
        encrypt: (pubKey: string, message: string) => Promise<string>;
        decrypt: (pubkey: string, mssage: string) => Promise<string>;
      };
    };
  }
}