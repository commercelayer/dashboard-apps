import { isMockedId, useCoreApi } from "@commercelayer/app-elements"
import type { Order, PaymentLink } from "@commercelayer/sdk"
import { isLegacyPaymentModel } from "#components/OrderPayment/paymentSessionUtils"

/**
 * The order's payment links, fetched apart from the order: if the token cannot
 * read them, only this list fails, not the whole order request.
 */
export function useOrderPaymentLinks(order: Order): {
  paymentLinks: PaymentLink[]
  mutatePaymentLinks: () => void
} {
  const { data, mutate } = useCoreApi(
    "payment_links",
    "list",
    isMockedId(order.id) || isLegacyPaymentModel(order)
      ? null
      : [
          {
            filters: { order_id_eq: order.id },
            // Newest first, so a long history cannot push recent links out of
            // the page.
            sort: { created_at: "desc" },
            // The setting's id, to resolve its logo from the order's settings,
            // and the session a link created up front.
            include: ["payment_setting", "payment_session"],
            pageSize: 25,
          },
        ],
    {
      // A refused fetch is a missing list, not something to retry.
      shouldRetryOnError: false,
    },
  )

  return {
    paymentLinks: data ?? [],
    mutatePaymentLinks: () => {
      void mutate()
    },
  }
}
