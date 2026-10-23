import type {
  MergeTranslations,
  Translation,
} from "@commercelayer/app-elements"
import type en from "./src/locales/en"

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation"
    resources: {
      translation: MergeTranslations<Translation, typeof en>
    }
  }
}
