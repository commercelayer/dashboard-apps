import {
  Badge,
  Button,
  EmptyState,
  formatDateWithPredicate,
  type PageHeadingProps,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { ResourceInfoBlocks } from "dashboard-apps-common/src/components/ResourceInfoBlocks"
import { getResourceModalButton } from "dashboard-apps-common/src/helpers/resourceModal"
import type { FC } from "react"
import { Link, useLocation, useRoute } from "wouter"
import { ErrorNotFound } from "#components/ErrorNotFound"
import { WebhookCallbacks } from "#components/WebhookCallbacks"
import { WebhookInfos } from "#components/WebhookInfos"
import { WebhookSharedSecret } from "#components/WebhookSharedSecret"
import { getWebhookDisplayStatus } from "#data/dictionaries"
import { appRoutes } from "#data/routes"
import { useWebhookDetails } from "#hooks/useWebhookDetails"

export const WebhookDetails: FC = () => {
  const {
    settings: { extras, mode },
    canUser,
    user,
  } = useTokenProvider()
  const [, params] = useRoute(appRoutes.details.path)
  const [, setLocation] = useLocation()

  const webhookId = params?.webhookId ?? ""
  const { webhook, isLoading, mutateWebhook, error } = useWebhookDetails(
    webhookId,
    { withLastEventCallbacks: true },
  )

  if (webhookId == null || !canUser("read", "webhooks") || error != null) {
    return (
      <PageLayout
        title="Webhook details"
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.list.makePath({}))
          },
          label: "",
          icon: "arrowLeft",
          variant: "button",
        }}
        mode={mode}
      >
        <EmptyState
          title="Not authorized"
          action={
            <Link href={appRoutes.list.makePath({})}>
              <Button variant="primary">Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  if (webhook == null) {
    return <ErrorNotFound />
  }

  const pageTitle = webhook.name
  const displayStatus = getWebhookDisplayStatus(webhook)

  const pageToolbar: PageHeadingProps["toolbar"] = {
    buttons: [],
    dropdownItems: [],
  }

  if (extras?.openResourceModal != null) {
    pageToolbar.buttons?.push(
      getResourceModalButton("webhooks", webhook.id, extras),
    )
  }

  const actions: NonNullable<
    NonNullable<PageHeadingProps["toolbar"]>["dropdownItems"]
  >[number] = []

  if (canUser("update", "webhooks")) {
    actions.push({
      label: "Edit",
      onClick: () => {
        setLocation(appRoutes.editWebhook.makePath({ webhookId }))
      },
    })
  }

  if (canUser("destroy", "webhooks")) {
    actions.push({
      label: "Delete",
      onClick: () => {
        setLocation(appRoutes.deleteWebhook.makePath({ webhookId }))
      },
    })
  }

  if (actions.length > 0) {
    pageToolbar.dropdownItems?.push(actions)
  }

  return (
    <SkeletonTemplate isLoading={isLoading}>
      <PageLayout
        title={
          <>
            {pageTitle}
            <Badge variant={displayStatus.variant}>{displayStatus.label}</Badge>
          </>
        }
        description={formatDateWithPredicate({
          predicate: "Created",
          isoDate: webhook.created_at ?? "",
          timezone: user?.timezone,
          format: "fullWithSeconds",
        })}
        mode={mode}
        // no bottom gap under the heading: the main column opens with a
        // `Spacer top="14"`, which is what the sidebar column lines up with
        gap="only-top"
        fullWidth
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.list.makePath({}))
          },
          label: "",
          icon: "arrowLeft",
          variant: "button",
        }}
        toolbar={pageToolbar}
        sidebar={
          <>
            <WebhookSharedSecret webhook={webhook} />

            <Spacer top="10">
              <ResourceInfoBlocks
                resource={webhook}
                title={pageTitle ?? ""}
                onUpdated={async () => {
                  void mutateWebhook()
                }}
              />
            </Spacer>
          </>
        }
      >
        <Spacer bottom="14">
          <WebhookInfos webhook={webhook} />
        </Spacer>

        <WebhookCallbacks webhook={webhook} />
      </PageLayout>
    </SkeletonTemplate>
  )
}
