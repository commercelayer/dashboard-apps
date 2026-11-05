import { Modal } from "@commercelayer/app-elements"
import type { Coupon } from "@commercelayer/sdk"
import type { FC } from "react"
import { CouponForm } from "#components/CouponForm"
import { couponToFormValues } from "#data/formConverters/coupon"

interface CouponFormModalProps {
  promotionId: string
  /** The coupon to edit. Without it, the modal creates a new one. */
  coupon?: Coupon
  onClose: (shouldReloadList?: boolean) => void
}

export const CouponFormModal: FC<CouponFormModalProps> = ({
  promotionId,
  coupon,
  onClose,
}) => {
  return (
    <Modal
      show
      onClose={() => {
        onClose()
      }}
    >
      <Modal.Header>
        {coupon != null ? "Edit coupon" : "New coupon"}
      </Modal.Header>
      <Modal.Body>
        <CouponForm
          promotionId={promotionId}
          couponId={coupon?.id}
          defaultValues={couponToFormValues(coupon)}
          onSuccess={() => {
            onClose(true)
          }}
        />
      </Modal.Body>
    </Modal>
  )
}
