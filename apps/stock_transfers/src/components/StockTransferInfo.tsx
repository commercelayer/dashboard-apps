import {
  Button,
  ListItem,
  Section,
  Text,
  navigateTo,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { StockTransfer } from '@commercelayer/sdk'

interface Props {
  stockTransfer: StockTransfer
}

export const StockTransferInfo = withSkeletonTemplate<Props>(
  ({ stockTransfer }): JSX.Element => {
    const {
      canAccess,
      settings: { mode }
    } = useTokenProvider()

    const orderNumber = `#${stockTransfer?.shipment?.order?.number}`
    const navigateToOrder = canAccess('orders')
      ? navigateTo({
          destination: {
            app: 'orders',
            resourceId: stockTransfer?.shipment?.order?.id,
            mode
          }
        })
      : {}

    const shipmentNumber = `#${stockTransfer?.shipment?.number}`
    const navigateToShipment = canAccess('shipments')
      ? navigateTo({
          destination: {
            app: 'shipments',
            resourceId: stockTransfer?.shipment?.id,
            mode
          }
        })
      : {}

    if (orderNumber === '#' && shipmentNumber === '#') return <></>

    return (
      <Section title='Info'>
        {orderNumber !== '#' && (
          <ListItem>
            <Text tag='div' variant='info'>
              Order
            </Text>
            <Text tag='div' weight='semibold'>
              {canAccess('orders') ? (
                <Button variant='link' {...navigateToOrder}>
                  {orderNumber}
                </Button>
              ) : (
                orderNumber
              )}
            </Text>
          </ListItem>
        )}
        {shipmentNumber !== '#' && (
          <ListItem>
            <Text tag='div' variant='info'>
              Shipment
            </Text>
            <Text tag='div' weight='semibold'>
              {canAccess('orders') ? (
                <Button variant='link' {...navigateToShipment}>
                  {shipmentNumber}
                </Button>
              ) : (
                shipmentNumber
              )}
            </Text>
          </ListItem>
        )}
      </Section>
    )
  }
)
