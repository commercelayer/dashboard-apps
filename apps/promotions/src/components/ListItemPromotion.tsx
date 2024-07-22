import { makePercentageDiscountPromotion } from '#mocks'
import { ResourceListItem, navigateTo } from '@commercelayer/app-elements'
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
