import type {
  PaymentSession,
  PaymentSetting,
  PaymentWallet,
} from "@commercelayer/sdk"

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
 * Some gateways use their own shorthand code instead of the plain brand name.
 * For example Adyen's `paymentMethod` returns `"mc"` for Mastercard. The asset
 * set happens to carry both spellings, but we map to the readable one so the
 * URLs stay legible. Extend as more gateway-specific codes turn up.
 */
const CARD_BRAND_ALIASES: Record<string, string | undefined> = {
  mc: "mastercard",
}

/**
 * Wallets, keyed by the gateway's code with separators stripped, since the two
 * gateways spell the same wallet differently: Adyen composes it into the brand
 * (`"mc_applepay"`), Stripe reports it on its own
 * (`payment_method_details.card.wallet.type === "apple_pay"`).
 *
 * The logo key is the underscored asset name rather than the compact one, both
 * of which exist in the asset set, because it reads better in a URL.
 */
const WALLETS: Record<string, { logoKey: string; label: string } | undefined> =
  {
    applepay: { logoKey: "apple_pay", label: "Apple Pay" },
    googlepay: { logoKey: "google_pay", label: "Google Pay" },
    // Adyen's older spelling for the same thing.
    paywithgoogle: { logoKey: "google_pay", label: "Google Pay" },
  }

/**
 * Each gateway puts the card brand/last4 in a completely different shape in
 * its raw `response_data`, so there's no common path to probe defensively.
 * Verified against real payloads:
 *  - Stripe: `payment_method_details.card.{brand,last4}`, wallet at `card.wallet.type`
 *  - Adyen: `paymentMethod` (brand, and the wallet composed in) / `additionalData.cardSummary` (last4)
 *
 * This is a progressive enhancement, not exhaustive coverage: `response_data`
 * is verbatim gateway output and its shape varies per payment method and per
 * outcome (a failed authorization often carries only an error envelope, with
 * no card data anywhere). Gateways (or responses) we can't read just yield
 * `undefined` and fall back to the gateway-level logo and name.
 */
interface CardDetails {
  brand: unknown
  last4: unknown
  wallet?: unknown
}

const CARD_DETAILS_BY_GATEWAY: Record<
  string,
  ((responseData: Record<string, unknown>) => CardDetails) | undefined
> = {
  payment_setting_stripes: (responseData) => {
    const card = (
      responseData.payment_method_details as Record<string, unknown> | undefined
    )?.card as Record<string, unknown> | undefined
    return {
      brand: card?.brand,
      last4: card?.last4,
      wallet: (card?.wallet as Record<string, unknown> | undefined)?.type,
    }
  },
  payment_setting_adyens: (responseData) => {
    const additionalData = responseData.additionalData as
      | Record<string, unknown>
      | undefined
    return {
      // May be composite: `"mc_applepay"` is Mastercard through Apple Pay.
      brand: responseData.paymentMethod,
      last4: additionalData?.cardSummary,
    }
  },
}

/**
 * Stored payment methods, matched by shape rather than by gateway.
 *
 * The gateway cannot be asked: core serializes the setting behind a
 * `payment_wallet` as the base `payment_settings` type, where behind a
 * `payment_session` it serializes the STI subclass (verified against the API,
 * 2026-09). And the same gateway can store more than one shape, since a wallet
 * built from a stored payment method differs from one built from a webhook
 * notification. So each entry declares what it recognizes, the first match
 * wins, and it names the gateway too.
 *
 * Shapes seen in real `payment_data`:
 *  - Stripe: a PaymentMethod object (`object: "payment_method"`), whose card
 *    details sit under the key its `type` names.
 *  - Adyen stored payment method: flat `{brand: "mc", lastFour: "1113"}`.
 *  - Adyen `RECURRING_CONTRACT` notification: `{paymentMethod: "mc",
 *    additionalData: {cardSummary: "0005"}}`, the shape a session also uses.
 *  - Braintree: the vaulted card as core reshapes it, `{brand_code, last4}`.
 */
