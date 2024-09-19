import {
  Badge,
  ListDetails,
  ListDetailsItem,
  formatDate,
  navigateTo,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { GiftCard } from '@commercelayer/sdk'
import { useLocation } from 'wouter'

export const DetailsInfo = withSkeletonTemplate<{ giftCard: GiftCard }>(
  ({ giftCard }) => {
    const { user } = useTokenProvider()
    const [, setLocation] = useLocation()

    return (
      <ListDetails title='Info'>
        <ListDetailsItem label='Code'>{giftCard.code}</ListDetailsItem>
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
            {giftCard.gift_card_recipient.customer?.id != null ? (
              <a
                {...navigateTo({
                  setLocation,
                  destination: {
                    app: 'customers',
                    resourceId: giftCard.gift_card_recipient.customer.id
                  }
                })}
              >
                {giftCard.gift_card_recipient.customer.email}
              </a>
            ) : (
              giftCard.gift_card_recipient.customer?.email
            )}
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
