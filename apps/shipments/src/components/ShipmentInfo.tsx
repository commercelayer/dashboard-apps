import {
  ListDetailsItem,
  Section,
  navigateTo,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Shipment } from '@commercelayer/sdk'

interface Props {
  shipment: Shipment
}

export const ShipmentInfo = withSkeletonTemplate<Props>(
  ({ shipment }): JSX.Element => {
    const {
      canAccess,
      settings: { mode }
    } = useTokenProvider()

    const shipmentOrderNumber = `#${shipment.order?.number}`
    const navigateToOrder = canAccess('orders')
      ? navigateTo({
          destination: {
            app: 'orders',
            resourceId: shipment?.order?.id,
            mode
          }
        })
      : {}

    const shipmentCustomerEmail = shipment?.order?.customer?.email
    const navigateToCustomer = canAccess('customers')
      ? navigateTo({
          destination: {
            app: 'customers',
            resourceId: shipment?.order?.customer?.id,
            mode
          }
        })
      : {}

    return (
      <Section title='Info'>
        <ListDetailsItem
          label='Shipping method'
          gutter='none'
          childrenAlign='right'
        >
          {shipment.shipping_method?.name}
        </ListDetailsItem>
        <ListDetailsItem label='Order' gutter='none' childrenAlign='right'>
          {canAccess('orders') ? (
            <a {...navigateToOrder}>{`${shipmentOrderNumber}`}</a>
          ) : (
            `${shipmentOrderNumber}`
          )}
        </ListDetailsItem>
        <ListDetailsItem label='Customer' gutter='none' childrenAlign='right'>
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
