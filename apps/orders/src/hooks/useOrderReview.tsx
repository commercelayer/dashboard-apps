import {
  type ActionButtonsProps,
  InputTextArea,
  Spacer,
  useConfirmDialog,
  useCoreSdkProvider,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import type { Order, OrderReview } from "@commercelayer/sdk"
import { type ReactNode, useState } from "react"
import { useOrderDetails } from "#hooks/useOrderDetails"

/** The order's latest review, the one Core gates place and approve on. */
export function getLastOrderReview(order: Order): OrderReview | null {
  return (
    [...(order.order_reviews ?? [])].sort((a, b) =>
      (b.created_at ?? "").localeCompare(a.created_at ?? ""),
    )[0] ?? null
  )
}

/**
 * Asking the buyer to confirm a B2B order, from the seller's side.
 *
 * Asking is always the seller's choice: a placed agreement order offers "Send to
 * customer for review" beside Approve, and so does a pending one the seller built
 * for the buyer, beside Place — the buyer then places it by confirming. The
 * review is owned by the order's
 * customer — the buyer who placed it, the only one Core lets answer — with the
 * signed-in seller as requester. While it is pending the order is on hold and
 * cannot be approved; a pending review can be withdrawn, which takes the order
 * off hold. A rejected one stays: removing it would unblock approve, so the
 * seller changes the order and asks again, or cancels it.
 *
 * Only for agreement orders of an organization with agreements switched on.
 */
export function useOrderReview(order: Order): {
  lastReview: OrderReview | null
  /** A pending review: Approve is not offered. */
  isAwaitingReview: boolean
  /** The latest review was rejected: Approve is not offered either. */
  isRejected: boolean
  actions: ActionButtonsProps["actions"]
  dialogs: ReactNode
} {
  const { t } = useTranslation()
  const { sdkClient } = useCoreSdkProvider()
  const {
    canUser,
    user,
    settings: { extras },
  } = useTokenProvider()
  const { mutateOrder } = useOrderDetails(order.id)
  const [reason, setReason] = useState("")
  const { show: showSend, ConfirmDialog: SendDialog } = useConfirmDialog()
  const { show: showWithdraw, ConfirmDialog: WithdrawDialog } =
    useConfirmDialog()

  const isAgreementOrder =
    extras?.organization?.isAgreementsEnabled === true &&
    order.agreement != null
  const lastReview = isAgreementOrder ? getLastOrderReview(order) : null
  const isAwaitingReview =
    isAgreementOrder &&
    (order.on_hold === true || lastReview?.status === "pending")
  const isRejected = !isAwaitingReview && lastReview?.status === "rejected"

  const customerId = order.customer?.id
  const canSend =
    isAgreementOrder &&
    // a placed order the seller changed, or one the seller built for the buyer
    // and wants confirmed before it is placed
    (order.status === "placed" ||
      (order.status === "pending" &&
        (order.line_items ?? []).some((item) => item.item_type === "skus"))) &&
    !isAwaitingReview &&
    customerId != null &&
    user != null &&
    canUser("create", "order_reviews")
  const canWithdraw =
    lastReview?.status === "pending" && canUser("destroy", "order_reviews")

  const actions: ActionButtonsProps["actions"] = [
    ...(canSend
      ? [
          {
            label: t("apps.orders.actions.send_for_review"),
            variant: "secondary" as const,
            onClick: () => {
              showSend()
            },
          },
        ]
      : []),
    ...(canWithdraw
      ? [
          {
            label: t("apps.orders.actions.withdraw_review"),
            variant: "secondary" as const,
            onClick: () => {
              showWithdraw()
            },
          },
        ]
      : []),
  ]

  const dialogs = (
    <>
      <SendDialog
        icon="chatCircle"
        title={t("apps.orders.actions.send_for_review_title")}
        description={
          <Spacer top="4">
            <InputTextArea
              name="orderReviewReason"
              label={t("apps.orders.details.review_reason")}
              hint={{ text: t("apps.orders.details.review_reason_hint") }}
              rows={4}
              value={reason}
              onChange={(event) => {
                setReason(event.currentTarget.value)
              }}
            />
          </Spacer>
        }
        confirm={{
          label: t("apps.orders.actions.send_for_review"),
          onClick: async () => {
            if (customerId == null || user == null) {
              return
            }
            await sdkClient.order_reviews.create({
              order: sdkClient.orders.relationship(order.id),
              owner: sdkClient.customers.relationship(customerId),
              requester: sdkClient.users.relationship(user.id),
              reason: reason.trim() === "" ? null : reason.trim(),
            })
            setReason("")
            await mutateOrder()
          },
        }}
        successMessage={t("apps.orders.details.review_sent")}
      />
      <WithdrawDialog
        icon="arrowUUpLeft"
        title={t("apps.orders.actions.withdraw_review_title")}
        description={t("apps.orders.details.withdraw_review_description")}
        confirm={{
          label: t("apps.orders.actions.withdraw_review"),
          variant: "danger",
          onClick: async () => {
            if (lastReview == null) {
              return
            }
            await sdkClient.order_reviews.delete(lastReview.id)
            await mutateOrder()
          },
        }}
      />
    </>
  )

  return { lastReview, isAwaitingReview, isRejected, actions, dialogs }
}
