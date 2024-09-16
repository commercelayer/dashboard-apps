import { Badge, withSkeletonTemplate } from '@commercelayer/app-elements'
import type { GiftCard } from '@commercelayer/sdk'

export const BadgeStatus = withSkeletonTemplate<Pick<GiftCard, 'status'>>(
  ({ status }) => {
    return (
      <Badge variant={status === 'active' ? 'success' : 'secondary'}>
        {status}
      </Badge>
    )
  }
)
