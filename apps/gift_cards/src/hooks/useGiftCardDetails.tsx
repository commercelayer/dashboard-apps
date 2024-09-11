import { isMockedId } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
import isEmpty from 'lodash/isEmpty'
import { makeGiftCard } from '../mocks/resources/gift_cards'

const giftCardIncludeAttribute = ['market', 'gift_card_recipient']

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useGiftCardDetails(id: string) {
  const {
    data: giftCard,
    isLoading,
    mutate: mutateGiftCard,
    isValidating,
    error
  } = useCoreApi(
    'gift_cards',
    'retrieve',
    !isMockedId(id) && !isEmpty(id)
      ? [
          id,
          {
            include: giftCardIncludeAttribute
          }
        ]
      : null,
    {
      fallbackData: makeGiftCard()
    }
  )

  return { giftCard, isLoading, mutateGiftCard, isValidating, error }
}
