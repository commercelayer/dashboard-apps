import { useOrderDetails } from '#hooks/useOrderDetails'
import {
  Alert,
  Button,
  Spacer,
  type ResourceLineItemsProps
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'
import { DeleteCouponButton } from '../DeleteCouponButton'
import { SummaryRows } from '../SummaryRows'
import { renderTotalRow } from '../utils'
import { useAddCouponOverlay } from './useAddCouponOverlay'
import { useOrderStatus } from './useOrderStatus'

export function useSummaryRows(order: Order): {
  summaryRows: ResourceLineItemsProps['footer']
} {
  const { mutateOrder } = useOrderDetails(order.id)
  const { isEditing, diffTotalAndPlacedTotal } = useOrderStatus(order)

  const { Overlay: AddCouponOverlay, open: openAddCouponOverlay } =
    useAddCouponOverlay(order, () => {
      void mutateOrder()
    })

  const summaryRows: ResourceLineItemsProps['footer'] = []

  if (isEditing || order.coupon_code != null) {
    summaryRows.push({
      key: 'coupon',
      element: (
        <Spacer top='4' bottom='4'>
          <AddCouponOverlay />
          {renderTotalRow({
            label: 'Coupon',
            value:
              order.coupon_code == null ? (
                <Button
                  variant='link'
                  onClick={() => {
                    openAddCouponOverlay()
                  }}
                >
                  Add coupon
                </Button>
              ) : (
                <div className='flex gap-3'>
                  {order.coupon_code}
                  {isEditing && (
                    <DeleteCouponButton
                      order={order}
                      onChange={() => {
                        void mutateOrder()
                      }}
                    />
                  )}
                </div>
              )
          })}
        </Spacer>
      )
    })
  }

  summaryRows.push({
    key: 'summary',
    element: (
      <>
        <SummaryRows order={order} editable={isEditing} />
        {diffTotalAndPlacedTotal != null && (
          <Spacer bottom='8'>
            <Alert status='warning'>
              The new total is {order.formatted_total_amount_with_taxes},{' '}
              {diffTotalAndPlacedTotal} more than the original total.
              <br />
              Adjust the total to make it equal or less.
            </Alert>
          </Spacer>
        )}
      </>
    )
  })

  return {
    summaryRows
  }
}
