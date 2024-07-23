import { makeSkuListItem } from '#mocks'
import {
  Avatar,
  ListItem,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { SkuListItem } from '@commercelayer/sdk'

interface Props {
  resource?: SkuListItem
  isLoading?: boolean
  delayMs?: number
}

export const ListItemSkuListItem = withSkeletonTemplate<Props>(
  ({ resource = makeSkuListItem() }): JSX.Element | null => {
    return (
      <ListItem
        icon={
          <Avatar
            alt={resource.sku?.name ?? ''}
            src={resource.sku?.image_url as `https://${string}`}
          />
        }
        alignItems='bottom'
        className='bg-white'
      >
        <div>
          <Text tag='div' weight='medium' variant='info' size='small'>
            {resource.sku?.code}
          </Text>
          <Text tag='div' weight='semibold'>
            {resource.sku?.name}
          </Text>
        </div>
        <Text weight='semibold' wrap='nowrap'>
          x {resource.quantity}
        </Text>
      </ListItem>
    )
  }
)
