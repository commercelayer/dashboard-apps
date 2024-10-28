import { makePercentageDiscountPromotion } from '#mocks'
import type { Promotion } from '#types'
import { ResourceListItem, navigateTo } from '@commercelayer/app-elements'
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
      // @ts-expect-error // TODO: fix Promotion type in the sdk
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
