import { parseApiError, useCoreSdkProvider } from "@commercelayer/app-elements"
import type {
  CommerceLayerClient,
  Order,
  PaymentAuthorization,
} from "@commercelayer/sdk"
import { useState } from "react"
import { getOrderPaymentTotals } from "#components/OrderPayment/paymentSessionUtils"
import { orderIncludeAttribute, useOrderDetails } from "#hooks/useOrderDetails"

/**
 * B2B: finishes editing an order placed under an agreement, see
 * `finishAgreementOrderEdit`.
 */
export function useFinishAgreementOrderEdit(order: Order): {
  finish: () => Promise<void>
  isFinishing: boolean
  error: string | null
} {
  const { sdkClient } = useCoreSdkProvider()
  const { mutateOrder } = useOrderDetails(order.id)
  const [isFinishing, setIsFinishing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const finish = async (): Promise<void> => {
    setIsFinishing(true)
    setError(null)

    try {
      await mutateOrder(await finishAgreementOrderEdit(sdkClient, order.id))
    } catch (caught) {
      // Core's reason when it refused, the step's own message otherwise
      setError(
        parseApiError(caught, "Could not finish editing.")[0]?.detail ??
          "Could not finish editing.",
      )
      await mutateOrder()
    } finally {
      setIsFinishing(false)
    }
  }

  return { finish, isFinishing, error }
}

/**
 * The buyer pays on the agreement's terms, through the market's manual payment
 * setting, so an edit that raises the total past what was authorized is not
 * something to ask the buyer to pay: the difference is authorized on a second
 * manual session, and the seller only sees Finish go through.
 *
 * 1. a refresh — agreement orders never refresh on their own (`autorefresh` is
 *    off), so the total may still be the one from before the edit;
 * 2. what the order's authorizations no longer cover, from its transactions —
 *    an edit that lowers the total needs nothing, as captures are capped at it;
 * 3. if anything: a session on the manual payment setting for exactly that
 *    amount, then an authorization on it, waited on until it succeeds — Core
 *    accepts a manual authorization as `pending` and only counts it once it has
 *    settled, a moment later, so finishing straight away is refused as not
 *    covering the order;
 * 4. `_stop_editing`, returning the finished order.
 *
 * Safe to repeat: a retry picks up the session an earlier attempt left unpaid,
 * and waits on its authorization if it already has one, instead of opening
 * another.
 */
export async function finishAgreementOrderEdit(
  sdkClient: CommerceLayerClient,
  orderId: string,
  { pollIntervalMs = 1000 }: { pollIntervalMs?: number } = {},
): Promise<Order> {
  await sdkClient.orders.update({ id: orderId, _refresh: true })

  const current = await sdkClient.orders.retrieve(orderId, {
    include: [
      "market",
      "available_payment_settings",
      "payment_sessions",
      "payment_sessions.payment_authorization",
      "payment_sessions.payment_captures",
      "payment_sessions.payment_refunds",
    ],
  })

  const { toCollectCents } = getOrderPaymentTotals(current)
  if (toCollectCents > 0) {
    let session = (current.payment_sessions ?? []).find(
      (candidate) => candidate.status === "unpaid",
    )
    if (session == null) {
      const manual = (current.available_payment_settings ?? []).find(
        (setting) => setting.type === "payment_setting_manuals",
      )
      if (manual == null) {
        throw new Error(
          `The ${current.market?.name ?? "order's"} market has no manual payment method. Add one, then finish editing.`,
        )
      }
      session = await sdkClient.payment_sessions.create({
        order: sdkClient.orders.relationship(orderId),
        payment_setting: sdkClient.payment_setting_manuals.relationship(
          manual.id,
        ),
        amount_cents: toCollectCents,
      })
    }

    await waitForAuthorization(
      sdkClient,
      session.payment_authorization ??
        (await sdkClient.payment_authorizations.create({
          payment_session: sdkClient.payment_sessions.relationship(session.id),
        })),
      pollIntervalMs,
    )
  }

  return await sdkClient.orders.update(
    { id: orderId, _stop_editing: true },
    { include: orderIncludeAttribute },
  )
}

/** About fifteen seconds at the default interval, well past how long it takes. */
const MAX_POLLS = 15

async function waitForAuthorization(
  sdkClient: CommerceLayerClient,
  authorization: PaymentAuthorization,
  pollIntervalMs: number,
): Promise<void> {
  let current = authorization

  for (let poll = 0; current.status !== "succeeded"; poll++) {
    if (current.status !== "pending" && current.status !== "processing") {
      throw new Error(`The payment authorization is ${current.status}.`)
    }
    if (poll === MAX_POLLS) {
      throw new Error(
        "The payment is still being authorized. Finish again in a moment.",
      )
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
    current = await sdkClient.payment_authorizations.retrieve(current.id)
  }
}
