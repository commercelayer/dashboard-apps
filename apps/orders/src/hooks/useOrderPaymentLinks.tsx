import { isMockedId, useCoreApi } from "@commercelayer/app-elements"
import type { PaymentLinkWithAmount } from "#components/OrderPayment/paymentSessionUtils"

/**
 * The order's payment links, fetched on their own rather than included in the
 * order.
 *
 * An `include` the access token may not read takes the whole order request
 * down with it, and reading `payment_links` is a newer grant than the app can
 * assume everywhere. Asked for separately, a refusal costs nothing but the
 * list: the order still renders, and the section simply shows no links.
 */
export function useOrderPaymentLinks(orderId: string): {
  paymentLinks: PaymentLinkWithAmount[]
  mutatePaymentLinks: () => void
} {
  const { data, mutate } = useCoreApi(
    "payment_links",
    "list",
    isMockedId(orderId)
      ? null
      : [
          {
            filters: { order_id_eq: orderId },
            // The gateway for the row's logo, and the session the link created
            // up front, which the row stands in for while the link is open.
            include: ["payment_setting", "payment_session"],
            pageSize: 25,
          },
        ],
    {
      // The order page already refreshes on every payment action; a failed
      // fetch here is a missing list, not something to retry at.
      shouldRetryOnError: false,
    },
  )

  return {
    paymentLinks: (data ?? []) as PaymentLinkWithAmount[],
    mutatePaymentLinks: () => {
      void mutate()
    },
  }
}
