import {
  formatDate,
  maskGiftCardCode,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { useMemo } from "react"
import { BadgeStatus } from "#components/BadgeStatus"

/**
 * Columns of the gift cards table.
 *
 * Requires `include: ['gift_card_recipient', 'gift_card_recipient.customer']` in
 * the query: a gift card's addressee is the recipient's customer when there is
 * one, and a bare email otherwise.
 */
export function useGiftCardsTableColumns(): Array<
  ResourceTableColumn<"gift_cards">
> {
  const { user } = useTokenProvider()

  return useMemo(
    () => [
      {
        header: "Code",
        cell: ({ resource }) => (
          // only the last digits are readable: the full code is a secret
          <Text weight="medium" wrap="nowrap">
            {maskGiftCardCode(resource.code)}
          </Text>
        ),
      },
      {
        header: "Balance",
        cell: ({ resource }) => (
          <Text wrap="nowrap">{resource.formatted_balance}</Text>
        ),
      },
      {
        header: "Customer",
        hideBelow: "md",
        cell: ({ resource }) => {
          const recipient = resource.gift_card_recipient
          const email = recipient?.customer?.email ?? recipient?.email
          if (email == null) {
            return <Text className="text-gray-300">&#8212;</Text>
          }
          return <Text>{email}</Text>
        },
      },
      {
        header: "Status",
        cell: ({ resource }) => <BadgeStatus status={resource.status} />,
      },
      {
        header: "Created",
        hideBelow: "md",
        sortBy: "created_at",
        cell: ({ resource }) => (
          <Text wrap="nowrap">
            {formatDate({
              format: "full",
              isoDate: resource.created_at,
              timezone: user?.timezone,
              locale: user?.locale,
            })}
          </Text>
        ),
      },
    ],
    [user?.timezone, user?.locale],
  )
}
