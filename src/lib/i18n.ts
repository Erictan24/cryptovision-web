import id from "../messages/id.json";
import en from "../messages/en.json";

export type Locale = "id" | "en";
export type Messages = typeof id;

const messages: Record<Locale, Messages> = { id, en };

export function getMessages(locale: Locale): Messages {
  return messages[locale];
}
