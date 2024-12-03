import { makePercentageDiscountPromotion } from '#mocks'
import type { Promotion } from '#types'
import { ResourceListItem, useAppLinking } from '@commercelayer/app-elements'

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
  const { navigateTo } = useAppLinking()

  return (
    <ResourceListItem
      // @ts-expect-error // TODO: fix Promotion type in the sdk
      resource={resource}
      isLoading={isLoading}
      delayMs={delayMs}
      tag='a'
      {...navigateTo({
        app: 'promotions',
        resourceId: resource.id
      })}
    />
  )
}
