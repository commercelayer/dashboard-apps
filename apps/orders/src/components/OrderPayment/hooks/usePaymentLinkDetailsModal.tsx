import { useResourceDetailsModal } from "@commercelayer/app-elements"
import type { PaymentLink } from "@commercelayer/sdk"

/** A payment link's details, in a modal. */
export function usePaymentLinkDetailsModal(link: PaymentLink) {
  return useResourceDetailsModal({
    title: "Payment link details",
    resource: link,
  })
}
