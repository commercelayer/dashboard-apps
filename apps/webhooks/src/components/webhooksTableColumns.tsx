import {
  Badge,
  formatDate,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { useMemo } from "react"
import { getWebhookDisplayStatus } from "#data/dictionaries"

/**
 * Columns of the webhooks table.
 *
 * Requires `include: ['last_event_callbacks']` in the query: "Last fired" is the
 * date of the most recent callback, which lives on that relationship.
 */
export function useWebhooksTableColumns(): Array<
  ResourceTableColumn<"webhooks">
> {
  const { user } = useTokenProvider()

  return useMemo(
    () => [
      {
        header: "Name",
        cell: ({ resource }) => (
          <Text weight="medium">{resource.name ?? "-"}</Text>
        ),
      },
      {
        header: "Last fired",
        hideBelow: "md",
        cell: ({ resource }) => {
          const lastFiredAt = resource.last_event_callbacks?.[0]?.created_at
          if (lastFiredAt == null) {
            return <Text className="text-gray-300">&#8212;</Text>
          }
          return (
            <Text wrap="nowrap">
              {formatDate({
                format: "full",
                isoDate: lastFiredAt,
                timezone: user?.timezone,
                locale: user?.locale,
              })}
            </Text>
          )
        },
      },
      {
        header: "Status",
        cell: ({ resource }) => {
          const displayStatus = getWebhookDisplayStatus(resource)
          return (
            <Badge variant={displayStatus.variant}>{displayStatus.label}</Badge>
          )
        },
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
