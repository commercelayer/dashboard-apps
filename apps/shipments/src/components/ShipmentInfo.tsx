import {
  ListDetailsItem,
  Section,
  useAppLinking,
  useTokenProvider,
  useTranslation,
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
    const { t } = useTranslation()

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
        <ListDetailsItem
          label={t('apps.shipments.details.origin')}
          gutter='none'
        >
          {shipment.stock_location?.name}
        </ListDetailsItem>
        <ListDetailsItem label={t('resources.orders.name')} gutter='none'>
          {canAccess('orders') ? (
            <a {...navigateToOrder}>{`${shipmentOrderNumber}`}</a>
          ) : (
            `${shipmentOrderNumber}`
          )}
        </ListDetailsItem>
        <ListDetailsItem label={t('resources.customers.name')} gutter='none'>
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
