import {
  type ActionButtonsProps,
  InputTextArea,
  isAgentOrderReview,
  parseApiError,
  Spacer,
  Text,
  useAppLinking,
  useConfirmDialog,
  useCoreSdkProvider,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import type { Order, OrderReview } from "@commercelayer/sdk"
import { type ReactNode, useRef, useState } from "react"
import type { PaymentActionStep } from "#components/OrderPayment/hooks/usePaymentActionFlow"
import {
  PaymentActionConfirm,
  type PaymentActionCopy,
  PaymentActionModal,
} from "#components/OrderPayment/PaymentActionModal"
import { appRoutes } from "#data/routes"
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
 * An order an email-to-order agent built is held by a review the other way
 * round: the agent asks, and the seller — the agreement's account manager, who
 * owns it — answers. Nothing is sent or withdrawn then: the seller accepts the
 * order, which accepts the review and places it, still to be approved, or
 * cancels it, which declines the review and archives the order, a cart nobody
 * will place.
 *
 * Only for agreement orders of an organization with agreements switched on.
 */
export function useOrderReview(order: Order): {
  lastReview: OrderReview | null
  /** A pending review: Approve is not offered. */
  isAwaitingReview: boolean
  /** The latest review was rejected: Approve is not offered either. */
  isRejected: boolean
  /** The pending review is an agent's, so the seller answers it. */
  isAgentReview: boolean
  /** Whether the signed-in user may answer the agent's review: Core lets only its owner. */
  canAnswerAgentReview: boolean
  /** Accepts the agent's review, taking the order off hold; throws when Core refuses. */
  acceptAgentReview: () => Promise<void>
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
  const { goBack } = useAppLinking()
  const [reason, setReason] = useState("")
  const [isSendOpen, setIsSendOpen] = useState(false)
  const [sendStep, setSendStep] = useState<PaymentActionStep>("confirm")
  const [sendError, setSendError] = useState<string>()
  // set by Cancel while sending: a review that lands afterwards is withdrawn
  const isSendCancelled = useRef(false)

  const sendCopy: PaymentActionCopy = {
    running: t("apps.orders.details.sending_for_review"),
    success: t("apps.orders.details.review_sent_title"),
    // a review is created or it is not: there is no outcome still on its way
    pending: t("apps.orders.details.sending_for_review"),
    error: t("apps.orders.details.send_for_review_failed"),
  }

  const closeSend = (): void => {
    setIsSendOpen(false)
    setSendStep("confirm")
    setSendError(undefined)
  }

  const send = async (): Promise<void> => {
    if (customerId == null || user == null) {
      return
    }
    isSendCancelled.current = false
    setSendStep("running")
    try {
      const review = await sdkClient.order_reviews.create({
        order: sdkClient.orders.relationship(order.id),
        owner: sdkClient.customers.relationship(customerId),
        requester: sdkClient.users.relationship(user.id),
        reason: reason.trim() === "" ? null : reason.trim(),
      })
      if (isSendCancelled.current) {
        await sdkClient.order_reviews.delete(review.id)
      } else {
        setReason("")
        setSendStep("success")
      }
    } catch (error) {
      if (!isSendCancelled.current) {
        setSendError(parseApiError(error)[0]?.detail)
        setSendStep("error")
      }
    } finally {
      await mutateOrder()
    }
  }
  const { show: showWithdraw, ConfirmDialog: WithdrawDialog } =
    useConfirmDialog()
  const { show: showDecline, ConfirmDialog: DeclineDialog } = useConfirmDialog()

  const isAgreementOrder =
    extras?.organization?.isAgreementsEnabled === true &&
    order.agreement != null
  const lastReview = isAgreementOrder ? getLastOrderReview(order) : null
  const isAwaitingReview =
    isAgreementOrder &&
    (order.on_hold === true || lastReview?.status === "pending")
  const isRejected = !isAwaitingReview && lastReview?.status === "rejected"
  const isAgentReview =
    lastReview?.status === "pending" && isAgentOrderReview(lastReview)
  // the owner comes with the review when the token may read users; without it
  // Core still refuses anyone else, and says so
  const canAnswerAgentReview =
    isAgentReview &&
    canUser("update", "order_reviews") &&
    (lastReview?.owner == null || lastReview.owner.id === user?.id)

  const acceptAgentReview = async (): Promise<void> => {
    if (lastReview == null) {
      return
    }
    await sdkClient.order_reviews.update({ id: lastReview.id, _accept: true })
  }

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
    lastReview?.status === "pending" &&
    !isAgentReview &&
    canUser("destroy", "order_reviews")

  const actions: ActionButtonsProps["actions"] = [
    ...(canSend
      ? [
          {
            label: t("apps.orders.actions.send_for_review"),
            variant: "secondary" as const,
            onClick: () => {
              setIsSendOpen(true)
            },
          },
        ]
      : []),
    ...(isAgentReview
      ? [
          {
            label: t("apps.orders.actions.cancel"),
            variant: "secondary" as const,
            disabled: !canAnswerAgentReview,
            onClick: () => {
              showDecline()
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
      <PaymentActionModal
        show={isSendOpen}
        step={sendStep}
        copy={sendCopy}
        detail={t("apps.orders.details.review_sent_description", {
          customer: order.customer_email ?? t("resources.customers.name"),
        })}
        errorDetail={sendError}
        runningDetail={
          order.customer_email != null
            ? t("apps.orders.details.sending_for_review_to", {
                email: order.customer_email,
              })
            : undefined
        }
        onCancelRunning={() => {
          // a single request has no step to stop at: the review it creates is
          // taken back once it lands, which also takes the order off hold
          isSendCancelled.current = true
          closeSend()
        }}
        successActions={[
          { label: t("apps.orders.details.view_order"), onClick: closeSend },
          {
            label: t("apps.orders.details.back_to_orders"),
            onClick: () => {
              closeSend()
              goBack({
                defaultRelativePath: appRoutes.home.makePath({}),
                currentResourceId: order.id,
              })
            },
          },
        ]}
        onClose={closeSend}
      >
        <PaymentActionConfirm
          icon="paperPlaneTiltIcon"
          title={t("apps.orders.actions.send_for_review_title")}
          description={
            // a node, so the field keeps the normal text colour: only the
            // sentence above it is secondary text
            <div className="w-full">
              <Text variant="info" size="small" tag="div">
                {t("apps.orders.details.send_for_review_description")}
              </Text>
              <Spacer top="4">
                <InputTextArea
                  name="orderReviewReason"
                  // no visible label, as designed: the placeholder says what it
                  // is and the accessible name says who reads it
                  aria-label={t("apps.orders.details.review_reason")}
                  placeholder={t(
                    "apps.orders.details.review_reason_placeholder",
                  )}
                  rows={4}
                  value={reason}
                  onChange={(event) => {
                    setReason(event.currentTarget.value)
                  }}
                />
              </Spacer>
            </div>
          }
          confirmLabel={t("apps.orders.actions.send_for_review_confirm")}
          onConfirm={() => {
            void send()
          }}
          onCancel={closeSend}
        />
      </PaymentActionModal>
      <DeclineDialog
        icon="warningCircle"
        title={t("apps.orders.actions.decline_agent_order_title")}
        description={t("apps.orders.details.decline_agent_order_description")}
        confirm={{
          label: t("apps.orders.actions.cancel"),
          variant: "danger",
          onClick: async () => {
            if (lastReview == null) {
              return
            }
            await sdkClient.order_reviews.update({
              id: lastReview.id,
              _reject: true,
            })
            // pending orders cannot be cancelled: archived, it leaves the carts
            await sdkClient.orders.update({ id: order.id, _archive: true })
            await mutateOrder()
          },
        }}
        cancelLabel={t("common.close")}
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

  return {
    lastReview,
    isAwaitingReview,
    isRejected,
    isAgentReview,
    canAnswerAgentReview,
    acceptAgentReview,
    actions,
    dialogs,
  }
}
