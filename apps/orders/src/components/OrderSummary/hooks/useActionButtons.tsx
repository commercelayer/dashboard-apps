import {
  type ActionButtonsProps,
  type CurrencyCode,
  formatCentsToCurrency,
  getPaymentInstrumentDetails,
  orderTransactionIsAnAsyncCapture,
  parseApiError,
  useConfirmDialog,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { useMemo, useState } from "react"
import { useCreatePaymentLinkModal } from "#components/OrderPayment/hooks/useCreatePaymentLinkModal"
import { useOrderCaptureModal } from "#components/OrderPayment/hooks/useOrderCaptureModal"
import { usePaymentRefundModal } from "#components/OrderPayment/hooks/usePaymentRefundModal"
import {
  getCapturableAmountCents,
  getOrderPaymentTotals,
  getOrderRefundableCaptures,
  getRequestedAmountCents,
  getUnrequestedAmountCents,
  hasOrderPaymentInFlight,
  isNewPaymentModel,
} from "#components/OrderPayment/paymentSessionUtils"
import { useFinishAgreementOrderEdit } from "#hooks/useFinishAgreementOrderEdit"
import { useOrderDetails } from "#hooks/useOrderDetails"
import { useOrderPaymentLinks } from "#hooks/useOrderPaymentLinks"
import { useOrderPaymentRulesCheck } from "#hooks/useOrderPaymentRulesCheck"
import { useOrderReview } from "#hooks/useOrderReview"
import { usePlaceAgreementOrder } from "#hooks/usePlaceAgreementOrder"
import { useTriggerAttribute } from "#hooks/useTriggerAttribute"
import { hasPaymentMethod } from "#utils/order"
import {
  getTriggerAttributeName,
  getTriggerAttributes,
} from "../orderDictionary"
import { useOrderStatus } from "./useOrderStatus"
import { useSelectShippingMethodOverlay } from "./useSelectShippingMethodOverlay"

export const useActionButtons = ({ order }: { order: Order }) => {
  const triggerAttributes = getTriggerAttributes(order)
  const { t } = useTranslation()
  const {
    canUser,
    settings: { extras },
  } = useTokenProvider()

  const { isLoading, errors, dispatch } = useTriggerAttribute(order.id)
  const { mutateOrder } = useOrderDetails(order.id)
  const { hasInvalidShipments, hasLineItems, diffTotalAndPlacedTotal } =
    useOrderStatus(order)
  // Set only while the edit cannot be finished, which is a legacy-only case.
  const isEditingBlocked = diffTotalAndPlacedTotal != null

  const { show: showCaptureDialog, ConfirmDialog: CaptureConfirmDialog } =
    useConfirmDialog()
  const { modal: captureModal, open: openCapture } = useOrderCaptureModal({
    order,
    onChange: () => {
      void mutateOrder()
    },
  })
  const { show: showCancelDialog, ConfirmDialog: CancelConfirmDialog } =
    useConfirmDialog()

  /** Payment rules that block the edit: the footer asks for a payment instead of Finish. */
  const { isBlockedByPaymentRules, isCheckingPaymentRules } =
    useOrderPaymentRulesCheck(order)
  const { paymentLinks, mutatePaymentLinks } = useOrderPaymentLinks(order)
  /** Open links cover what is missing, so the footer waits instead of asking again. */
  const isPaymentFullyRequested =
    getUnrequestedAmountCents(order, paymentLinks) === 0
  const { modal: paymentLinkModal, open: openPaymentLink } =
    useCreatePaymentLinkModal({
      order,
      requestedCents: getRequestedAmountCents(paymentLinks),
      onChange: () => {
        void mutateOrder()
        mutatePaymentLinks()
      },
    })
  const refundTargets = isNewPaymentModel(order)
    ? getOrderRefundableCaptures(order)
    : []
  /** What the order holds beyond its total. */
  const toRefundCents = isNewPaymentModel(order)
    ? getOrderPaymentTotals(order).toRefundCents
    : 0
  const { modal: refundModal, open: openRefund } = usePaymentRefundModal({
    orderId: order.id,
    targets: refundTargets,
    defaultAmountCents: toRefundCents,
    onChange: () => {
      void mutateOrder()
    },
  })
  const {
    show: showSelectShippingMethodOverlay,
    Overlay: SelectShippingMethodOverlay,
  } = useSelectShippingMethodOverlay()

  // B2B: a pending or rejected customer review blocks approval, which Core
  // refuses anyway — the footer says why instead of offering a button that fails
  const {
    isAwaitingReview,
    isRejected,
    isAgentReview,
    canAnswerAgentReview,
    acceptAgentReview,
    actions: reviewActions,
    dialogs: ReviewDialogs,
  } = useOrderReview(order)
  const isApprovalBlockedByReview = isAwaitingReview || isRejected

  // B2B: an order the seller builds for a buyer under an agreement has no
  // checkout — it is placed from here, payment set up on the agreement's terms,
  // unless the seller sends it to the buyer to confirm first
  const isPendingAgreementOrder =
    extras?.organization?.isAgreementsEnabled === true &&
    order.agreement != null &&
    order.status === "pending"
  const {
    place: placeAgreementOrder,
    isPlacing: isPlacingAgreementOrder,
    error: placeAgreementOrderError,
  } = usePlaceAgreementOrder(order)
  const [isAcceptingAgentReview, setIsAcceptingAgentReview] = useState(false)
  const [acceptAgentReviewError, setAcceptAgentReviewError] = useState<
    string | null
  >(null)
  // B2B: an order an email-to-order agent held is the seller's to accept, which
  // takes it off hold and places it in one step. Approving it comes after, as
  // for any placed order
  const acceptAgentOrder = async (): Promise<void> => {
    setIsAcceptingAgentReview(true)
    setAcceptAgentReviewError(null)
    try {
      await acceptAgentReview()
    } catch (error) {
      setAcceptAgentReviewError(
        parseApiError(error)[0]?.detail ??
          t("apps.orders.details.accept_agent_order_failed"),
      )
      await mutateOrder()
      return
    } finally {
      setIsAcceptingAgentReview(false)
    }
    await placeAgreementOrder()
  }
  const agreementPlaceActions: ActionButtonsProps["actions"] =
    isPendingAgreementOrder && canUser("update", "orders")
      ? [
          isAgentReview
            ? {
                label: t("apps.orders.actions.accept_order"),
                variant: "primary",
                disabled:
                  !canAnswerAgentReview ||
                  isAcceptingAgentReview ||
                  isPlacingAgreementOrder ||
                  !hasLineItems,
                onClick: () => {
                  void acceptAgentOrder()
                },
              }
            : isApprovalBlockedByReview
              ? {
                  label: isAwaitingReview
                    ? t("apps.orders.tasks.awaiting_customer_review")
                    : t("apps.orders.tasks.rejected_by_customer"),
                  variant: "primary",
                  disabled: true,
                  onClick: () => {},
                }
              : {
                  label: t("apps.orders.actions.place"),
                  variant: "primary",
                  disabled: isPlacingAgreementOrder || !hasLineItems,
                  onClick: () => {
                    void placeAgreementOrder()
                  },
                },
        ]
      : []

  // B2B: an agreement order is finished by authorizing whatever the edit added
  // on top of what was placed, see `useFinishAgreementOrderEdit`
  const isEditingAgreementOrder =
    order.agreement != null && order.status === "editing"
  const {
    finish: finishAgreementOrderEdit,
    isFinishing: isFinishingAgreementOrderEdit,
    error: finishAgreementOrderEditError,
  } = useFinishAgreementOrderEdit(order)

  /** A partial order whose remaining authorization is already gone. */
  const hasNothingToCapture =
    isNewPaymentModel(order) && getCapturableAmountCents(order) === 0

  const standardFooterActions: ActionButtonsProps["actions"] = useMemo(() => {
    return triggerAttributes
      .filter(
        (
          triggerAttribute,
        ): triggerAttribute is Exclude<
          typeof triggerAttribute,
          "_archive" | "_unarchive" | "_refund"
        > => !["_archive", "_unarchive", "_refund"].includes(triggerAttribute),
      )
      .filter(
        (triggerAttribute) =>
          !(triggerAttribute === "_capture" && hasNothingToCapture),
      )
      .map((triggerAttribute) => {
        if (triggerAttribute === "_approve" && isApprovalBlockedByReview) {
          return {
            label: isAwaitingReview
              ? t("apps.orders.tasks.awaiting_customer_review")
              : t("apps.orders.tasks.rejected_by_customer"),
            variant: "primary",
            disabled: true,
            onClick: () => {},
          }
        }
        if (
          triggerAttribute === "_capture" &&
          ((order?.transactions ?? []).some(orderTransactionIsAnAsyncCapture) ||
            hasOrderPaymentInFlight(order))
        ) {
          // Capture has already been triggered and is waiting for success
          return {
            label: t("apps.orders.details.waiting_for_successful_capture"),
            variant: "primary",
            disabled: true,
            onClick: () => {},
          }
        }
        return {
          label: getTriggerAttributeName(triggerAttribute),
          variant:
            triggerAttribute === "_cancel" ||
            triggerAttribute === "__cancel_transactions"
              ? "secondary"
              : "primary",
          disabled: isLoading,
          onClick: () => {
            if (triggerAttribute === "_capture") {
              if (isNewPaymentModel(order)) {
                openCapture()
              } else {
                showCaptureDialog()
              }
              return
            }
            if (triggerAttribute === "_cancel") {
              showCancelDialog()
              return
            }

            void dispatch(triggerAttribute)
          },
        }
      })
  }, [
    dispatch,
    hasNothingToCapture,
    isApprovalBlockedByReview,
    isAwaitingReview,
    isLoading,
    showCancelDialog,
    showCaptureDialog,
    triggerAttributes,
  ])

  const editingFooterActions: ActionButtonsProps["actions"] = useMemo(() => {
    if (order.status !== "editing") {
      return []
    }

    const cancelAction: ActionButtonsProps["actions"][number] = {
      label: getTriggerAttributeName("_cancel"),
      variant: "secondary",
      disabled: isLoading,
      onClick: () => {
        showCancelDialog()
      },
    }

    const continueAction: ActionButtonsProps["actions"][number] = {
      label: t("apps.orders.actions.continue_editing"),
      disabled: isLoading || !hasLineItems,
      onClick: () => {
        showSelectShippingMethodOverlay()
      },
    }

    const finishAction: ActionButtonsProps["actions"][number] = {
      label: t("apps.orders.actions.finish_editing"),
      disabled:
        isLoading ||
        isFinishingAgreementOrderEdit ||
        isEditingBlocked ||
        !hasLineItems ||
        // Not offered until the payment rules have answered: it may yet turn
        // into Request payment.
        isCheckingPaymentRules,
      onClick: () => {
        if (isEditingAgreementOrder) {
          void finishAgreementOrderEdit()
          return
        }
        void dispatch("_stop_editing")
      },
    }

    const requestPaymentAction: ActionButtonsProps["actions"][number] = {
      label: "Request payment",
      disabled: isLoading,
      onClick: openPaymentLink,
    }

    const waitingForPaymentAction: ActionButtonsProps["actions"][number] = {
      label: "Waiting for payment",
      disabled: true,
      onClick: () => {},
    }

    if (hasInvalidShipments) {
      return [cancelAction, continueAction]
    }

    if (isBlockedByPaymentRules) {
      return [
        cancelAction,
        isPaymentFullyRequested
          ? waitingForPaymentAction
          : requestPaymentAction,
      ]
    }

    return [cancelAction, finishAction]
  }, [
    isLoading,
    hasLineItems,
    order,
    showCancelDialog,
    showSelectShippingMethodOverlay,
    dispatch,
    isBlockedByPaymentRules,
    isCheckingPaymentRules,
    isPaymentFullyRequested,
    openPaymentLink,
    isEditingAgreementOrder,
    isFinishingAgreementOrderEdit,
    finishAgreementOrderEdit,
  ])

  /** "Refund X" on approved orders that hold more than their total. */
  const refundFooterActions: ActionButtonsProps["actions"] =
    order.status === "approved" &&
    toRefundCents > 0 &&
    refundTargets.length > 0 &&
    canUser("create", "payment_refunds")
      ? [
          {
            label: `${t("apps.orders.actions.refund")} ${formatCentsToCurrency(
              toRefundCents,
              order.currency_code as Uppercase<CurrencyCode>,
            )}`,
            variant: "primary",
            disabled: isLoading,
            onClick: openRefund,
          },
        ]
      : []

  const CancelDialog = (
    <CancelConfirmDialog
      icon="warningCircle"
      title="Cancel order?"
      description="This will cancel the order and void any payment authorizations."
      confirm={{
        label: "Cancel order",
        variant: "danger",
        onClick: async () => {
          await dispatch("_cancel")
        },
      }}
      cancelLabel="Close"
      errorMessage="Could not cancel this order."
      successMessage="Order cancelled successfully."
    />
  )
  const {
    paymentMethodName,
    cardExpiry,
    issuerType,
    cardType,
    cardLastDigits,
  } = hasPaymentMethod(order) ? getPaymentInstrumentDetails(order) : {}

  const LegacyCaptureDialog = (
    <CaptureConfirmDialog
      icon="bank"
      title="Capture payment?"
      description={
        hasPaymentMethod(order) ? (
          <div>
            <p>
              {cardType ?? issuerType} {cardLastDigits}{" "}
              {cardExpiry != null ? `expires ${cardExpiry}` : ""}
            </p>
            <p>{paymentMethodName}</p>
          </div>
        ) : undefined
      }
      confirm={{
        label: `${t("apps.orders.actions.capture")} ${order.formatted_total_amount_with_taxes}`,
        onClick: async () => {
          await dispatch("_capture")
        },
      }}
    />
  )

  return {
    actions: [
      ...reviewActions,
      ...agreementPlaceActions,
      // a pending agreement order is placed by the action above, never through
      // the checkout's own "Place" — which would skip setting up the payment
      ...(isPendingAgreementOrder ? [] : standardFooterActions),
      ...editingFooterActions,
      ...refundFooterActions,
    ],
    hasInvalidShipments,
    CaptureDialog: isNewPaymentModel(order)
      ? captureModal
      : LegacyCaptureDialog,
    RefundDialog: refundModal,
    PaymentLinkDialog: paymentLinkModal,
    CancelDialog,
    ReviewDialogs,
    SelectShippingMethodOverlay,
    errors: [
      ...(errors ?? []),
      ...(acceptAgentReviewError != null ? [acceptAgentReviewError] : []),
      ...(placeAgreementOrderError != null ? [placeAgreementOrderError] : []),
      ...(finishAgreementOrderEditError != null
        ? [finishAgreementOrderEditError]
        : []),
    ],
    dispatch,
  }
}
