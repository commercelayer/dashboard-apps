import { ErrorNotFound } from '#components/ErrorNotFound'
import { appRoutes } from '#data/routes'
import { useWebhookDetails } from '#hooks/useWebhookDetails'
import {
  Button,
  EmptyState,
  ListDetails,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  Text,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useCallback, type FC } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export const WebhookDelete: FC = () => {
  const { settings, canUser } = useTokenProvider()
  const [, params] = useRoute(appRoutes.deleteWebhook.path)
  const [, setLocation] = useLocation()

  const webhookId = params?.webhookId ?? ''
  const { webhook, isLoading } = useWebhookDetails(webhookId)

  const { sdkClient } = useCoreSdkProvider()

  const deleteWebhook = useCallback(async (): Promise<boolean> => {
    return await sdkClient.webhooks
      .delete(webhookId)
      .then(() => true)
      .catch(() => {
        return false
      })
  }, [webhookId])

  if (webhookId == null || !canUser('destroy', 'webhooks')) {
    return (
      <PageLayout
        title='Delete webhook'
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

  return webhook == null ? (
    <ErrorNotFound />
  ) : (
    <SkeletonTemplate isLoading={isLoading}>
      <PageLayout
        title={`Permanently delete the ${webhook.name} webhook.`}
        mode={settings.mode}
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.details.makePath({ webhookId }))
          },
          label: `Cancel`,
          icon: 'x'
        }}
        gap='only-top'
        overlay
      >
        <ListDetails>
          <Spacer bottom='12'>
            <Text variant='info' weight='medium'>
              This action cannot be undone, proceed with caution.
            </Text>
          </Spacer>
          <Button
            variant='danger'
            size='small'
            onClick={(e) => {
              e.stopPropagation()
              deleteWebhook()
                .then(() => {
                  setLocation(appRoutes.list.makePath({}))
                })
                .catch((e: any) => {
                  console.log(e)
                })
            }}
            fullWidth
          >
            Delete webhook
          </Button>
        </ListDetails>
      </PageLayout>
    </SkeletonTemplate>
  )
}
