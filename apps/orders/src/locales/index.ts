import type { I18NTranslations } from "@commercelayer/app-elements"
import type en from "./en"

/** The app translations, merged over the app-elements ones by `I18NProvider`. */
export const translations: I18NTranslations<typeof en> = {
  en: async () => await import("./en"),
  it: async () => await import("./it"),
}
