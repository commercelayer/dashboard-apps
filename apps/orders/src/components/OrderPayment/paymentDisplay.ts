import type { PaymentSession } from "@commercelayer/sdk"

const LOGO_BASE_URL =
  "https://data.commercelayer.app/assets/images/icons/credit-cards/color"

/** Logo used when we can recognize neither the card brand nor the gateway. */
const FALLBACK_LOGO_KEY = "credit-card"

/**
 * Maps a payment setting's resource type to its gateway-level logo key.
 * Covers every `PaymentSettingType` the new (2026-05+) payment model has.
 */
const GATEWAY_LOGO_KEYS: Record<string, string | undefined> = {
  payment_setting_adyens: "adyen",
  payment_setting_braintrees: "braintree",
  payment_setting_externals: "external",
  payment_setting_gift_cards: "giftcard",
  payment_setting_manuals: "manual",
  payment_setting_stripes: "stripe",
}

/**
 * Customer-facing display name for each gateway, used when we can't
 * determine a specific card brand. Deliberately not `payment_setting.name`,
 * which is a merchant-configured settings label (e.g. "Adyen Payment
 * Settings"), not something to show as the payment method.
 */
const GATEWAY_LABELS: Record<string, string | undefined> = {
  payment_setting_adyens: "Adyen",
  payment_setting_braintrees: "Braintree",
  payment_setting_externals: "External",
  payment_setting_gift_cards: "Gift Card",
  payment_setting_manuals: "Manual",
  payment_setting_stripes: "Stripe",
}

/**
 * Card-network brands we have a dedicated logo for (verified against
 * https://github.com/commercelayer/static-assets/tree/master/dist/assets/images/icons/credit-cards/color),
 * mapped to their customer-facing display name. The key doubles as the logo
 * filename, so membership here is what makes a brand renderable at all:
 * anything else falls back to the gateway logo/name.
 */
const CARD_BRAND_LABELS: Record<string, string | undefined> = {
  mastercard: "Mastercard",
  visa: "Visa",
  amex: "Amex",
  discover: "Discover",
  jcb: "JCB",
  diners: "Diners Club",
  unionpay: "UnionPay",
  maestro: "Maestro",
}

/**
 * Some gateways use their own shorthand code instead of the plain brand
 * name. For example Adyen's `paymentMethod` returns `"mc"` for Mastercard, not
 * `"mastercard"`. Verified against a real Adyen payload. Extend as more
 * gateway-specific codes turn up.
 */
const CARD_BRAND_ALIASES: Record<string, string | undefined> = {
  mc: "mastercard",
}

/**
 * Each gateway puts the card brand/last4 in a completely different shape in
 * its raw `response_data`, so there's no common path to probe defensively.
 * Verified against real payloads:
 *  - Stripe: `payment_method_details.card.{brand,last4}`
 *  - Adyen: `paymentMethod` (brand, plain string) / `additionalData.cardSummary` (last4)
 *
 * This is a progressive enhancement, not exhaustive coverage: `response_data`
 * is verbatim gateway output and its shape varies per payment method and per
 * outcome (a failed authorization often carries only an error envelope, with
 * no card data anywhere). Gateways (or responses) we can't read just yield
 * `undefined` and fall back to the gateway-level logo and name.
 */
const CARD_DETAILS_BY_GATEWAY: Record<
  string,
  | ((responseData: Record<string, unknown>) => {
      brand: unknown
      last4: unknown
    })
  | undefined
> = {
  payment_setting_stripes: (responseData) => {
    const card = (
      responseData.payment_method_details as Record<string, unknown> | undefined
    )?.card as Record<string, unknown> | undefined
    return { brand: card?.brand, last4: card?.last4 }
  },
  payment_setting_adyens: (responseData) => {
    const additionalData = responseData.additionalData as
      | Record<string, unknown>
      | undefined
    return {
      brand: responseData.paymentMethod,
      last4: additionalData?.cardSummary,
    }
  },
}

export interface PaymentDisplay {
  /** URL of the card-brand logo, or the gateway logo when the brand is unknown. */
  logoSrc: string
  /** Card brand ("Visa") when known, otherwise the gateway name ("Adyen"). */
  label: string
  /** Last 4 digits of the card, when the gateway response exposes them. */
  last4: string | undefined
}

/**
 * Resolves everything needed to render a payment session's identity in one
 * pass: which logo to show, what to call it, and the card's last 4 digits.
 *
 * Falls back progressively (specific card brand, then the gateway, then a
 * generic credit-card icon) so an unrecognized gateway response degrades to
 * a correct-but-vaguer row rather than a broken one.
 */
export function getPaymentDisplay(session: PaymentSession): PaymentDisplay {
  const gatewayType = session.payment_setting?.type
  const details = getCardDetails(session, gatewayType)
  const cardBrand = normalizeCardBrand(details?.brand)

  return {
    logoSrc: `${LOGO_BASE_URL}/${
      cardBrand ?? GATEWAY_LOGO_KEYS[gatewayType ?? ""] ?? FALLBACK_LOGO_KEY
    }.svg`,
    label:
      (cardBrand != null ? CARD_BRAND_LABELS[cardBrand] : undefined) ??
      GATEWAY_LABELS[gatewayType ?? ""] ??
      "Payment",
    last4:
      (typeof details?.last4 === "string" ? details.last4 : undefined) ??
      getGiftCardTail(session),
  }
}

/**
 * Gift card sessions carry no card details, but `gift_card_code` is a typed
 * top-level field on the session, so a gift card row can still identify
 * *which* card was used instead of reading as an anonymous "Gift Card".
 *
 * Truncated to the last 4 like a PAN: gift card codes are bearer value, and
 * the full code is available in the details overlay (and the gift_cards app)
 * when someone actually needs it.
 */
function getGiftCardTail(session: PaymentSession): string | undefined {
  const code = session.gift_card_code
  return code != null && code !== "" ? code.slice(-4) : undefined
}

/**
 * Reads the raw brand/last4 out of the authorization's gateway response.
 *
 * Keyed off `payment_authorization` rather than scanning
 * `payment_transactions`, because a session's transaction list can mix failed
 * attempts with the successful one, and the authorization points at the
 * transaction that actually reached the card network.
 */
function getCardDetails(
  session: PaymentSession,
  gatewayType: string | undefined,
): { brand: unknown; last4: unknown } | undefined {
  const responseData = session.payment_authorization?.response_data
  const extractor =
    gatewayType != null ? CARD_DETAILS_BY_GATEWAY[gatewayType] : undefined
  return responseData != null && extractor != null
    ? extractor(responseData)
    : undefined
}

/**
 * Reduces a raw gateway brand string to one of our known brand keys, or
 * `undefined` when we don't recognize it. The membership check is what
 * guarantees the key always maps to a logo that actually exists.
 */
function normalizeCardBrand(brand: unknown): string | undefined {
  if (typeof brand !== "string") {
    return undefined
  }
  const raw = brand.toLowerCase()
  const normalized = CARD_BRAND_ALIASES[raw] ?? raw
  return CARD_BRAND_LABELS[normalized] != null ? normalized : undefined
}
