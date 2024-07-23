import { appRoutes } from '#data/routes'
import { makeStockLocation } from '#mocks'
import {
  Icon,
  ListItem,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { StockLocation } from '@commercelayer/sdk'
import { useLocation } from 'wouter'

interface Props {
  resource?: StockLocation
  isLoading?: boolean
  delayMs?: number
}

export const ListItemStockLocation = withSkeletonTemplate<Props>(
  ({ resource = makeStockLocation() }): JSX.Element | null => {
    const [, setLocation] = useLocation()
    return (
      <ListItem
        className='items-center'
        onClick={() => {
          setLocation(appRoutes.stockLocation.makePath(resource.id))
        }}
      >
        <div>
          <Text weight='bold'>{resource.name}</Text>
        </div>
        <Icon name='caretRight' />
      </ListItem>
    )
  }
)
