import {
  Badge,
  Dropdown,
  DropdownItem,
  downloadJsonAsFile,
  formatDate,
  Icon,
  type ResourceTableColumn,
  Text,
  useResourceTable,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { EventCallback, Webhook } from "@commercelayer/sdk"
import { useMemo } from "react"
import { WebhookTriggerActionButton } from "#components/WebhookTriggerActionButton"
import { eventCallbackStatusVariant } from "#utils/eventCallbackStatusVariant"

interface Props {
  webhook: Webhook
}

/**
 * Every callback this webhook has attempted, most recent first, with the trigger
 * action (reset / enable / disable) next to the title.
 */
export function WebhookCallbacks({ webhook }: Props): React.JSX.Element {
  const { user } = useTokenProvider()

  const columns = useMemo<Array<ResourceTableColumn<"event_callbacks">>>(
    () => [
      {
        header: "Code",
        // hugs its content: the response code is at most three characters
        width: "w-px",
        cell: ({ resource }) => (
          <Badge variant={eventCallbackStatusVariant(resource)}>
            {resource.response_code ?? "-"}
          </Badge>
        ),
      },
      {
        header: "Message",
        cell: ({ resource }) => (
          <Text weight="medium">{resource.response_message ?? "-"}</Text>
        ),
      },
      {
        header: "Data",
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
      {
        header: "",
        width: "w-px",
        cell: ({ resource }) => <CallbackRowActions callback={resource} />,
      },
    ],
    [user?.timezone, user?.locale],
  )

  const { ResourceTable, Pagination } = useResourceTable({
    type: "event_callbacks",
    columns,
    query: {
      filters: { webhook_id_eq: webhook.id },
      pageSize: 25,
    },
    defaultSort: "-created_at",
  })

  return (
    <>
      <ResourceTable
        title="Callbacks"
        actionButton={<WebhookTriggerActionButton webhook={webhook} />}
        // bordered card around the table, as the mockup has it: this list sits in
        // the middle of a page rather than being the page itself
        variant="boxed"
      />
      <Pagination />
    </>
  )
}

/**
 * The row's `…` menu. A component rather than inline JSX in the cell: it needs
 * hooks, and a `cell` callback is not a component.
 */
function CallbackRowActions({
  callback,
}: {
  callback: EventCallback
}): React.JSX.Element | null {
  if (callback.payload == null) {
    return null
  }

  return (
    <Dropdown
      dropdownLabel={<Icon name="dotsThree" size="24" />}
      dropdownItems={[
        <DropdownItem
          key="payload"
          icon="fileArrowDown"
          label="Download payload"
          onClick={() => {
            downloadJsonAsFile({
              json: callback.payload ?? undefined,
              filename: `${callback.id}.json`,
            })
          }}
        />,
      ]}
    />
  )
}
