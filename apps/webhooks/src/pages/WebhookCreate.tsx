import WebhookForm from '#components/Form/WebhookForm'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  PageLayout,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { FC } from 'react'
import { Link, useLocation } from 'wouter'

export const WebhookCreate: FC = () => {
  const { settings, canUser } = useTokenProvider()
  const [, setLocation] = useLocation()

  if (!canUser('create', 'webhooks')) {
    return (
      <PageLayout
        title='New webhook'
        mode={settings.mode}
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.list.makePath({}))
          },
          label: `Webhooks`,
          icon: 'arrowLeft'
        }}
      >
        <EmptyState
          title='You are not authorized'
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
    <PageLayout
      title='New webhook'
      mode={settings.mode}
      navigationButton={{
        onClick: () => {
          setLocation(appRoutes.list.makePath({}))
        },
        label: `Cancel`,
        icon: 'x'
      }}
      overlay
    >
      <WebhookForm />
    </PageLayout>
  )
}
