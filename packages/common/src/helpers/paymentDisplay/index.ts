import type { PaymentSession, PaymentWallet } from "@commercelayer/sdk"
import {
  type CardDetails,
  isUnknownRecord,
  SESSION_CARD_READERS,
  WALLET_SHAPES,
  type WalletShape,
} from "./cardDetails"
import {
  CARD_BRAND_ALIASES,
  CARD_BRAND_LABELS,
  type CardBrand,
  FALLBACK_LOGO_KEY,
  getLogoSrc,
  isCardBrand,
  isPaymentSettingType,
  PAYMENT_SETTING_LABELS,
  PAYMENT_SETTING_LOGO_KEYS,
  type PaymentSettingType,
  WALLETS,
  type Wallet,
} from "./tables"

export type { PaymentSettingType } from "./tables"

export interface PaymentDisplay {
  /** Wallet logo when used, else the card brand, else the payment setting. */
  logoSrc: string
  /** Card brand when known, else the wallet, else the payment setting. */
  label: string
  last4: string | undefined
}

/** Logo, label and last 4 digits of a payment session. */
export function getPaymentSessionDisplay(
  session: PaymentSession,
): PaymentDisplay {
  const settingType = toPaymentSettingType(session.payment_setting?.type)

  return resolveDisplay({
    settingType,
    details: getSessionCardDetails(session, settingType),
    fallbackLast4: getGiftCardTail(session),
  })
}

export interface PaymentWalletDisplay extends PaymentDisplay {
  /** Payment setting label, shown next to the card ("Adyen · Mastercard"). */
  settingLabel: string | undefined
}

/** Same as `getPaymentSessionDisplay`, for a stored payment method. */
export function getPaymentWalletDisplay(
  wallet: PaymentWallet,
): PaymentWalletDisplay {
  const shape = getWalletShape(wallet)
  const settingType = getWalletSettingType(wallet)

  return {
    ...resolveDisplay({
      settingType,
      details:
        shape != null && isUnknownRecord(wallet.payment_data)
          ? shape.read(wallet.payment_data)
          : undefined,
    }),
    settingLabel:
      settingType == null ? undefined : PAYMENT_SETTING_LABELS[settingType],
  }
}

/**
 * Logo and label of a payment setting alone, for a payment with no card yet.
 * `label` is `undefined` for an unknown type, so callers can fall back.
 */
export function getPaymentSettingDisplay(
  settingType: PaymentSettingType | undefined,
): {
  logoSrc: string
  label: string | undefined
} {
  const known = toPaymentSettingType(settingType)

  return {
    logoSrc: getLogoSrc(
      known == null ? FALLBACK_LOGO_KEY : PAYMENT_SETTING_LOGO_KEYS[known],
    ),
    label: known == null ? undefined : PAYMENT_SETTING_LABELS[known],
  }
}

function toPaymentSettingType(value: unknown): PaymentSettingType | undefined {
  return isPaymentSettingType(value) ? value : undefined
}

/** Most specific first: wallet, card brand, payment setting, generic card. */
function resolveDisplay({
  settingType,
  details,
  fallbackLast4,
}: {
  settingType: PaymentSettingType | undefined
  details: CardDetails | undefined
  fallbackLast4?: string
}): PaymentDisplay {
  const { brand, wallet: composedWallet } = parseCardCode(details?.brand)
  const wallet = toWallet(details?.wallet) ?? composedWallet

  return {
    logoSrc: getLogoSrc(
      wallet?.logoKey ??
        brand ??
        (settingType == null
          ? FALLBACK_LOGO_KEY
          : PAYMENT_SETTING_LOGO_KEYS[settingType]),
    ),
    label:
      (brand == null ? undefined : CARD_BRAND_LABELS[brand]) ??
      wallet?.label ??
      (settingType == null ? undefined : PAYMENT_SETTING_LABELS[settingType]) ??
      "Payment",
    last4: details?.last4 ?? fallbackLast4,
  }
}

/** Last 4 of the gift card code, since a gift card has no card details. */
function getGiftCardTail(session: PaymentSession): string | undefined {
  const code = session.gift_card_code
  return code != null && code !== "" ? code.slice(-4) : undefined
}

/**
 * Read from the authorization, which points at the transaction that reached
 * the card network, rather than from every transaction.
 */
function getSessionCardDetails(
  session: PaymentSession,
  settingType: PaymentSettingType | undefined,
): CardDetails | undefined {
  const responseData = session.payment_authorization?.response_data
  const read =
    settingType == null ? undefined : SESSION_CARD_READERS[settingType]

  return read != null && isUnknownRecord(responseData)
    ? read(responseData)
    : undefined
}

/** The setting's type when usable, else the one its payload shape names. */
function getWalletSettingType(
  wallet: PaymentWallet,
): PaymentSettingType | undefined {
  return (
    toPaymentSettingType(wallet.payment_setting?.type) ??
    getWalletShape(wallet)?.settingType
  )
}

function getWalletShape(wallet: PaymentWallet): WalletShape | undefined {
  const paymentData = wallet.payment_data
  return isUnknownRecord(paymentData)
    ? WALLET_SHAPES.find(({ match }) => match(paymentData))
    : undefined
}

/** Splits a brand code like `"mc_applepay"` into brand and wallet. */
function parseCardCode(code: string | undefined): {
  brand: CardBrand | undefined
  wallet: Wallet | undefined
} {
  const tokens = (code ?? "").toLowerCase().split(/[_-]/).filter(Boolean)

  return {
    brand: tokens.map(toCardBrand).find((brand) => brand != null),
    wallet: tokens.map(toWallet).find((wallet) => wallet != null),
  }
}

function toCardBrand(token: string): CardBrand | undefined {
  const brand = CARD_BRAND_ALIASES.get(token) ?? token
  return isCardBrand(brand) ? brand : undefined
}

/** Ignores separators, so `"apple_pay"` and `"applepay"` match. */
function toWallet(code: string | undefined): Wallet | undefined {
  return code == null
    ? undefined
    : WALLETS.get(code.toLowerCase().replace(/[_-]/g, ""))
}
