import {
  RemoveButton,
  useConfirmDialog,
  useCoreSdkProvider,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { useState } from "react"

export const DeleteCouponButton = withSkeletonTemplate<{
  order: Order
  onChange: () => void
}>(({ order, onChange }) => {
  const { sdkClient } = useCoreSdkProvider()
  const [isDeleting, setIsDeleting] = useState(false)
  const { show: showDeleteDialog, ConfirmDialog } = useConfirmDialog()

  return (
    <>
      <RemoveButton
        disabled={isDeleting}
        onClick={() => {
          showDeleteDialog()
        }}
      />
      <ConfirmDialog
        icon="trash"
        title={`Remove coupon ${order.coupon_code ?? ""}`}
        description="This action cannot be undone."
        confirm={{
          label: "Remove coupon",
          variant: "danger",
          onClick: async () => {
            setIsDeleting(true)
            await sdkClient.orders
              .update({
                id: order.id,
                coupon_code: null,
              })
              .finally(() => {
                setIsDeleting(false)
                onChange?.()
              })
          },
        }}
      />
    </>
  )
})
