import { makePercentageDiscountPromotion } from '#mocks'
import {
  Badge,
  ListItem,
  ResourceListItem,
  StatusIcon,
  Text,
  formatDateRange,
  getPromotionDisplayStatus,
  navigateTo,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { Promotion } from '@commercelayer/sdk'
import { useLocation } from 'wouter'

interface Props {
  resource?: Promotion
  isLoading?: boolean
  delayMs?: number
}

export function ListItemPromotion({
  resource = makePercentageDiscountPromotion() as unknown as Promotion,
  isLoading,
  delayMs
}: Props): JSX.Element {
  const [, setLocation] = useLocation()

  const { user } = useTokenProvider()
  const displayStatus = getPromotionDisplayStatus(resource)

  // @ts-expect-error TODO: flex_promotions
  if (resource.type === 'flex_promotions') {
    return (
      <ListItem
        icon={
          <StatusIcon
            name={displayStatus.icon}
            gap='large'
            background={displayStatus.color}
          />
        }
        alignItems='center'
        {...navigateTo({
          setLocation,
          destination: {
            app: 'promotions',
            resourceId: resource.id
          }
        })}
      >
        <div>
          <Text
            tag='div'
            weight='semibold'
            data-testid='ResourceListItem-number'
          >
            {resource.name}
            <Badge className='ml-1' variant='teal'>
              flex
            </Badge>
          </Text>
          <Text
            tag='div'
            weight='medium'
            size='small'
            variant='info'
            data-testid='ResourceListItem-content'
          >
            {formatDateRange({
              rangeFrom: resource.starts_at,
              rangeTo: resource.expires_at,
              timezone: user?.timezone
            })}{' '}
            · {displayStatus.label}
          </Text>
        </div>
        <div>
          <StatusIcon name='caretRight' />
        </div>
      </ListItem>
    )
  }

  return (
    <ResourceListItem
      // @ts-expect-error // TODO: I need to fix this
      resource={resource}
      isLoading={isLoading}
      delayMs={delayMs}
      tag='a'
      {...navigateTo({
        setLocation,
        destination: {
          app: 'promotions',
          resourceId: resource.id
        }
      })}
    />
  )
}
