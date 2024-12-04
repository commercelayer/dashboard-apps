import { BadgeStatus } from '#components/BadgeStatus'
import { makeGiftCard } from '#mocks'
import { maskGiftCardCode } from '#utils/code'
import {
  Avatar,
  ListItem,
  Text,
  useAppLinking,
  withSkeletonTemplate,
  type AvatarProps,
  type ResourceListItemTemplateProps
} from '@commercelayer/app-elements'
import isEmpty from 'lodash/isEmpty'

export const ListItemGiftCard = withSkeletonTemplate<
  ResourceListItemTemplateProps<'gift_cards'>
>(({ resource = makeGiftCard() }) => {
  const { navigateTo } = useAppLinking()

  const imageOrPreset =
    isEmpty(resource.image_url) || resource.image_url == null
      ? 'gift_card'
      : (resource.image_url as AvatarProps['src'])

  return (
    <ListItem
      icon={<Avatar src={imageOrPreset} alt='Gift card' shape='rounded' />}
      {...navigateTo({
        app: 'gift_cards',
        resourceId: resource.id
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
