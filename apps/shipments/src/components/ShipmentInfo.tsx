import {
  ListDetailsItem,
  Section,
  useAppLinking,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Shipment } from '@commercelayer/sdk'

interface Props {
  shipment: Shipment
}

export const ShipmentInfo = withSkeletonTemplate<Props>(
  ({ shipment }): JSX.Element => {
    const { canAccess } = useTokenProvider()
    const { navigateTo } = useAppLinking()

    const shipmentOrderNumber = `#${shipment.order?.number}`
    const navigateToOrder = canAccess('orders')
      ? navigateTo({
          app: 'orders',
          resourceId: shipment.order?.id
        })
      : {}

    const shipmentCustomerEmail = shipment?.order?.customer?.email
    const navigateToCustomer = canAccess('customers')
      ? navigateTo({
          app: 'customers',
          resourceId: shipment?.order?.customer?.id
        })
      : {}

    return (
      <Section title='Info'>
        <ListDetailsItem label='Shipping method' gutter='none'>
          {shipment.shipping_method?.name}
        </ListDetailsItem>
        <ListDetailsItem label='Order' gutter='none'>
          {canAccess('orders') ? (
            <a {...navigateToOrder}>{`${shipmentOrderNumber}`}</a>
          ) : (
            `${shipmentOrderNumber}`
          )}
        </ListDetailsItem>
        <ListDetailsItem label='Customer' gutter='none'>
          {canAccess('customers') ? (
            <a {...navigateToCustomer}>{shipmentCustomerEmail}</a>
          ) : (
            shipmentCustomerEmail
          )}
        </ListDetailsItem>
      </Section>
    )
  }
)
