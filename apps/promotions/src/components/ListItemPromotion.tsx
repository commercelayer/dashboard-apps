import { ResourceListItem, useAppLinking } from "@commercelayer/app-elements"
import { makePercentageDiscountPromotion } from "#mocks"
import type { Promotion } from "#types"

interface Props {
  resource?: Promotion
  isLoading?: boolean
  delayMs?: number
}

export function ListItemPromotion({
  resource = makePercentageDiscountPromotion() as unknown as Promotion,
  isLoading,
  delayMs,
}: Props): React.JSX.Element {
  const { navigateTo } = useAppLinking()

  return (
    <ResourceListItem
      resource={resource}
      isLoading={isLoading}
      delayMs={delayMs}
      {...navigateTo({
        app: "promotions",
        resourceId: resource.id,
      })}
    />
  )
}