const WALLET_SHAPES: Array<{
  gatewayType: string
  match: (paymentData: Record<string, unknown>) => boolean
  extract: (paymentData: Record<string, unknown>) => CardDetails
}> = [
  {
    gatewayType: "payment_setting_stripes",
    match: (paymentData) =>
      paymentData.object === "payment_method" ||
      getStripeDetails(paymentData) != null,
    extract: (paymentData) => {
      const details = getStripeDetails(paymentData)
      return {
        brand: details?.brand,
        last4: details?.last4,
        wallet: (details?.wallet as Record<string, unknown> | undefined)?.type,
      }
    },
  },
  {
    gatewayType: "payment_setting_adyens",
    match: (paymentData) => paymentData.lastFour != null,
    extract: (paymentData) => ({
      // May be composite: `"mc_applepay"` is Mastercard through Apple Pay.
      brand: paymentData.brand ?? paymentData.name,
      last4: paymentData.lastFour,
    }),
  },
  {
    gatewayType: "payment_setting_adyens",
    match: (paymentData) =>
      paymentData.additionalData != null || paymentData.pspReference != null,
    extract: (paymentData) => {
      const additionalData = paymentData.additionalData as
        | Record<string, unknown>
        | undefined
      return {
        brand: paymentData.paymentMethod,
        last4: additionalData?.cardSummary,
      }
    },
  },
  {
    gatewayType: "payment_setting_braintrees",
    match: (paymentData) =>
      paymentData.brand_code != null || paymentData.details_type != null,
    extract: (paymentData) => ({
      brand: paymentData.brand_code,
      last4: paymentData.last4,
    }),
  },
]

/**
 * A Stripe PaymentMethod keeps its details under the key its `type` names
 * ("card", "paypal", …), which is how core reads it too
 * (`Payment::Instrument::Stripe`).
 */
function getStripeDetails(
  paymentData: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const type = paymentData.type
  const details = (typeof type === "string" ? paymentData[type] : undefined) as
    | Record<string, unknown>
    | undefined
  return details?.last4 != null || details?.brand != null ? details : undefined
}

/**
 * Which gateway a wallet belongs to.
 *
 * `payment_setting.type` is the obvious source, and is what a session uses,
 * but a wallet cannot rely on it: core serializes the setting behind a
 * `payment_wallet` as the base `payment_settings` type, where behind a
 * `payment_session` it serializes the STI subclass (verified against the API,
 * 2026-09). The payload's own shape is the fallback, each gateway's being
 * unmistakable.
 */
function getWalletGatewayType(wallet: PaymentWallet): string | undefined {
  const settingType = wallet.payment_setting?.type
  if (settingType != null && settingType in GATEWAY_LABELS) {
    return settingType
  }

  return getWalletShape(wallet)?.gatewayType
}

/** The first declared shape that recognizes this wallet's payload. */
function getWalletShape(
  wallet: PaymentWallet,
): (typeof WALLET_SHAPES)[number] | undefined {
  const paymentData = wallet.payment_data
  return paymentData == null
    ? undefined
    : WALLET_SHAPES.find(({ match }) => match(paymentData))
}

/**
 * Logo and name of a gateway on its own, for a payment that identifies no
 * instrument: a non-vaultable setting (wire transfer and the like) stores no
 * card, so there is nothing else to show.
 */
export function getGatewayDisplay(paymentSettingType: string | undefined): {
  logoSrc: string
  label: string | undefined
} {
  return {
    logoSrc: `${LOGO_BASE_URL}/${
      GATEWAY_LOGO_KEYS[paymentSettingType ?? ""] ?? FALLBACK_LOGO_KEY
    }.svg`,
    label: GATEWAY_LABELS[paymentSettingType ?? ""],
  }
}

/**
 * Customer-facing gateway name of a wallet, for callers that show it next to
 * the card rather than instead of it (a subscription names both: "Adyen ·
 * Mastercard"). Resolved through the same detection as the card details, since
 * the setting's own type is unreliable here.
 */
export function getWalletGatewayLabel(
  wallet: PaymentWallet,
): string | undefined {
  return GATEWAY_LABELS[getWalletGatewayType(wallet) ?? ""]
}

export interface PaymentDisplay {
  /**
   * URL of the most specific logo we can resolve: the wallet when one was
   * used, else the card brand, else the gateway.
   */
  logoSrc: string
  /**
   * Card brand ("Visa") when known, else the wallet, else the gateway name
   * ("Adyen"). Brand wins over wallet because the wallet is already carried by
   * the logo, so the two together say "Mastercard, paid with Apple Pay".
   */
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
  return resolveDisplay({
    gatewayType: session.payment_setting?.type,
    details: getCardDetails(session, session.payment_setting?.type),
    fallbackLast4: getGiftCardTail(session),
  })
}

