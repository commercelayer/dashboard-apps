import { appRoutes } from '#data/routes'
import { makePrice } from '#mocks'
import {
  Avatar,
  Badge,
  ListItem,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Price } from '@commercelayer/sdk'
import { useLocation, useRoute } from 'wouter'

interface Props {
  resource?: Price
  isLoading?: boolean
  delayMs?: number
}

export const ListItemPrice = withSkeletonTemplate<Props>(
  ({ resource = makePrice() }): JSX.Element | null => {
    const [, setLocation] = useLocation()

    const [, params] = useRoute<{ priceListId: string }>(
      appRoutes.pricesList.path
    )

    const priceListId = params?.priceListId ?? ''

    const hasFrequencyPriceTiers =
      resource.price_frequency_tiers != null &&
      resource.price_frequency_tiers.length > 0
    const hasVolumePriceTiers =
      resource.price_volume_tiers != null &&
      resource.price_volume_tiers.length > 0
    const hasPriceTiers = hasFrequencyPriceTiers || hasVolumePriceTiers

    return (
      <ListItem
        icon={
          <Avatar
            alt={resource.sku?.name ?? ''}
            src={resource.sku?.image_url as `https://${string}`}
          />
        }
        alignItems='top'
        onClick={() => {
          setLocation(
            appRoutes.priceDetails.makePath({
              priceListId,
              priceId: resource.id
            })
          )
        }}
      >
        <div>
          <Text tag='div' weight='medium' size='small' variant='info'>
            {resource.sku?.code}
          </Text>
          <Text tag='div' weight='semibold'>
            {resource.sku?.name}
          </Text>
          {hasPriceTiers && (
            <div className='flex items-center gap-2 mt-1'>
              {hasFrequencyPriceTiers && (
                <Badge variant='teal' icon='calendarBlank'>
                  Frequency pricing
                </Badge>
              )}
              {hasVolumePriceTiers && (
                <Badge variant='teal' icon='stack'>
                  Volume pricing
                </Badge>
              )}
            </div>
          )}
        </div>
        <div>
          <Text
            tag='div'
            weight='medium'
            size='small'
            variant='info'
            wrap='nowrap'
          >
            {resource.formatted_compare_at_amount !==
            resource.formatted_amount ? (
              <s>{resource.formatted_compare_at_amount}</s>
            ) : (
              <>&nbsp;</>
            )}
          </Text>
          <Text tag='div' weight='semibold' wrap='nowrap'>
            {resource.formatted_amount}
          </Text>
        </div>
      </ListItem>
    )
  }
)
