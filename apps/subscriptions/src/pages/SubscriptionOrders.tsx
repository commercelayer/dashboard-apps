import {
  Button,
  EmptyState,
  PageLayout,
  Spacer,
  Td,
  Tr,
  useResourceList,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'

import { ListItemSubscriptionOrder } from '#components/ListItemSubscriptionOrder'
import { appRoutes } from '#data/routes'
import { useSubscriptionDetails } from '#hooks/useSubscriptionDetails'
import { getSubscriptionTitle } from '#utils/getSubscriptionTitle'

export function SubscriptionOrders(): JSX.Element {
  const { canUser } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ subscriptionId: string }>(appRoutes.orders.path)
  const subscriptionId = params?.subscriptionId ?? ''

  const { subscription } = useSubscriptionDetails(subscriptionId)
  const pageTitle = getSubscriptionTitle(subscription)

  const { ResourceList, isFirstLoading } = useResourceList({
    type: 'orders',
    query: {
      filters: {
        order_subscription_id_eq: subscriptionId,
        status_in: ['placed', 'pending']
      },
      sort: ['-updated_at'],
      pageSize: 25
    }
  })

  const goBackUrl =
    subscriptionId != null
      ? appRoutes.details.makePath({ subscriptionId })
      : appRoutes.list.makePath({})

  if (!canUser('read', 'orders')) {
    return (
      <PageLayout
        title={pageTitle}
        navigationButton={{
          label: 'Back',
          icon: 'arrowLeft',
          onClick: () => {
            setLocation(goBackUrl)
          }
        }}
        scrollToTop
      >
        <EmptyState
          title='Permission Denied'
          description='You are not authorized to access this page.'
          action={
            <Link href={goBackUrl}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={pageTitle}
      navigationButton={{
        label: 'Back',
        icon: 'arrowLeft',
        onClick: () => {
          setLocation(goBackUrl)
        }
      }}
      scrollToTop
      isLoading={isFirstLoading}
    >
      <Spacer bottom='14'>
        <ResourceList
          title='Recurring orders'
          variant='table'
          headings={[
            {
              label: 'DATE'
            },
            {
              label: 'ORDER',
              align: 'left'
            },
            {
              label: 'PAYMENT STATUS'
            }
          ]}
          emptyState={
            <Tr>
              <Td colSpan={3}>no results</Td>
            </Tr>
          }
          ItemTemplate={ListItemSubscriptionOrder}
        />
      </Spacer>
    </PageLayout>
  )
}
