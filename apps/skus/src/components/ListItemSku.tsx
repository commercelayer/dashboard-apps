import { makeSku } from '#mocks'
import {
  Avatar,
  ListItem,
  StatusIcon,
  Text,
  navigateTo,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Sku } from '@commercelayer/sdk'
import { useLocation } from 'wouter'

interface Props {
  resource?: Sku
  isLoading?: boolean
  delayMs?: number
}

export const ListItemSku = withSkeletonTemplate<Props>(
  ({ resource = makeSku() }): JSX.Element | null => {
    const [, setLocation] = useLocation()

    return (
      <ListItem
        icon={
          <Avatar
            alt={resource.name}
            src={resource.image_url as `https://${string}`}
          />
        }
        alignItems='center'
        {...navigateTo({
          setLocation,
          destination: {
            app: 'skus',
            resourceId: resource.id
          }
        })}
      >
        <div>
          <Text tag='div' weight='medium' size='small' variant='info'>
            {resource.code}
          </Text>
          <Text tag='div' weight='semibold'>
            {resource.name}
          </Text>
        </div>
        <div>
          <StatusIcon name='caretRight' />
        </div>
      </ListItem>
    )
  }
)
