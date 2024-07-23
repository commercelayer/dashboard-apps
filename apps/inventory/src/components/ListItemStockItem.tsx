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
  ({ resource = makeStockItem() }): JSX.Element | null => {
    const [, setLocation] = useLocation()

    const [, params] = useRoute<{ stockLocationId: string }>(
      appRoutes.stockLocation.path
    )

    const stockLocationId = params?.stockLocationId ?? ''

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
          <Text tag='div' weight='medium' variant='info' size='small'>
            {resource.sku?.code}
          </Text>
          <Text tag='div' weight='semibold'>
            {resource.sku?.name}
          </Text>
          {resource.reserved_stock != null && (
            <Spacer top='1'>
              <Badge variant='warning' icon='lockSimple'>
                {resource.reserved_stock?.quantity} reserved
              </Badge>
            </Spacer>
          )}
        </div>
        <Text weight='semibold' wrap='nowrap'>
          x {resource.quantity}
        </Text>
      </ListItem>
    )
  }
)
