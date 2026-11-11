import {
  Alert,
  Button,
  getAgentOrderReviewNote,
  getLastOrderReview,
  Icon,
  isAgentOrderReview,
  type ResourceLineItemsProps,
  Spacer,
  Text,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { OrderPaymentTotals } from "#components/OrderPayment/OrderPaymentTotals"
import { useOrderDetails } from "#hooks/useOrderDetails"
import { DeleteCouponButton } from "../DeleteCouponButton"
import { SummaryRows } from "../SummaryRows"
import { renderTotalRow } from "../utils"
import { useAddCouponOverlay } from "./useAddCouponOverlay"
import { useOrderStatus } from "./useOrderStatus"

export function useSummaryRows(order: Order): {
  summaryRows: ResourceLineItemsProps["footer"]
} {
  const { mutateOrder } = useOrderDetails(order.id)
  const { isEditing, diffTotalAndPlacedTotal } = useOrderStatus(order)
  const { t } = useTranslation()
  const {
    settings: { extras },
  } = useTokenProvider()

  const { Overlay: AddCouponOverlay, open: openAddCouponOverlay } =
    useAddCouponOverlay(order, () => {
      void mutateOrder()
    })

  const summaryRows: ResourceLineItemsProps["footer"] = []

  if (isEditing || order.coupon_code != null) {
    summaryRows.push({
      key: "coupon",
      element: (
        <>
          <AddCouponOverlay />
          {renderTotalRow({
            label: t("resources.coupons.name"),
            value:
              order.coupon_code == null ? (
                <Button
                  variant="link"
                  onClick={() => {
                    openAddCouponOverlay()
                  }}
                >
                  {t("common.add_resource", {
                    resource: t("resources.coupons.name").toLowerCase(),
                  })}
                </Button>
              ) : (
                <div className="flex gap-3">
                  {order.coupon_code}
                  {isEditing && (
                    <DeleteCouponButton
                      order={order}
                      onChange={() => {
                        void mutateOrder()
                      }}
                    />
                  )}
                </div>
              ),
          })}
        </>
      ),
    })
  }

  summaryRows.push({
    key: "summary",
    element: (
      <>
        <SummaryRows order={order} editable={isEditing} />
        <OrderPaymentTotals order={order} />
        {diffTotalAndPlacedTotal != null && (
          <Spacer bottom="8">
            <Alert status="warning">
              {t("apps.orders.details.new_total_line1", {
                new_total: order.formatted_total_amount_with_taxes,
                difference: diffTotalAndPlacedTotal,
              })}
              <br />
              {t("apps.orders.details.new_total_line2")}
            </Alert>
          </Spacer>
        )}
      </>
    ),
  })

  const isAgreementsEnabled = extras?.organization?.isAgreementsEnabled === true

  const agentNote = getAgentNote(order, { isAgreementsEnabled })
  if (agentNote != null) {
    summaryRows.push({
      key: "agent_note",
      element: (
        <Spacer bottom="8">
          <Alert status="info">
            <Text
              tag="div"
              weight="semibold"
              className="flex items-center gap-1"
            >
              <Icon name="robot" size={16} />
              {t("apps.orders.details.note_from_agent")}
            </Text>
            {agentNote}
          </Alert>
        </Spacer>
      ),
    })
  }

  const customerNote = getCustomerNote(order, { isAgreementsEnabled })
  if (customerNote != null) {
    summaryRows.push({
      key: "customer_note",
      element: (
        <Spacer bottom="8">
          <Alert status="info">
            <Text tag="div" weight="semibold">
              {t("apps.orders.details.note_from_customer")}
            </Text>
            {customerNote}
          </Alert>
        </Spacer>
      ),
    })
  }

  return {
    summaryRows,
  }
}

/**
 * B2B: the buyer's note, while the seller is deciding what to do with the order.
 *
 * Shown in the summary, as the design has it, from the moment the order is placed
 * and while it is edited — the note is often what the edit is about — up to the
 * first review sent to the buyer. From then on the conversation is the review's,
 * and the note stays in the timeline.
 *
 * An order an email-to-order agent built and held is still a cart, and the note
 * is what the buyer's email asked for: shown too, while the seller decides. The
 * agent's review was not sent to the buyer, so it does not count as one.
 */
export function getCustomerNote(
  order: Order,
  { isAgreementsEnabled }: { isAgreementsEnabled: boolean },
): string | null {
  const note = order.notes?.trim()
  const reviews = order.order_reviews ?? []
  if (
    !isAgreementsEnabled ||
    order.agreement == null ||
    note == null ||
    note === "" ||
    reviews.some((review) => !isAgentOrderReview(review))
  ) {
    return null
  }
  const isHeldByAgent = reviews.some(
    (review) => review.status === "pending" && isAgentOrderReview(review),
  )
  return order.status === "placed" ||
    order.status === "editing" ||
    (order.status === "pending" && isHeldByAgent)
    ? note
    : null
}

/**
 * B2B: what an email-to-order agent says about the order it held — why it did not
 * place it — while the seller answers. Once answered, it stays in the timeline.
 */
export function getAgentNote(
  order: Order,
  { isAgreementsEnabled }: { isAgreementsEnabled: boolean },
): string | null {
  const lastReview = getLastOrderReview(order)
  if (
    !isAgreementsEnabled ||
    order.agreement == null ||
    lastReview?.status !== "pending"
  ) {
    return null
  }
  return getAgentOrderReviewNote(lastReview)
}
