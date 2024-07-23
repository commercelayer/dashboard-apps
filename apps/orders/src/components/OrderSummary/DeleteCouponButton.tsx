import {
  RemoveButton,
  useCoreSdkProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { useState } from 'react'

export const DeleteCouponButton = withSkeletonTemplate<{
  order: Order
  onChange: () => void
}>(({ order, onChange }) => {
  const { sdkClient } = useCoreSdkProvider()
  const [isDeleting, setIsDeleting] = useState(false)
  return (
    <RemoveButton
      disabled={isDeleting}
      onClick={() => {
        setIsDeleting(true)
        void sdkClient.orders
          .update({
            id: order.id,
            coupon_code: null
          })
          .finally(() => {
            setIsDeleting(false)
            onChange?.()
          })
      }}
    />
  )
})
