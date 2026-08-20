import {
  DropdownItem,
  useCoreSdkProvider,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { PaymentSession } from "@commercelayer/sdk"
import type { PaymentDisplay } from "dashboard-apps-common/src/helpers/paymentDisplay"
import { useState } from "react"
import { usePaymentActionFlow } from "#components/OrderPayment/hooks/usePaymentActionFlow"
import { usePaymentSessionRefundModal } from "#components/OrderPayment/hooks/usePaymentSessionRefundModal"
import {
  CAPTURE_COPY,
  joinPaymentDetail,
  PaymentActionConfirm,
  PaymentActionModal,
  PaymentBreakdown,
  VOID_COPY,
} from "#components/OrderPayment/PaymentActionModal"
import {
  canCapture,
  canVoid,
  getInstrumentLabel,
  getRefundableCaptures,
} from "#components/OrderPayment/paymentSessionUtils"

interface Props {
  session: PaymentSession
  display: PaymentDisplay
  onChange: () => void
  onViewDetails: () => void
}

export function usePaymentSessionActions({
  session,
  display,
  onChange,
  onViewDetails,
}: Props) {
  const { sdkClient } = useCoreSdkProvider()
  const { canUser } = useTokenProvider()

  const [showCapture, setShowCapture] = useState(false)
  const [showVoid, setShowVoid] = useState(false)

  // The row refunds only its own session's captures, oldest first, which is
  // the one the modal selects.
  const refundTargets = getRefundableCaptures(session).map((capture) => ({
    session,
    capture,
  }))
  const { modal: refundModal, open: openRefund } = usePaymentSessionRefundModal(
    {
      targets: refundTargets,
      onChange,
    },
  )

  const authorization = session.payment_authorization
  const instrument = getInstrumentLabel(display)
  // Amount and instrument, the line the success step shows.
  const captureAmount = authorization?.formatted_capture_balance ?? ""
  const sessionRel = { id: session.id, type: "payment_sessions" } as const
  const authorizationRel = {
    id: authorization?.id ?? "",
    type: "payment_authorizations",
  } as const

  const captureFlow = usePaymentActionFlow({
    create: async () =>
      await sdkClient.payment_captures.create({
        payment_session: sessionRel,
        payment_authorization: authorizationRel,
      }),
    retrieve: async (id) => await sdkClient.payment_captures.retrieve(id),
    onSettled: onChange,
  })

  const voidFlow = usePaymentActionFlow({
    create: async () =>
      await sdkClient.payment_voids.create({
        payment_session: sessionRel,
        payment_authorization: authorizationRel,
      }),
    retrieve: async (id) => await sdkClient.payment_voids.retrieve(id),
    onSettled: onChange,
  })

  const closeCapture = (): void => {
    setShowCapture(false)
    captureFlow.reset()
  }

  const closeVoid = (): void => {
    setShowVoid(false)
    voidFlow.reset()
  }

  const dropdownItems: React.JSX.Element[] = [
    <DropdownItem
      key="view-details"
      label="View details"
      icon="eye"
      onClick={onViewDetails}
    />,
  ]

  if (canCapture(session) && canUser("create", "payment_captures")) {
    dropdownItems.push(
      <DropdownItem
        key="capture"
        label="Capture"
        icon="check"
        onClick={() => {
          setShowCapture(true)
        }}
      />,
    )
  }

  if (refundTargets.length > 0 && canUser("create", "payment_refunds")) {
    dropdownItems.push(
      <DropdownItem
        key="refund"
        label="Refund"
        icon="arrowUDownLeft"
        onClick={openRefund}
      />,
    )
  }

  if (canVoid(session) && canUser("create", "payment_voids")) {
    dropdownItems.push(
      <DropdownItem
        key="void"
        label="Void authorization"
        icon="xCircle"
        onClick={() => {
          setShowVoid(true)
        }}
      />,
    )
  }

  const Dialogs = (
    <>
      <PaymentActionModal
        show={showCapture}
        step={captureFlow.step}
        copy={CAPTURE_COPY}
        detail={joinPaymentDetail(
          captureFlow.amount ?? captureAmount,
          instrument,
        )}
        errorDetail={captureFlow.errorDetail}
        onClose={closeCapture}
      >
        <PaymentActionConfirm
          icon="bank"
          title="Capture payment?"
          description={
            <PaymentBreakdown lines={[{ key: session.id, instrument }]} />
          }
          confirmLabel={`Capture ${captureAmount}`.trim()}
          onConfirm={() => {
            void captureFlow.run()
          }}
          onCancel={closeCapture}
        />
      </PaymentActionModal>

      <PaymentActionModal
        show={showVoid}
        step={voidFlow.step}
        copy={VOID_COPY}
        detail={joinPaymentDetail(
          voidFlow.amount ?? authorization?.formatted_void_balance,
          instrument,
        )}
        errorDetail={voidFlow.errorDetail}
        onClose={closeVoid}
      >
        <PaymentActionConfirm
          icon="warningCircle"
          title="Void authorization?"
          description={
            <PaymentBreakdown lines={[{ key: session.id, instrument }]} />
          }
          confirmLabel="Void authorization"
          confirmVariant="danger"
          onConfirm={() => {
            void voidFlow.run()
          }}
          onCancel={closeVoid}
        />
      </PaymentActionModal>

      {refundModal}
    </>
  )

  return { dropdownItems, Dialogs }
}
