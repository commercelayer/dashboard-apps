import {
  DropdownItem,
  toast,
  useConfirmDialog,
  useCoreSdkProvider,
  useResourceDetailsModal,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { Resource } from "@commercelayer/sdk"
import type { PaymentLinkWithAmount } from "#components/OrderPayment/paymentSessionUtils"

interface Props {
  link: PaymentLinkWithAmount
  onChange: () => void
}

/**
 * Row menu for a payment link, mirroring the one a payment session carries:
 * the details a support person may need, and the URL itself, which is the one
 * thing a link is for.
 */
export function usePaymentLinkActions({ link, onChange }: Props): {
  dropdownItems: React.JSX.Element[]
  overlay: React.ReactNode
} {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const { modal, open } = useResourceDetailsModal({
    title: "Payment link details",
    // Already loaded with the list, so nothing is refetched here.
    resource: link as Resource,
  })
  const { show: showCancelDialog, ConfirmDialog } = useConfirmDialog()

  /**
   * Only an open link can be withdrawn, and cancelling is an update rather
   * than a delete on purpose: it is what tells the gateway to stop honouring
   * the URL. Deleting the record would leave a live link behind.
   */
  const canCancel = link.status === "open" && canUser("update", "payment_links")

  const dropdownItems: React.JSX.Element[] = [
    <DropdownItem
      key="view-details"
      label="View details"
      icon="eye"
      onClick={open}
    />,
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
            // Denied permission or an insecure context: the URL is still on
            // the details modal, so this is a nuisance rather than a dead end.
            toast("Could not copy the payment link", { type: "error" })
          },
        )
      }}
    />,
  ]

  if (canCancel) {
    dropdownItems.push(
      <DropdownItem
        key="cancel-link"
        label="Cancel link"
        icon="x"
        onClick={() => {
          showCancelDialog()
        }}
      />,
    )
  }

  return {
    dropdownItems,
    overlay: (
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
