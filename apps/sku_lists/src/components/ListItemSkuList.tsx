import { appRoutes } from '#data/routes'
import { makeSkuList } from '#mocks'
import {
  Icon,
  ListItem,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { SkuList } from '@commercelayer/sdk'
import { useLocation } from 'wouter'

interface Props {
  resource?: SkuList
  isLoading?: boolean
  delayMs?: number
}

export const ListItemSkuList = withSkeletonTemplate<Props>(
  ({ resource = makeSkuList() }): JSX.Element | null => {
    const [, setLocation] = useLocation()
    return (
      <ListItem
        className='items-center'
        onClick={() => {
          setLocation(appRoutes.details.makePath({ skuListId: resource.id }))
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
