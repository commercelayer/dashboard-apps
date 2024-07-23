import { ListItemWebhook } from '#components/ListItemWebhook'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  HomePageLayout,
  Icon,
  PageLayout,
  ResourceList,
  Spacer,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { FC } from 'react'
import { Link, useLocation } from 'wouter'

export const WebhooksList: FC = () => {
  const { settings, canUser } = useTokenProvider()
  const [, setLocation] = useLocation()

  if (!canUser('read', 'webhooks')) {
    return (
      <PageLayout
        title='Webhooks'
        mode={settings.mode}
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.list.makePath({}))
          },
          label: `Webhooks`,
          icon: 'arrowLeft'
        }}
      >
        <EmptyState title='You are not authorized' />
      </PageLayout>
    )
  }

  return (
    <HomePageLayout title='Webhooks'>
      <Spacer top='14'>
        <ResourceList
          title='All webhooks'
          type='webhooks'
          query={{
            include: ['last_event_callbacks'],
            sort: {
              created_at: 'desc'
            }
          }}
          actionButton={
            canUser('create', 'webhooks') ? (
              <Link href={appRoutes.newWebhook.makePath({})}>
                <Button
                  variant='secondary'
                  size='mini'
                  alignItems='center'
                  aria-label='Add webhook'
                >
                  <Icon name='plus' size={16} />
                  New
                </Button>
              </Link>
            ) : undefined
          }
          ItemTemplate={ListItemWebhook}
          emptyState={
            <EmptyState
              title='No webhook yet!'
              description='Create your first webhook'
              action={
                canUser('create', 'webhooks') ? (
                  <Link href={appRoutes.newWebhook.makePath({})}>
                    <Button variant='primary' type='button'>
                      New webhook
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          }
        />
      </Spacer>
    </HomePageLayout>
  )
}
