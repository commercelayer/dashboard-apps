import { isMockedId, useCoreApi } from "@commercelayer/app-elements"
import isEmpty from "lodash-es/isEmpty"
import { makeGiftCard } from "../mocks/resources/gift_cards"

export const giftCardIncludeAttribute = [
  "market",
  "gift_card_recipient",
  "gift_card_recipient.customer",
  // Timeline
  "attachments",
]

export function useGiftCardDetails(id: string) {
  const {
    data: giftCard,
    isLoading,
    mutate: mutateGiftCard,
    isValidating,
    error,
  } = useCoreApi(
    "gift_cards",
    "retrieve",
    !isMockedId(id) && !isEmpty(id)
      ? [
          id,
          {
            fields: [
              "id",
              "status",
              "code",
              "currency_code",
              "balance_cents",
              "formatted_balance",
              "formatted_initial_balance",
              "balance_max_cents",
              "formatted_balance_max",
              "expires_at",
              "recipient_email",
              "rechargeable",
              "single_use",
              "distribute_discount",
              "image_url",
              "created_at",
              "updated_at",
              // Relationships (must be listed for sparse fieldsets to sideload them)
              "market",
              "gift_card_recipient",
              "attachments",
            ],
            include: giftCardIncludeAttribute,
          },
        ]
      : null,
    {
      fallbackData: makeGiftCard(),
    },
  )

  return { giftCard, isLoading, mutateGiftCard, isValidating, error }
}
