import {
  Button,
  ListDetailsItem,
  Section,
  Text,
  useAppLinking,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { StockTransfer } from '@commercelayer/sdk'

interface Props {
  stockTransfer: StockTransfer
}

export const StockTransferInfo = withSkeletonTemplate<Props>(
  ({ stockTransfer }): JSX.Element => {
    const { canAccess } = useTokenProvider()
    const { navigateTo } = useAppLinking()

    const orderNumber = `#${stockTransfer?.shipment?.order?.number}`
    const navigateToOrder = canAccess('orders')
      ? navigateTo({
          app: 'orders',
          resourceId: stockTransfer?.shipment?.order?.id
        })
      : {}

    const shipmentNumber = `#${stockTransfer?.shipment?.number}`
    const navigateToShipment = canAccess('shipments')
      ? navigateTo({
          app: 'shipments',
          resourceId: stockTransfer?.shipment?.id
        })
      : {}

    if (orderNumber === '#' && shipmentNumber === '#') return <></>

    return (
      <Section title='Info'>
        {orderNumber !== '#' && (
          <ListDetailsItem label='Order' gutter='none'>
            <Text tag='div' weight='semibold'>
              {canAccess('orders') ? (
                <Button variant='link' {...navigateToOrder}>
                  {orderNumber}
                </Button>
              ) : (
                orderNumber
              )}
            </Text>
          </ListDetailsItem>
        )}
        {shipmentNumber !== '#' && (
          <ListDetailsItem label='Shipment' gutter='none'>
            <Text tag='div' weight='semibold'>
              {canAccess('orders') ? (
                <Button variant='link' {...navigateToShipment}>
                  {shipmentNumber}
                </Button>
              ) : (
                shipmentNumber
              )}
            </Text>
          </ListDetailsItem>
        )}
      </Section>
    )
  }
)
