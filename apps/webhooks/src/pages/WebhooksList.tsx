import {
  EmptyState,
  PageLayout,
  Spacer,
  useResourceTable,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { FC } from "react"
import { useLocation, useRouter } from "wouter"
import { useWebhooksTableColumns } from "#components/webhooksTableColumns"
import { appRoutes } from "#data/routes"

export const WebhooksList: FC = () => {
  const { canUser } = useTokenProvider()
  const [, setLocation] = useLocation()
  // the anchor needs an absolute path, `setLocation` a base-relative one
  const { base } = useRouter()

  const columns = useWebhooksTableColumns()

  // no filters in this app, so the table is used on its own rather than through
  // `useResourceFilters`
  const { ResourceTable, Pagination } = useResourceTable({
    type: "webhooks",
    columns,
    query: {
      // "Last fired" reads the most recent callback off this relationship
      include: ["last_event_callbacks"],
      pageSize: 25,
    },
    defaultSort: "-created_at",
    getRowHref: (webhook) =>
      `${base}${appRoutes.details.makePath({ webhookId: webhook.id })}`,
    onRowClick: (webhook) => {
      setLocation(appRoutes.details.makePath({ webhookId: webhook.id }))
    },
  })

  if (!canUser("read", "webhooks")) {
    return (
      <PageLayout title="Webhooks" fullWidth>
        <EmptyState title="You are not authorized" />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Webhooks"
      fullWidth
      toolbar={{
        buttons: canUser("create", "webhooks")
          ? [
              {
                icon: "plus",
                label: "New webhook",
                size: "small",
                onClick: () => {
                  setLocation(appRoutes.newWebhook.makePath({}))
                },
              },
            ]
          : undefined,
      }}
    >
      <Spacer bottom="14">
        <ResourceTable
          emptyState={
            <EmptyState
              title="No webhooks yet"
              description="Callbacks sent to your endpoints will show up here."
            />
          }
        />
        <Pagination />
      </Spacer>
    </PageLayout>
  )
}
