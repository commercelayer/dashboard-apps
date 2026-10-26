import { useCoreSdkProvider } from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { useState } from "react"
import { useOrderDetails } from "#hooks/useOrderDetails"

/**
 * B2B: places an order the seller built for a buyer under an agreement.
 *
 * An agreement order has no checkout: the buyer pays on the agreement's terms,
 * so the payment is set up here, the same way the buyer shell's Submit does it
 * (dashboard-react `useSubmitOrder`, verified on stg3) and Core's email-to-order:
 *
 * 1. a refresh — agreement orders never refresh on their own, so without it the
 *    shipments may not exist yet;
 * 2. every shipment must carry a shipping method — the market's default, which
 *    the agreement form warns about when it is missing;
 * 3. a payment session on the market's manual payment setting, then an
 *    authorization on it;
 * 4. `_place`.
 *
 * Each step is safe to repeat: a retry reuses the session already created.
 */
export function usePlaceAgreementOrder(order: Order): {
  place: () => Promise<void>
  isPlacing: boolean
  error: string | null
} {
  const { sdkClient } = useCoreSdkProvider()
  const { mutateOrder } = useOrderDetails(order.id)
  const [isPlacing, setIsPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const place = async (): Promise<void> => {
    setIsPlacing(true)
    setError(null)

    try {
      await sdkClient.orders.update({ id: order.id, _refresh: true })

      const current = await sdkClient.orders.retrieve(order.id, {
        include: [
          "market",
          "shipments",
          "shipments.shipping_method",
          "payment_sessions",
          "available_payment_settings",
        ],
      })

      const shipments = current.shipments ?? []
      if (shipments.some((shipment) => shipment.shipping_method == null)) {
        throw new Error(
          `The ${current.market?.name ?? "order's"} market has no default shipping method. Set one, then place the order.`,
        )
      }

      let session = (current.payment_sessions ?? [])[0]
      if (session == null) {
        const manual = (current.available_payment_settings ?? []).find(
          (setting) => setting.type === "payment_setting_manuals",
        )
        if (manual == null) {
          throw new Error(
            `The ${current.market?.name ?? "order's"} market has no manual payment method. Add one, then place the order.`,
          )
        }
        session = await sdkClient.payment_sessions.create({
          order: sdkClient.orders.relationship(order.id),
          payment_setting: sdkClient.payment_setting_manuals.relationship(
            manual.id,
          ),
        })
      }

      if (session.status !== "authorized") {
        await sdkClient.payment_authorizations.create({
          payment_session: sdkClient.payment_sessions.relationship(session.id),
        })
      }

      await sdkClient.orders.update({ id: order.id, _place: true })
    } catch (caught) {
      setError(
        caught instanceof Error && caught.message !== ""
          ? caught.message
          : "Could not place the order.",
      )
    } finally {
      setIsPlacing(false)
      await mutateOrder()
    }
  }

  return { place, isPlacing, error }
}
