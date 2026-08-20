import type { UnknownRecord } from "type-fest"
import type { PaymentSettingType } from "./tables"

/**
 * Reads the card out of raw gateway payloads. Shapes differ per gateway and
 * per outcome, so anything unreadable is left `undefined`.
 */

export function isUnknownRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getObject(
  data: UnknownRecord | undefined,
  key: string,
): UnknownRecord | undefined {
  const value = data?.[key]
  return isUnknownRecord(value) ? value : undefined
}

function getString(
  data: UnknownRecord | undefined,
  key: string,
): string | undefined {
  const value = data?.[key]
  return typeof value === "string" ? value : undefined
}

/** The card as the gateway reports it, before mapping to our assets. */
export interface CardDetails {
  /** May be composite, e.g. Adyen's `"mc_applepay"`. */
  brand?: string
  last4?: string
  /** Set when the gateway reports the wallet separately (Stripe). */
  wallet?: string
}

function readStripeCard(card: UnknownRecord | undefined): CardDetails {
  return {
    brand: getString(card, "brand"),
    last4: getString(card, "last4"),
    wallet: getString(getObject(card, "wallet"), "type"),
  }
}

/** Adyen's `paymentMethod` and `additionalData.cardSummary`. */
function readAdyenPaymentResult(data: UnknownRecord): CardDetails {
  return {
    brand: getString(data, "paymentMethod"),
    last4: getString(getObject(data, "additionalData"), "cardSummary"),
  }
}

/** Where each gateway puts the card in an authorization's `response_data`. */
export const SESSION_CARD_READERS: Partial<
  Record<PaymentSettingType, (responseData: UnknownRecord) => CardDetails>
> = {
  payment_setting_stripes: (responseData) =>
    readStripeCard(
      getObject(getObject(responseData, "payment_method_details"), "card"),
    ),
  payment_setting_adyens: readAdyenPaymentResult,
}

/** A Stripe PaymentMethod keeps its details under the key its `type` names. */
function getStripePaymentMethodDetails(
  paymentData: UnknownRecord,
): UnknownRecord | undefined {
  const type = getString(paymentData, "type")
  const details = type == null ? undefined : getObject(paymentData, type)
  return details?.last4 != null || details?.brand != null ? details : undefined
}

export interface WalletShape {
  settingType: PaymentSettingType
  match: (paymentData: UnknownRecord) => boolean
  read: (paymentData: UnknownRecord) => CardDetails
}

/**
 * Stored payment methods, matched by the shape of `payment_data`. The first
 * match wins and also names the setting type, since a wallet's own is
 * unreliable.
 */
export const WALLET_SHAPES: WalletShape[] = [
  {
    // PaymentMethod object.
    settingType: "payment_setting_stripes",
    match: (paymentData) =>
      paymentData.object === "payment_method" ||
      getStripePaymentMethodDetails(paymentData) != null,
    read: (paymentData) =>
      readStripeCard(getStripePaymentMethodDetails(paymentData)),
  },
  {
    // Stored payment method: `{ brand, lastFour }`.
    settingType: "payment_setting_adyens",
    match: (paymentData) => paymentData.lastFour != null,
    read: (paymentData) => ({
      brand: getString(paymentData, "brand") ?? getString(paymentData, "name"),
      last4: getString(paymentData, "lastFour"),
    }),
  },
  {
    // `RECURRING_CONTRACT` notification, same shape as a session.
    settingType: "payment_setting_adyens",
    match: (paymentData) =>
      paymentData.additionalData != null || paymentData.pspReference != null,
    read: readAdyenPaymentResult,
  },
  {
    // Vaulted card: `{ brand_code, last4 }`.
    settingType: "payment_setting_braintrees",
    match: (paymentData) =>
      paymentData.brand_code != null || paymentData.details_type != null,
    read: (paymentData) => ({
      brand: getString(paymentData, "brand_code"),
      last4: getString(paymentData, "last4"),
    }),
  },
]
