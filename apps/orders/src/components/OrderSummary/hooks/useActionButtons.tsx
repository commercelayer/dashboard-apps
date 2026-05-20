import {
  type ActionButtonsProps,
  getPaymentInstrumentDetails,
  orderTransactionIsAnAsyncCapture,
  useConfirmDialog,
  useTranslation,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { useMemo } from "react"
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

  const { isLoading, errors, dispatch } = useTriggerAttribute(order.id)
  const { hasInvalidShipments, hasLineItems } = useOrderStatus(order)

  const { show: showCaptureDialog, ConfirmDialog: CaptureConfirmDialog } =
    useConfirmDialog()
  const { show: showCancelDialog, ConfirmDialog: CancelConfirmDialog } =
    useConfirmDialog()
  const {
    show: showSelectShippingMethodOverlay,
    Overlay: SelectShippingMethodOverlay,
  } = useSelectShippingMethodOverlay()

  const diffTotalAndPlacedTotal =
    (order.total_amount_with_taxes_cents ?? 0) -
    (order.place_total_amount_cents ?? 0)

  const isOriginalOrderAmountExceeded =
    order.status === "editing" && diffTotalAndPlacedTotal > 0

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
      .map((triggerAttribute) => {
        if (
          triggerAttribute === "_capture" &&
          (order?.transactions ?? []).some(orderTransactionIsAnAsyncCapture)
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
              showCaptureDialog()
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
      disabled: isLoading || isOriginalOrderAmountExceeded || !hasLineItems,
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
  const CaptureDialog = (
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
    actions: [...standardFooterActions, ...editingFooterActions],
    hasInvalidShipments,
    CaptureDialog,
    CancelDialog,
    SelectShippingMethodOverlay,
    errors,
    dispatch,
  }
}
