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
  getListedPaymentLinks,
  getOrderPaymentTotals,
  getPaymentLinkSetting,
  getRequestedAmountCents,
} from "#components/OrderPayment/paymentSessionUtils"
import { ResourcePaymentSessions } from "#components/OrderPayment/ResourcePaymentSessions"
import { useOrderPaymentLinks } from "#hooks/useOrderPaymentLinks"

interface Props {
  order: Order
  onOrderChange: () => void
}

/** The Payments section: sessions, open links, and the button to request a payment. */
export const OrderPaymentSessions = withSkeletonTemplate<Props>(
  ({ order, onOrderChange }) => {
    const { canUser } = useTokenProvider()
    const { paymentLinks, mutatePaymentLinks } = useOrderPaymentLinks(order)
    const { modal: paymentLinkModal, open: openPaymentLink } =
      useCreatePaymentLinkModal({
        order,
        requestedCents: getRequestedAmountCents(paymentLinks),
        onChange: () => {
          onOrderChange()
          mutatePaymentLinks()
        },
      })

    /** Needs a gateway that supports links, and something left to collect. */
    const canCreatePaymentLink =
      canUser("create", "payment_links") &&
      getLinkablePaymentSettings(order).length > 0 &&
      getOrderPaymentTotals(order).toCollectCents > 0

    return (
      <>
        <ResourcePaymentSessions
          orderId={order.id}
          sessions={order.payment_sessions ?? []}
          links={getListedPaymentLinks(paymentLinks).map((link) => ({
            link,
            setting: getPaymentLinkSetting(order, link),
          }))}
          // Every link, completed ones too: it ties a paid session to its link.
          sessionPaymentLinks={
            new Map(
              paymentLinks.flatMap((link) =>
                link.payment_session == null
                  ? []
                  : [[link.payment_session.id, link] as const],
              ),
            )
          }
          actionButton={
            canCreatePaymentLink ? (
              <Button
                variant="secondary"
                size="mini"
                alignItems="center"
                onClick={openPaymentLink}
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
