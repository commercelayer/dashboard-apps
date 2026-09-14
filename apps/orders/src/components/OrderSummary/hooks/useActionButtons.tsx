import {
  type ActionButtonsProps,
  type CurrencyCode,
  formatCentsToCurrency,
  getPaymentInstrumentDetails,
  orderTransactionIsAnAsyncCapture,
  Text,
  useConfirmDialog,
  useCoreSdkProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { useMemo, useState } from "react"
import { usePaymentActionFlow } from "#components/OrderPayment/hooks/usePaymentActionFlow"
import {
  CAPTURE_COPY,
  joinPaymentDetail,
  PaymentActionConfirm,
  PaymentActionModal,
} from "#components/OrderPayment/PaymentActionModal"
import { getPaymentDisplay } from "#components/OrderPayment/paymentDisplay"
import {
  getCapturableAmountCents,
  getCapturableSessions,
  getInstrumentLabel,
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

  const { isLoading, errors, dispatch } = useTriggerAttribute(order.id)
  const { mutateOrder } = useOrderDetails(order.id)
  const { hasInvalidShipments, hasLineItems } = useOrderStatus(order)

  const { sdkClient } = useCoreSdkProvider()
  const { show: showCaptureDialog, ConfirmDialog: CaptureConfirmDialog } =
    useConfirmDialog()
  const [showNewPaymentCapture, setShowNewPaymentCapture] = useState(false)
  // Frozen when the capture starts: the sessions stop being capturable the
  // moment it succeeds, so the live list would empty out under the result step.
  const [capturedInstruments, setCapturedInstruments] = useState<string>()
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
                setShowNewPaymentCapture(true)
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

  // The 2026-05 model has no `payment_source` to describe, so the instruments
  // come from the sessions this capture will actually act on.
  const capturableSessions = getCapturableSessions(order)

  /**
   * Order-level capture on the 2026-05 model: `_capture` does not exist there,
   * so the one button becomes one capture per funding session, reported
   * through the same modal the payment rows use.
   */
  const captureFlow = usePaymentActionFlow({
    create: async () =>
      await Promise.all(
        capturableSessions.flatMap((session) => {
          const authorization = session.payment_authorization
          if (authorization == null) return []
          return [
            sdkClient.payment_captures.create({
              payment_session: { id: session.id, type: "payment_sessions" },
              payment_authorization: {
                id: authorization.id,
                type: "payment_authorizations",
              },
            }),
          ]
        }),
      ),
    retrieve: async (id) => await sdkClient.payment_captures.retrieve(id),
    onSettled: () => {
      void mutateOrder()
    },
    currencyCode: order.currency_code,
  })

  const closeNewPaymentCapture = (): void => {
    setShowNewPaymentCapture(false)
    setCapturedInstruments(undefined)
    captureFlow.reset()
  }

  /**
   * One line per session, with what will be taken from each. A comma-joined
   * list of instruments was unreadable as soon as an order had more than one
   * session, and useless when the same card funds several of them.
   */
  const captureLines = capturableSessions.map((session) => ({
    id: session.id,
    instrument: getInstrumentLabel(getPaymentDisplay(session)),
    amount: session.payment_authorization?.formatted_capture_balance,
  }))
  // Short form for the result step, where a breakdown would be noise.
  const instruments =
    captureLines.length === 1
      ? (captureLines[0]?.instrument ?? "")
      : `${captureLines.length} payments`
  const capturableAmount =
    order.currency_code == null
      ? undefined
      : formatCentsToCurrency(
          getCapturableAmountCents(order),
          order.currency_code as Uppercase<CurrencyCode>,
        )
  const NewPaymentCaptureDialog = (
    <PaymentActionModal
      show={showNewPaymentCapture}
      step={captureFlow.step}
      copy={CAPTURE_COPY}
      detail={joinPaymentDetail(
        captureFlow.amount ?? capturableAmount,
        capturedInstruments ?? instruments,
      )}
      errorDetail={captureFlow.errorDetail}
      onClose={closeNewPaymentCapture}
    >
      <PaymentActionConfirm
        icon="bank"
        title="Capture payment?"
        description={
          <div className="w-full">
            {captureLines.map((line) => (
              <Text
                key={line.id}
                tag="div"
                variant="info"
                size="small"
                className="flex justify-between gap-4"
              >
                <span>{line.instrument}</span>
                <span>{line.amount}</span>
              </Text>
            ))}
          </div>
        }
        confirmLabel={`${t("apps.orders.actions.capture")} ${capturableAmount ?? ""}`.trim()}
        onConfirm={() => {
          setCapturedInstruments(instruments)
          void captureFlow.run()
        }}
        onCancel={closeNewPaymentCapture}
      />
    </PaymentActionModal>
  )

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
    actions: [...standardFooterActions, ...editingFooterActions],
    hasInvalidShipments,
    CaptureDialog: isNewPaymentModel(order)
      ? NewPaymentCaptureDialog
      : LegacyCaptureDialog,
    CancelDialog,
    SelectShippingMethodOverlay,
    errors,
    dispatch,
  }
}
