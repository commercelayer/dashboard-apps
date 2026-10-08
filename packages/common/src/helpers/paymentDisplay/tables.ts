import type { PaymentSetting } from "@commercelayer/sdk"

/** A payment setting's type, which names the gateway. */
export type PaymentSettingType = PaymentSetting["type"]

const LOGO_BASE_URL =
  "https://data.commercelayer.app/assets/images/icons/credit-cards/color"

/** Logo when neither the card brand nor the payment setting is known. */
export const FALLBACK_LOGO_KEY = "credit-card"

export function getLogoSrc(logoKey: string): string {
  return `${LOGO_BASE_URL}/${logoKey}.svg`
}

export const PAYMENT_SETTING_LOGO_KEYS: Record<PaymentSettingType, string> = {
  payment_setting_adyens: "adyen",
  payment_setting_braintrees: "braintree",
  payment_setting_checkout_coms: "checkout_com",
  payment_setting_externals: "external",
  payment_setting_gift_cards: "giftcard",
  payment_setting_manuals: "manual",
  payment_setting_paypals: "paypal",
  payment_setting_stripes: "stripe",
}

/**
 * Label for each payment setting type. Not `payment_setting.name`, which is
 * the merchant's own label.
 */
export const PAYMENT_SETTING_LABELS: Record<PaymentSettingType, string> = {
  payment_setting_adyens: "Adyen",
  payment_setting_braintrees: "Braintree",
  payment_setting_checkout_coms: "Checkout.com",
  payment_setting_externals: "External",
  payment_setting_gift_cards: "Gift Card",
  payment_setting_manuals: "Manual",
  payment_setting_paypals: "PayPal",
  payment_setting_stripes: "Stripe",
}

/**
 * The API can return the base `payment_settings` type, which matches no
 * entry, so values are checked before use.
 */
export function isPaymentSettingType(
  value: unknown,
): value is PaymentSettingType {
  return (
    typeof value === "string" && Object.hasOwn(PAYMENT_SETTING_LABELS, value)
  )
}

/** Card brands with a logo. The key is also the logo file name. */
export const CARD_BRAND_LABELS = {
  amex: "Amex",
  diners: "Diners Club",
  discover: "Discover",
  jcb: "JCB",
  maestro: "Maestro",
  mastercard: "Mastercard",
  unionpay: "UnionPay",
  visa: "Visa",
} as const satisfies Record<string, string>

export type CardBrand = keyof typeof CARD_BRAND_LABELS

export function isCardBrand(value: string): value is CardBrand {
  return Object.hasOwn(CARD_BRAND_LABELS, value)
}

/** Gateway-specific brand codes, e.g. Adyen's `"mc"`. */
export const CARD_BRAND_ALIASES = new Map<string, CardBrand>([
  ["mc", "mastercard"],
])

export interface Wallet {
  /** Logo file name. */
  logoKey: string
  label: string
}

/** Keyed by wallet code without separators (`apple_pay` → `applepay`). */
export const WALLETS = new Map<string, Wallet>([
  ["applepay", { logoKey: "apple_pay", label: "Apple Pay" }],
  ["googlepay", { logoKey: "google_pay", label: "Google Pay" }],
  // Adyen's older spelling.
  ["paywithgoogle", { logoKey: "google_pay", label: "Google Pay" }],
])
