import { Badge, withSkeletonTemplate } from "@commercelayer/app-elements"
import type { GiftCard } from "@commercelayer/sdk"
import { getGiftCardDisplayStatus } from "#data/giftCardStatus"

export const BadgeStatus = withSkeletonTemplate<
  Pick<GiftCard, "status" | "expires_at">
>(({ status, expires_at }) => {
  const displayStatus = getGiftCardDisplayStatus({ status, expires_at })
  return (
    <Badge variant={displayStatus === "active" ? "success" : "secondary"}>
      {displayStatus}
    </Badge>
  )
})
