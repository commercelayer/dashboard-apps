import { ErrorNotFound } from '#components/ErrorNotFound'
import { WebhookCallback } from '#components/WebhookCallback'
import { WebhookInfos } from '#components/WebhookInfos'
import { WebhookTopCard } from '#components/WebhookTopCard'
import { appRoutes } from '#data/routes'
import { useWebhookDetails } from '#hooks/useWebhookDetails'
import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useTokenProvider,
  type PageHeadingProps
} from '@commercelayer/app-elements'
import type { FC } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export const WebhookDetails: FC = () => {
  const { settings, canUser } = useTokenProvider()
  const [, params] = useRoute(appRoutes.details.path)
  const [, setLocation] = useLocation()

  const webhookId = params?.webhookId ?? ''
  const { webhook, isLoading } = useWebhookDetails(webhookId)

  if (webhookId == null || !canUser('read', 'webhooks')) {
    return (
      <PageLayout
        title='Webhook details'
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.list.makePath({}))
          },
          label: `Webhooks`,
          icon: 'arrowLeft'
        }}
        mode={settings.mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.list.makePath({})}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const pageToolbar: PageHeadingProps['toolbar'] = {
    buttons: [],
    dropdownItems: []
  }

  if (canUser('update', 'webhooks')) {
    pageToolbar.dropdownItems?.push([
      {
        label: 'Edit',
        onClick: () => {
          setLocation(appRoutes.editWebhook.makePath({ webhookId }))
        }
      }
    ])
  }

  if (canUser('destroy', 'webhooks')) {
    pageToolbar.dropdownItems?.push([
      {
        label: 'Delete',
        onClick: () => {
          setLocation(appRoutes.deleteWebhook.makePath({ webhookId }))
        }
      }
    ])
  }

  return webhook == null ? (
    <ErrorNotFound />
  ) : (
    <SkeletonTemplate isLoading={isLoading}>
      <PageLayout
        title={webhook.name}
        mode={settings.mode}
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.list.makePath({}))
          },
          label: `Webhooks`,
          icon: 'arrowLeft'
        }}
        toolbar={pageToolbar}
      >
        <Spacer bottom='12'>
          <WebhookTopCard />
        </Spacer>
        <Spacer bottom='12'>
          <WebhookInfos webhook={webhook} />
        </Spacer>
        <WebhookCallback webhook={webhook} />
      </PageLayout>
    </SkeletonTemplate>
  )
}
