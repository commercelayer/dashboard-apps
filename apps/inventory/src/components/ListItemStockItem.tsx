import { appRoutes } from '#data/routes'
import { makeStockItem } from '#mocks'
import {
  Avatar,
  Badge,
  ListItem,
  Spacer,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { StockItem } from '@commercelayer/sdk'
import { useLocation, useRoute } from 'wouter'

interface Props {
  resource?: StockItem
  isLoading?: boolean
  delayMs?: number
}

export const ListItemStockItem = withSkeletonTemplate<Props>(
  ({ resource = makeStockItem() }): React.JSX.Element | null => {
    const [, setLocation] = useLocation()

    const [, params] = useRoute<{ stockLocationId: string }>(
      appRoutes.stockLocation.path
    )

    const stockLocationId = params?.stockLocationId ?? ''

    const hasReservedStock =
      resource.reserved_stock != null && resource.reserved_stock.quantity > 0

    return (
      <ListItem
        icon={
          <Avatar
            alt={resource.sku?.name ?? ''}
            src={resource.sku?.image_url as `https://${string}`}
          />
        }
        alignItems='center'
        onClick={() => {
          setLocation(
            appRoutes.stockItem.makePath(stockLocationId, resource.id)
          )
        }}
      >
        <div>
          <div className='flex justify-between items-end'>
            <div>
              <Text tag='div' weight='medium' variant='info' size='small'>
                {resource.sku?.code}
              </Text>
              <Text tag='div' weight='semibold'>
                {resource.sku?.name}
              </Text>
            </div>
            <Text weight='semibold' wrap='nowrap'>
              {resource.quantity}
            </Text>
          </div>
          {stockLocationId === '' && (
            <Spacer bottom={hasReservedStock ? '2' : undefined}>
              <Text tag='div' weight='medium' variant='info' size='small'>
                {resource.stock_location?.name}
              </Text>
            </Spacer>
          )}
          {hasReservedStock && (
            <Spacer top='1'>
              <Badge variant='warning' icon='lockSimple'>
                {resource.reserved_stock?.quantity} reserved
              </Badge>
            </Spacer>
          )}
        </div>
      </ListItem>
    )
  }
)
