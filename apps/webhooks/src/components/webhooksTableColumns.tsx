import {
  Badge,
  formatDate,
  type ResourceTableColumn,
  Text,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { Webhook } from "@commercelayer/sdk"
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
          <Text weight="medium">
            {resource.name ?? "-"}
            {/* the Status column is hidden on mobile, so the badge rides with the name */}
            <RowStatusBadge
              resource={resource}
              className="md:hidden inline-block align-middle ml-2"
            />
          </Text>
        ),
      },
      {
        header: "Topic",
        // the event it listens to, an API identifier rather than prose. Not
        // sortable: `topic` is not in the webhook's sortable set
        kind: "code",
        cell: ({ resource }) => <Text>{resource.topic}</Text>,
      },
      {
        header: "Status",
        kind: "status",
        cell: ({ resource }) => <RowStatusBadge resource={resource} />,
      },
      {
        header: "Created",
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
    ],
    [user?.timezone, user?.locale],
  )
}

/**
 * The row's status badge.
 *
 * Shared by the Status column and, on mobile where that column is hidden, the name
 * cell — so the two can never drift apart.
 */
function RowStatusBadge({
  resource,
  className,
}: {
  resource: Webhook
  className?: string
}): React.JSX.Element {
  const displayStatus = getWebhookDisplayStatus(resource)
  return (
    <Badge variant={displayStatus.variant} className={className}>
      {displayStatus.label}
    </Badge>
  )
}
