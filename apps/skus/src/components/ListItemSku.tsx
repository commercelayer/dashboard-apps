import { makeSku } from '#mocks'
import {
  Avatar,
  ListItem,
  StatusIcon,
  Text,
  useAppLinking,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Sku } from '@commercelayer/sdk'

interface Props {
  resource?: Sku
  isLoading?: boolean
  delayMs?: number
}

export const ListItemSku = withSkeletonTemplate<Props>(
  ({ resource = makeSku() }): JSX.Element | null => {
    const { navigateTo } = useAppLinking()

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
          app: 'skus',
          resourceId: resource.id
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