/**
 * Display for a payment that has no instrument yet, such as a payment link:
 * the gateway is known, the card the customer will reach for is not.
 */
export function getPaymentSettingDisplay(
  setting: PaymentSetting | null | undefined,
): PaymentDisplay {
  return resolveDisplay({ gatewayType: setting?.type, details: undefined })
}

/**
 * Same resolution for a stored payment method: what a subscription charges on
 * every renewal.
 *
 * The card details come from a different place than a session's, since a
 * wallet has no authorization to read: core stores the gateway's own
 * payment-method object in `payment_data` (`payment/wallet/*.rb`), which is
 * yet another shape per gateway.
 */
export function getPaymentWalletDisplay(wallet: PaymentWallet): PaymentDisplay {
  const shape = getWalletShape(wallet)

  return resolveDisplay({
    gatewayType: getWalletGatewayType(wallet),
    details:
      shape != null && wallet.payment_data != null
        ? shape.extract(wallet.payment_data)
        : undefined,
  })
}

/**
 * Falls back progressively (specific card brand, then the gateway, then a
 * generic credit-card icon) so an unrecognized gateway payload degrades to a
 * correct-but-vaguer row rather than a broken one.
 */
function resolveDisplay({
  gatewayType,
  details,
  fallbackLast4,
}: {
  gatewayType: string | undefined
  details: CardDetails | undefined
  fallbackLast4?: string
}): PaymentDisplay {
  const { brand: cardBrand, wallet: composedWallet } = parseCardCode(
    details?.brand,
  )
  // Stripe names the wallet in its own field; Adyen composes it into the brand
  // code, which `parseCardCode` has already pulled apart.
  const wallet = normalizeWallet(details?.wallet) ?? composedWallet

  return {
    logoSrc: `${LOGO_BASE_URL}/${
      wallet?.logoKey ??
      cardBrand ??
      GATEWAY_LOGO_KEYS[gatewayType ?? ""] ??
      FALLBACK_LOGO_KEY
    }.svg`,
    label:
      (cardBrand != null ? CARD_BRAND_LABELS[cardBrand] : undefined) ??
      wallet?.label ??
      GATEWAY_LABELS[gatewayType ?? ""] ??
      "Payment",
    last4:
      (typeof details?.last4 === "string" ? details.last4 : undefined) ??
      fallbackLast4,
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
): { brand: unknown; last4: unknown; wallet?: unknown } | undefined {
  const responseData = session.payment_authorization?.response_data
  const extractor =
    gatewayType != null ? CARD_DETAILS_BY_GATEWAY[gatewayType] : undefined
  return responseData != null && extractor != null
    ? extractor(responseData)
    : undefined
}

/**
 * Splits a raw gateway brand code into the brand and, when the gateway
 * composed one in, the wallet: Adyen reports a card paid through Apple Pay as
 * `"mc_applepay"`, which is neither a brand key nor a wallet key on its own.
 *
 * Each part is resolved by membership in its own map, which is what guarantees
 * the keys always name a logo that exists. Anything unrecognized yields
 * `undefined` and lets the caller fall back to the gateway.
 */
function parseCardCode(code: unknown): {
  brand: string | undefined
  wallet: { logoKey: string; label: string } | undefined
} {
  if (typeof code !== "string") {
    return { brand: undefined, wallet: undefined }
  }

  const tokens = code.toLowerCase().split(/[_-]/).filter(Boolean)

  return {
    brand: tokens.map(toCardBrand).find((brand) => brand != null),
    wallet: tokens.map(normalizeWallet).find((wallet) => wallet != null),
  }
}

function toCardBrand(token: string): string | undefined {
  const brand = CARD_BRAND_ALIASES[token] ?? token
  return CARD_BRAND_LABELS[brand] != null ? brand : undefined
}

/**
 * Resolves a wallet from a gateway code, ignoring separators so Stripe's
 * `"apple_pay"` and Adyen's `"applepay"` land on the same entry.
 */
function normalizeWallet(
  wallet: unknown,
): { logoKey: string; label: string } | undefined {
  if (typeof wallet !== "string") {
    return undefined
  }

  return WALLETS[wallet.toLowerCase().replace(/[_-]/g, "")]
}
