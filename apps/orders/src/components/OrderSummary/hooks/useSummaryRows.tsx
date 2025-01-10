import { useOrderDetails } from '#hooks/useOrderDetails'
import {
  Alert,
  Button,
  Spacer,
  useTranslation,
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
  const { t } = useTranslation()

  const { Overlay: AddCouponOverlay, open: openAddCouponOverlay } =
    useAddCouponOverlay(order, () => {
      void mutateOrder()
    })

  const summaryRows: ResourceLineItemsProps['footer'] = []

  if (isEditing || order.coupon_code != null) {
    summaryRows.push({
      key: 'coupon',
      element: (
        <>
          <AddCouponOverlay />
          {renderTotalRow({
            label: t('resources.coupons.name'),
            value:
              order.coupon_code == null ? (
                <Button
                  variant='link'
                  onClick={() => {
                    openAddCouponOverlay()
                  }}
                >
                  {t('common.add_resource', {
                    resource: t('resources.coupons.name').toLowerCase()
                  })}
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
        </>
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
              {t('apps.orders.details.new_total_line1', {
                total: order.formatted_total_amount_with_taxes,
                difference: diffTotalAndPlacedTotal
              })}
              <br />
              {t('apps.orders.details.new_total_line2')}
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
