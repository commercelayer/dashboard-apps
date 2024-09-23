import type { BadgeProps } from '@commercelayer/app-elements'
import {
  Badge,
  Spacer,
  Stack,
  Text,
  getOrderFulfillmentStatusName,
  getOrderPaymentStatusName,
  getOrderStatusName,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'

interface Props {
  order: Order
}

function getOrderStatusBadgeVariant(
  status: Order['status']
): BadgeProps['variant'] {
  switch (status) {
    case 'approved':
      return 'success-solid'
    case 'cancelled':
    case 'draft':
    case 'pending':
      return 'secondary'
    case 'placed':
    case 'placing':
    case 'editing':
      return 'warning-solid'
  }
}

function getPaymentStatusBadgeVariant(
  status: Order['payment_status']
): BadgeProps['variant'] {
  switch (status) {
    case 'paid':
    case 'free':
      return 'success-solid'
    case 'unpaid':
    case 'partially_paid':
    case 'refunded':
    case 'voided':
    case 'partially_refunded':
    case 'partially_voided':
      return 'secondary'
    case 'authorized':
    case 'partially_authorized':
      return 'warning-solid'
  }
}

function getFulfillmentStatusBadgeVariant(
  status: Order['fulfillment_status']
): BadgeProps['variant'] {
  switch (status) {
    case 'fulfilled':
      return 'success-solid'
    case 'unfulfilled':
    case 'not_required':
      return 'secondary'
    case 'in_progress':
      return 'warning-solid'
  }
}

export const OrderSteps = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element => {
    return (
      <Stack>
        <div>
          <Spacer bottom='2'>
            <Text size='small' tag='div' variant='info' weight='semibold'>
              Order
            </Text>
          </Spacer>
          {order.status !== undefined && (
            <Badge variant={getOrderStatusBadgeVariant(order.status)}>
              {getOrderStatusName(order.status).toUpperCase()}
            </Badge>
          )}
        </div>
        <div>
          <Spacer bottom='2'>
            <Text size='small' tag='div' variant='info' weight='semibold'>
              Payment
            </Text>
          </Spacer>
          {order.payment_status !== undefined && (
            <Badge variant={getPaymentStatusBadgeVariant(order.payment_status)}>
              {getOrderPaymentStatusName(order.payment_status).toUpperCase()}
            </Badge>
          )}
        </div>

        <div>
          <Spacer bottom='2'>
            <Text size='small' tag='div' variant='info' weight='semibold'>
              Fulfillment
            </Text>
          </Spacer>
          {order.fulfillment_status !== undefined && (
            <Badge
              variant={getFulfillmentStatusBadgeVariant(
                order.fulfillment_status
              )}
            >
              {getOrderFulfillmentStatusName(
                order.fulfillment_status
              ).toUpperCase()}
            </Badge>
          )}
        </div>
      </Stack>
    )
  }
)
