import { maskGiftCardCode } from '#utils/code'
import {
  Badge,
  ListDetails,
  ListDetailsItem,
  formatDate,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { GiftCard } from '@commercelayer/sdk'

export const DetailsInfo = withSkeletonTemplate<{ giftCard: GiftCard }>(
  ({ giftCard }) => {
    const { user } = useTokenProvider()

    return (
      <ListDetails title='Info'>
        <ListDetailsItem label='Code'>
          {maskGiftCardCode(giftCard.code)}
        </ListDetailsItem>
        <ListDetailsItem label='Market'>
          {giftCard.market?.name ?? `All markets in ${giftCard.currency_code}`}
        </ListDetailsItem>
        {giftCard.balance_max_cents != null && (
          <ListDetailsItem label='Max balance'>
            {giftCard.formatted_balance_max}
          </ListDetailsItem>
        )}
        {giftCard.gift_card_recipient != null && (
          <ListDetailsItem label='Customer'>
            {giftCard.gift_card_recipient.email}
          </ListDetailsItem>
        )}
        {giftCard.expires_at != null && (
          <ListDetailsItem label='Expiration date'>
            {formatDate({
              isoDate: giftCard.expires_at,
              format: 'fullWithSeconds',
              timezone: user?.timezone
            })}
          </ListDetailsItem>
        )}

        {giftCard.rechargeable === true || giftCard.single_use === true ? (
          <ListDetailsItem label='Options'>
            {giftCard.rechargeable === true && (
              <Badge variant='teal'>Rechargeable</Badge>
            )}
            {giftCard.single_use === true && (
              <Badge variant='teal'>Single use</Badge>
            )}
          </ListDetailsItem>
        ) : null}
      </ListDetails>
    )
  }
)
