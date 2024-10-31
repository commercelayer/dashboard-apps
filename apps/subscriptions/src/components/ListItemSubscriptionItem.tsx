import { makeOrderSubscriptionItem } from '#mocks'
import {
  Avatar,
  Badge,
  ListItem,
  Spacer,
  Text,
  withSkeletonTemplate,
  type ResourceListItemTemplateProps
} from '@commercelayer/app-elements'

export const ListItemSubscriptionItem = withSkeletonTemplate<
  ResourceListItemTemplateProps<'order_subscription_items'>
>(({ resource = makeOrderSubscriptionItem() }): JSX.Element | null => {
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
      padding='y'
    >
      <div>
        <div className='flex justify-between items-end'>
          <div>
            <Text tag='div' weight='semibold' variant='info' size='small'>
              {resource.sku?.code}
            </Text>
            <Text tag='div' weight='bold'>
              {resource.sku?.name}
            </Text>
          </div>
          <div className='flex items-center gap-4'>
            <Text weight='semibold' wrap='nowrap' variant='info'>
              x {resource.quantity}
            </Text>
            <Text weight='semibold' wrap='nowrap'>
              {resource.formatted_total_amount}
            </Text>
          </div>
        </div>
        <Spacer top='2'>
          <Badge variant='secondary'>
            Unit price {resource.formatted_unit_amount}
          </Badge>
        </Spacer>
      </div>
    </ListItem>
  )
})
