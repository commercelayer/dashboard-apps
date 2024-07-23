import { ErrorNotFound } from '#components/ErrorNotFound'
import { WebhookFormProvider } from '#components/Form/Provider'
import WebhookForm from '#components/Form/WebhookForm'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { FC } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export const WebhookEdit: FC = () => {
  const { settings, canUser } = useTokenProvider()
  const [, params] = useRoute(appRoutes.editWebhook.path)
  const [, setLocation] = useLocation()

  const webhookId = params == null ? null : params.webhookId

  if (webhookId == null || !canUser('update', 'webhooks')) {
    return (
      <PageLayout
        title='Edit webhook'
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

  return (
    <WebhookFormProvider webhookId={webhookId}>
      {({ state: { isLoading, data } }) =>
        isLoading ? null : data == null ? (
          <ErrorNotFound />
        ) : (
          <SkeletonTemplate>
            <PageLayout
              title='Edit webhook'
              mode={settings.mode}
              navigationButton={{
                onClick: () => {
                  setLocation(appRoutes.list.makePath({ webhookId }))
                },
                label: 'Cancel',
                icon: 'x'
              }}
              overlay
            >
              <WebhookForm webhookData={data} />
            </PageLayout>
          </SkeletonTemplate>
        )
      }
    </WebhookFormProvider>
  )
}
