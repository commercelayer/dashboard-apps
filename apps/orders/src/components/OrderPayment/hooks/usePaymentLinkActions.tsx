import {
  DropdownItem,
  toast,
  useConfirmDialog,
  useCoreSdkProvider,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { PaymentLink } from "@commercelayer/sdk"
import { usePaymentLinkDetailsModal } from "#components/OrderPayment/hooks/usePaymentLinkDetailsModal"

interface Props {
  link: PaymentLink
  onChange: () => void
}

interface PaymentLinkActionsHook {
  dropdownItems: React.JSX.Element[]
  dialogs: React.ReactNode
}

/** The `⋯` menu of a payment link row, and the dialogs its items open. */
export function usePaymentLinkActions({
  link,
  onChange,
}: Props): PaymentLinkActionsHook {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const { modal, open } = usePaymentLinkDetailsModal(link)
  const { show: showCancelDialog, ConfirmDialog } = useConfirmDialog()

  const isOpen = link.status === "open"

  /** Cancelling, not deleting, is what stops the gateway honouring the URL. */
  const canCancel = isOpen && canUser("update", "payment_links")

  const dropdownItems: React.JSX.Element[] = [
    <DropdownItem
      key="view-details"
      label="View details"
      icon="eye"
      onClick={open}
    />,
  ]

  // An expired URL leads nowhere, so copying needs an open link.
  if (isOpen) {
    dropdownItems.push(
      <DropdownItem
        key="copy-link"
        label="Copy link"
        icon="copy"
        onClick={() => {
          void navigator.clipboard.writeText(link.url).then(
            () => {
              toast("Payment link copied")
            },
            () => {
              // Denied permission or an insecure context; the URL is still in the details.
              toast("Could not copy the payment link", { type: "error" })
            },
          )
        }}
      />,
    )
  }

  if (canCancel) {
    dropdownItems.push(
      <DropdownItem
        key="cancel-link"
        label="Cancel link"
        icon="x"
        onClick={showCancelDialog}
      />,
    )
  }

  return {
    dropdownItems,
    dialogs: (
      <>
        {modal}
        <ConfirmDialog
          icon="warningCircle"
          title="Cancel payment link?"
          description="The link stops working straight away and the customer can no longer pay through it."
          confirm={{
            label: "Cancel link",
            variant: "danger",
            onClick: async () => {
              await sdkClient.payment_links.update({
                id: link.id,
                _cancel: true,
              })
              onChange()
            },
          }}
          cancelLabel="Close"
          errorMessage="Could not cancel the payment link."
          successMessage="Payment link cancelled."
        />
      </>
    ),
  }
}
