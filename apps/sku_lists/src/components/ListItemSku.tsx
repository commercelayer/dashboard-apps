import {
  Avatar,
  ListItem,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Sku } from '@commercelayer/sdk'
import { makeSku } from 'src/mocks/resources/skus'

interface Props {
  resource?: Sku
  onSelect?: (resource: Sku) => void
}

export const ListItemSku = withSkeletonTemplate<Props>(
  ({ resource = makeSku(), onSelect }) => {
    return (
      <ListItem
        onClick={(e) => {
          e.preventDefault()
          if (onSelect != null) {
            onSelect(resource)
          }
        }}
        icon={
          <Avatar
            alt={resource.name}
            src={resource.image_url as `https://${string}`}
          />
        }
        className='bg-white'
      >
        <div>
          <Text tag='div' variant='info' weight='semibold' size='small'>
            {resource.code}
          </Text>
          <Text tag='div' weight='bold'>
            {resource.name}
          </Text>
        </div>
      </ListItem>
    )
  }
)
