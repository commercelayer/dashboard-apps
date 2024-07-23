import { appRoutes } from '#data/routes'
import { makePriceList } from '#mocks'
import {
  Icon,
  ListItem,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { PriceList } from '@commercelayer/sdk'
import { useLocation } from 'wouter'

interface Props {
  resource?: PriceList
  isLoading?: boolean
  delayMs?: number
}

export const ListItemPriceList = withSkeletonTemplate<Props>(
  ({ resource = makePriceList() }): JSX.Element | null => {
    const [, setLocation] = useLocation()
    return (
      <ListItem
        className='items-center'
        onClick={() => {
          setLocation(
            appRoutes.pricesList.makePath({ priceListId: resource.id })
          )
        }}
      >
        <div>
          <Text weight='semibold'>{resource.name}</Text>
        </div>
        <Icon name='caretRight' />
      </ListItem>
    )
  }
)
