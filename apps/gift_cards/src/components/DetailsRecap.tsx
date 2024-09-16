import { BadgeStatus } from '#components/BadgeStatus'
import {
  Spacer,
  Stack,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { GiftCard } from '@commercelayer/sdk'

export const DetailsRecap = withSkeletonTemplate<{ giftCard: GiftCard }>(
  ({ giftCard }) => {
    return (
      <Stack>
        <div>
          <Spacer bottom='2'>
            <Text size='small' tag='div' variant='info' weight='semibold'>
              Status
            </Text>
          </Spacer>
          <BadgeStatus status={giftCard?.status} />
        </div>
        <div>
          <Spacer bottom='2'>
            <Text size='small' tag='div' variant='info' weight='semibold'>
              Balance
            </Text>
          </Spacer>
          <Text tag='div' weight='semibold'>
            {giftCard?.formatted_balance}
          </Text>
        </div>
      </Stack>
    )
  }
)
