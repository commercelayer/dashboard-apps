import type { Attachment } from "@commercelayer/sdk"
import isEmpty from "lodash-es/isEmpty"
import type { SetNonNullable, SetRequired } from "type-fest"

export const noteReferenceOrigin = "app-orders--note"
export const refundNoteReferenceOrigin = "app-orders--refund-note"
/**
 * Note attached to a `payment_refund` (API version 2026-05+), as opposed to
 * `refundNoteReferenceOrigin`, which legacy attaches to the order itself.
 */
export const paymentRefundNoteReferenceOrigin =
  "app-orders--payment-refund-note"

export function isAttachmentValidNote(
  attachment: Attachment,
): attachment is SetNonNullable<
  SetRequired<Attachment, "description" | "reference_origin">,
  "description" | "reference_origin"
> {
  if (
    attachment.reference_origin == null ||
    isEmpty(attachment.reference_origin)
  ) {
    return false
  }

  const validReferenceOrigins: string[] = [
    noteReferenceOrigin,
    refundNoteReferenceOrigin,
    paymentRefundNoteReferenceOrigin,
  ]
  return (
    validReferenceOrigins.includes(attachment.reference_origin) &&
    attachment.description != null
  )
}
