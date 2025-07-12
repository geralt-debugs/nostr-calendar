import { NestedObject } from "./dictionary";

export function flattenMessages(
  nestedMessages: NestedObject,
  prefix = "",
): Record<string, string> {
  return (
    nestedMessages &&
    Object.keys(nestedMessages).reduce<Record<string, string>>(
      (messages: string | NestedObject, key: string) => {
        const value = nestedMessages[key];
        const prefixedKey = prefix ? `${prefix}.${key}` : key.toString();

        if (typeof value === "string") {
          messages[prefixedKey] = value;
        } else {
          Object.assign(messages, flattenMessages(value, prefixedKey));
        }

        return messages;
      },
      {},
    )
  );
}
