import { makeOrder } from '#mocks'
import {
  Badge,
  formatDate,
  navigateTo,
  Td,
  Text,
  Tr,
  useTokenProvider,
  withSkeletonTemplate,
  type BadgeProps,
  type ResourceListItemTemplateProps
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import capitalize from 'lodash/capitalize'

export const ListItemSubscriptionOrder = withSkeletonTemplate<
  ResourceListItemTemplateProps<'orders'>
>(({ resource = makeOrder() }): JSX.Element | null => {
  const { user, settings, canAccess } = useTokenProvider()

  const orderDate = formatDate({
    isoDate: resource.updated_at ?? '',
    format: 'full',
    timezone: user?.timezone,
    showCurrentYear: true
  })

  const orderNumber = `#${resource?.number}`
  const navigateToOrder = canAccess('orders')
    ? navigateTo({
        destination: {
          app: 'orders',
          resourceId: resource?.id,
          mode: settings.mode
        }
      })
    : {}

  const paymentStatus = capitalize(
    resource?.payment_status.replace(/_|-/gm, ' ')
  )
  const paymentStatusVariant = getPaymentStatusVariant(resource?.payment_status)

  return (
    <Tr>
      <Td>
        <Text>{orderDate}</Text>
      </Td>
      <Td>
        {canAccess('orders') ? (
          <a {...navigateToOrder}>{`${orderNumber}`}</a>
        ) : (
          `${orderNumber}`
        )}
      </Td>
      <Td>
        <Badge variant={paymentStatusVariant}>{paymentStatus}</Badge>
      </Td>
    </Tr>
  )
})

const getPaymentStatusVariant = (
  status: Order['payment_status']
): BadgeProps['variant'] => {
  switch (status) {
    case 'paid':
      return 'success'
    case 'unpaid':
      return 'danger'
    default:
      return 'secondary'
  }
}
