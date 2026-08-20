import {
  type ActionButtonsProps,
  type CurrencyCode,
  formatCentsToCurrency,
  getPaymentInstrumentDetails,
  orderTransactionIsAnAsyncCapture,
  useConfirmDialog,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { useMemo } from "react"
import { useOrderCaptureModal } from "#components/OrderPayment/hooks/useOrderCaptureModal"
import { usePaymentSessionRefundModal } from "#components/OrderPayment/hooks/usePaymentSessionRefundModal"
import {
  getCapturableAmountCents,
  getOrderPaymentTotals,
  getOrderRefundableCaptures,
  hasOrderPaymentInFlight,
  isNewPaymentModel,
} from "#components/OrderPayment/paymentSessionUtils"
import { useOrderDetails } from "#hooks/useOrderDetails"
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
  const { canUser } = useTokenProvider()

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
  const refundTargets = isNewPaymentModel(order)
    ? getOrderRefundableCaptures(order)
    : []
  // What the order holds beyond its own total, which is what this button is
  // there to give back. Non-zero once an order is edited down after capture.
  const toRefundCents = isNewPaymentModel(order)
    ? getOrderPaymentTotals(order).toRefundCents
    : 0
  const { modal: refundModal, open: openRefund } = usePaymentSessionRefundModal(
    {
      targets: refundTargets,
      // No preselection passed: the modal selects the first capture itself,
      // and the excess sizes the amount against whatever is selected.
      defaultAmountCents: toRefundCents,
      onChange: () => {
        void mutateOrder()
      },
    },
  )
  const {
    show: showSelectShippingMethodOverlay,
    Overlay: SelectShippingMethodOverlay,
  } = useSelectShippingMethodOverlay()

  // A partially paid or partially voided order still offers Capture, but the
  // rest of its authorization may already be gone (voided, or captured for
  // less than it held), which would open the modal on an empty form.
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
      disabled: isLoading || isEditingBlocked || !hasLineItems,
      onClick: () => {
        void dispatch("_stop_editing")
      },
    }

    return [cancelAction, hasInvalidShipments ? continueAction : finishAction]
  }, [
    isLoading,
    hasLineItems,
    order,
    showCancelDialog,
    showSelectShippingMethodOverlay,
    dispatch,
  ])

  /**
   * Over-captured orders get their own primary button, outside the status
   * dictionary: the trigger is an amount rather than a status triple, and it
   * has to appear on a `paid` order too, which is where an order edited down
   * after capture ends up.
   */
  const refundFooterActions: ActionButtonsProps["actions"] =
    // Approved only, like every other refund entry point: before that the
    // order is still moving (a `placed` one can be edited or cancelled), so
    // the excess it would refund is not final yet.
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
            onClick: () => {
              openRefund()
            },
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

  // The 2026-05 model has no `payment_source` to describe, so the instruments
  // come from the sessions this capture will actually act on.
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
      ...standardFooterActions,
      ...editingFooterActions,
      ...refundFooterActions,
    ],
    hasInvalidShipments,
    CaptureDialog: isNewPaymentModel(order)
      ? captureModal
      : LegacyCaptureDialog,
    RefundDialog: refundModal,
    CancelDialog,
    SelectShippingMethodOverlay,
    errors,
    dispatch,
  }
}
