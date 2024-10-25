import { ListItemSubscription } from '#components/ListItemSubscription'
import { appRoutes } from '#data/routes'
import {
  EmptyState,
  HomePageLayout,
  PageLayout,
  Spacer,
  useResourceList,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { FC } from 'react'
import { useLocation } from 'wouter'

export const SubscriptionsList: FC = () => {
  const { settings, canUser } = useTokenProvider()
  const [, setLocation] = useLocation()
  const { ResourceList } = useResourceList({
    type: 'order_subscriptions',
    query: {
      include: ['market'],
      sort: {
        updated_at: 'desc'
      },
      pageSize: 25
    }
  })

  if (!canUser('read', 'order_subscriptions')) {
    return (
      <PageLayout
        title='Subscriptions'
        mode={settings.mode}
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.list.makePath({}))
          },
          label: `Subscriptions`,
          icon: 'arrowLeft'
        }}
      >
        <EmptyState title='You are not authorized' />
      </PageLayout>
    )
  }

  return (
    <HomePageLayout title='Subscriptions'>
      <Spacer top='14'>
        <ResourceList
          title='All'
          ItemTemplate={ListItemSubscription}
          emptyState={<EmptyState title='No subscriptions yet!' />}
        />
      </Spacer>
    </HomePageLayout>
  )
}
