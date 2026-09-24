import {
  Button,
  Icon,
  useTokenProvider,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { useCreatePaymentLinkModal } from "#components/OrderPayment/hooks/useCreatePaymentLinkModal"
import {
  getLinkablePaymentSettings,
  getOrderPaymentTotals,
  getOutstandingPaymentLinks,
  getPaymentLinkSetting,
} from "#components/OrderPayment/paymentSessionUtils"
import { ResourcePaymentSessions } from "#components/OrderPayment/ResourcePaymentSessions"
import { useOrderPaymentLinks } from "#hooks/useOrderPaymentLinks"

interface Props {
  order: Order
  onOrderChange: () => void
}

/**
 * Payments display for orders placed under API version 2026-05+.
 * Thin adapter: pulls the sessions and the outstanding payment links off the
 * order and hands them to `ResourcePaymentSessions`, which doesn't need to
 * know about `Order` at all.
 */
export const OrderPaymentSessions = withSkeletonTemplate<Props>(
  ({ order, onOrderChange }) => {
    const { canUser } = useTokenProvider()
    const { paymentLinks, mutatePaymentLinks } = useOrderPaymentLinks(order.id)
    const { modal: paymentLinkModal, open: openPaymentLink } =
      useCreatePaymentLinkModal({
        order,
        onChange: () => {
          onOrderChange()
          mutatePaymentLinks()
        },
      })

    /**
     * Nothing to offer when no gateway on this order can produce a link, and
     * nothing to ask for when the order is already covered: core sizes a link
     * against the order's residual and refuses one worth more, so on a fully
     * collected order every amount is refused.
     */
    const canCreatePaymentLink =
      canUser("create", "payment_links") &&
      getLinkablePaymentSettings(order).length > 0 &&
      getOrderPaymentTotals(order).toCollectCents > 0

    return (
      <>
        <ResourcePaymentSessions
          sessions={order.payment_sessions ?? []}
          links={getOutstandingPaymentLinks(paymentLinks).map((link) => ({
            link,
            setting: getPaymentLinkSetting(order, link),
          }))}
          actionButton={
            canCreatePaymentLink ? (
              <Button
                variant="secondary"
                size="mini"
                alignItems="center"
                onClick={() => {
                  openPaymentLink()
                }}
              >
                <Icon name="plus" />
                New
              </Button>
            ) : undefined
          }
          onChange={onOrderChange}
        />
        {canCreatePaymentLink && paymentLinkModal}
      </>
    )
  },
)
