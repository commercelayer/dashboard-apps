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
      size="large"
      onClose={() => {
        onClose()
      }}
    >
      <Modal.Header>
        {coupon != null ? "Edit coupon" : "Single coupon"}
      </Modal.Header>
      {/* the form brings its own `Modal.Body` and `Modal.Footer`, so that the
          submit button in the footer is inside it */}
      <CouponForm
        promotionId={promotionId}
        couponId={coupon?.id}
        defaultValues={couponToFormValues(coupon)}
        onSuccess={() => {
          onClose(true)
        }}
        onCancel={() => {
          onClose()
        }}
      />
    </Modal>
  )
}
