import {
  formatDate,
  maskGiftCardCode,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { TableTagsCell } from "dashboard-apps-common/src/components/TableTagsCell"
import isEmpty from "lodash-es/isEmpty"
import { useMemo } from "react"
import { BadgeStatus } from "#components/BadgeStatus"

/**
 * Columns of the gift cards table.
 *
 * CODE is the primary column, always shown; the others can be hidden by the user
 * from the columns menu (`hideable`), with Expires, Reference and Tags hidden
 * until they are turned on.
 *
 * Requires `include: ['gift_card_recipient', 'gift_card_recipient.customer',
 * 'tags']` in the query: a gift card's addressee is the recipient's customer when
 * there is one, and a bare email otherwise. `expires_at` and `reference` must be
 * among the sparse fields.
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
            {/* the Status column is hidden on mobile, so the badge rides with the name */}
            <span className="md:hidden inline-block align-middle ml-2">
              <BadgeStatus status={resource.status} />
            </span>
          </Text>
        ),
      },
      {
        id: "balance",
        header: "Balance",
        hideable: true,
        // the number this table exists for: worth its place on a phone
        hideBelow: "never",
        kind: "amount",
        sortBy: "balance_cents",
        cell: ({ resource }) => (
          <Text wrap="nowrap">{resource.formatted_balance}</Text>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        hideable: true,
        kind: "text",
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
        id: "status",
        header: "Status",
        hideable: true,
        kind: "status",
        sortBy: "status",
        cell: ({ resource }) => <BadgeStatus status={resource.status} />,
      },
      {
        id: "created",
        header: "Created",
        hideable: true,
        kind: "datetime",
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
      {
        id: "expires",
        header: "Expires",
        kind: "datetime",
        sortBy: "expires_at",
        hideable: true,
        defaultHidden: true,
        cell: ({ resource }) =>
          resource.expires_at == null ? (
            <Text className="text-gray-300">&#8212;</Text>
          ) : (
            <Text wrap="nowrap">
              {formatDate({
                format: "full",
                isoDate: resource.expires_at,
                timezone: user?.timezone,
                locale: user?.locale,
              })}
            </Text>
          ),
      },
      {
        id: "reference",
        header: "Reference",
        kind: "code",
        hideable: true,
        defaultHidden: true,
        cell: ({ resource }) =>
          isEmpty(resource.reference) ? (
            <Text className="text-gray-300">&#8212;</Text>
          ) : (
            <Text wrap="nowrap">{resource.reference}</Text>
          ),
      },
      {
        id: "tags",
        header: "Tags",
        kind: "text",
        hideable: true,
        defaultHidden: true,
        cell: ({ resource }) => <TableTagsCell tags={resource.tags} />,
      },
    ],
    [user?.timezone, user?.locale],
  )
}
