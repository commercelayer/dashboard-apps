import { BadgeStatus } from '#components/BadgeStatus'
import { makeGiftCard } from '#mocks'
import { maskGiftCardCode } from '#utils/code'
import {
  Avatar,
  ListItem,
  navigateTo,
  Text,
  withSkeletonTemplate,
  type AvatarProps
} from '@commercelayer/app-elements'
import type { ResourceListItemTemplateProps } from '@commercelayer/app-elements/dist/ui/resources/ResourceList/ResourceList'
import isEmpty from 'lodash/isEmpty'
import { useLocation } from 'wouter'

export const ListItemGiftCard = withSkeletonTemplate<
  ResourceListItemTemplateProps<'gift_cards'>
>(({ resource = makeGiftCard() }) => {
  const [, setLocation] = useLocation()

  const imageOrPreset =
    isEmpty(resource.image_url) || resource.image_url == null
      ? 'gift_card'
      : (resource.image_url as AvatarProps['src'])

  return (
    <ListItem
      icon={<Avatar src={imageOrPreset} alt='Gift card' shape='rounded' />}
      {...navigateTo({
        setLocation,
        destination: {
          app: 'gift_cards',
          resourceId: resource.id
        }
      })}
    >
      <div>
        <Text tag='div' size='small' variant='info'>
          {maskGiftCardCode(resource.code)}
        </Text>
        <Text weight='semibold'>
          Gift card {resource.formatted_initial_balance}{' '}
          <BadgeStatus status={resource.status} />
        </Text>
      </div>
      <div>
        <Text tag='div' size='small' variant='info'>
          balance
        </Text>
        <Text weight='semibold'>{resource.formatted_balance}</Text>
      </div>
    </ListItem>
  )
})
