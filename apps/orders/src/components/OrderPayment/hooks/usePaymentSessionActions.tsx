import {
  DropdownItem,
  useConfirmDialog,
  useCoreSdkProvider,
} from "@commercelayer/app-elements"
import type { PaymentSession } from "@commercelayer/sdk"
import { canCaptureOrVoid } from "#components/OrderPayment/paymentSessionUtils"

interface Props {
  session: PaymentSession
  onChange: () => void
  onViewDetails: () => void
}

export function usePaymentSessionActions({
  session,
  onChange,
  onViewDetails,
}: Props) {
  const { sdkClient } = useCoreSdkProvider()
  const { show: showCaptureDialog, ConfirmDialog: CaptureConfirmDialog } =
    useConfirmDialog()
  const { show: showVoidDialog, ConfirmDialog: VoidConfirmDialog } =
    useConfirmDialog()

  const dropdownItems: React.JSX.Element[] = [
    <DropdownItem
      key="view-details"
      label="View details"
      icon="eye"
      onClick={onViewDetails}
    />,
  ]

  if (canCaptureOrVoid(session)) {
    dropdownItems.push(
      <DropdownItem
        key="capture"
        label="Capture"
        icon="check"
        onClick={showCaptureDialog}
      />,
      <DropdownItem
        key="void"
        label="Void authorization"
        icon="xCircle"
        onClick={showVoidDialog}
      />,
    )
  }

  const Dialogs = (
    <>
      <CaptureConfirmDialog
        icon="bank"
        title="Capture payment?"
        description={`This will capture ${session.formatted_amount ?? "the authorized amount"}.`}
        confirm={{
          label: "Capture",
          onClick: async () => {
            if (session.payment_authorization == null) return
            await sdkClient.payment_captures.create({
              payment_session: { id: session.id, type: "payment_sessions" },
              payment_authorization: {
                id: session.payment_authorization.id,
                type: "payment_authorizations",
              },
            })
            onChange()
          },
        }}
        errorMessage="Could not capture this payment."
        successMessage="Payment captured successfully."
      />
      <VoidConfirmDialog
        icon="warningCircle"
        title="Void authorization?"
        description="This will void the payment authorization and release the funds."
        confirm={{
          label: "Void authorization",
          variant: "danger",
          onClick: async () => {
            if (session.payment_authorization == null) return
            await sdkClient.payment_voids.create({
              payment_session: { id: session.id, type: "payment_sessions" },
              payment_authorization: {
                id: session.payment_authorization.id,
                type: "payment_authorizations",
              },
            })
            onChange()
          },
        }}
        errorMessage="Could not void this payment authorization."
        successMessage="Payment authorization voided successfully."
      />
    </>
  )

  return { dropdownItems, Dialogs }
}
