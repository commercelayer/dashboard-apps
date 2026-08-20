import type { Order, PaymentLink, PaymentSetting } from "@commercelayer/sdk"
import type { PaymentSettingType } from "dashboard-apps-common/src/helpers/paymentDisplay"
import { getOrderPaymentTotals } from "./orderPayments"

/**
 * Payment setting types that can create a payment link. Core does not expose
 * this, so it is listed here.
 */
const LINKABLE_SETTING_TYPES: readonly PaymentSettingType[] = [
  "payment_setting_adyens",
  "payment_setting_checkout_coms",
  "payment_setting_stripes",
]

/** Payment setting types whose link needs a payment session created first. */
const SESSION_FIRST_SETTING_TYPES: readonly PaymentSettingType[] = [
  "payment_setting_adyens",
  "payment_setting_checkout_coms",
]

/** The order's payment settings that can create a payment link. */
export function getLinkablePaymentSettings(order: Order): PaymentSetting[] {
  return (order.available_payment_settings ?? []).filter((setting) =>
    LINKABLE_SETTING_TYPES.includes(setting.type),
  )
}

/** True when the setting's link needs a payment session created first. */
export function requiresPaymentSession(setting: PaymentSetting): boolean {
  return SESSION_FIRST_SETTING_TYPES.includes(setting.type)
}

/**
 * The link's payment setting, resolved from the order's own settings. The
 * link returns the base `payment_settings` type, which has no logo.
 */
export function getPaymentLinkSetting(
  order: Order,
  link: PaymentLink,
): PaymentSetting | undefined {
  const settingId = link.payment_setting?.id
  if (settingId == null) {
    return undefined
  }

  return [
    ...(order.available_payment_settings ?? []),
    ...(order.payment_sessions ?? []).flatMap((session) =>
      session.payment_setting == null ? [] : [session.payment_setting],
    ),
  ].find((setting) => setting.id === settingId)
}

/** Total asked for by open links, in cents. Not collected until paid. */
export function getRequestedAmountCents(links: PaymentLink[]): number {
  return links
    .filter((link) => link.status === "open")
    .reduce((total, link) => total + (link.amount_cents ?? 0), 0)
}

/** What is left to collect that no open link asks for yet, in cents. */
export function getUnrequestedAmountCents(
  order: Order,
  links: PaymentLink[],
): number {
  return Math.max(
    0,
    getOrderPaymentTotals(order).toCollectCents -
      getRequestedAmountCents(links),
  )
}

/**
 * The links to list next to the sessions, newest first. Completed links are
 * left out: the session they created is already listed.
 */
export function getListedPaymentLinks(links: PaymentLink[]): PaymentLink[] {
  return links
    .filter((link) => link.status !== "completed")
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}
