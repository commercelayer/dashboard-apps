import { type Attachment } from '@commercelayer/sdk'
import isEmpty from 'lodash/isEmpty'
import type { SetNonNullable, SetRequired } from 'type-fest'

export const referenceOrigins = {
  appOrdersNote: 'app-orders--note',
  appOrdersRefundNote: 'app-orders--refund-note',
  appShipmentsNote: 'app-shipments--note',
  appStockTransfersNote: 'app-stock-transfers--note'
} as const

type ReferenceOrigin = (typeof referenceOrigins)[keyof typeof referenceOrigins]

export function isAttachmentValidNote(
  attachment: Attachment,
  validReferenceOrigins: ReferenceOrigin[]
): attachment is SetNonNullable<
  SetRequired<Attachment, 'description' | 'reference_origin'>,
  'description' | 'reference_origin'
> {
  if (
    attachment.reference_origin == null ||
    isEmpty(attachment.reference_origin)
  ) {
    return false
  }

  return (
    validReferenceOrigins.includes(
      attachment.reference_origin as ReferenceOrigin
    ) && attachment.description != null
  )
}
