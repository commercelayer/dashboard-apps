import {
  Button,
  EmptyState,
  PageLayout,
  ResourceList,
  Spacer,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'

import { ListEmptyState } from '#components/ListEmptyState'
import { ListItemOrder } from '#components/ListItemOrder'
import { ScrollToTop } from '#components/ScrollToTop'
import { appRoutes } from '#data/routes'
import { useCustomerDetails } from '#hooks/useCustomerDetails'

export function CustomerOrders(): JSX.Element {
  const { canUser } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ customerId: string }>(appRoutes.orders.path)
  const customerId = params?.customerId ?? ''

  const { customer } = useCustomerDetails(customerId)

  const goBackUrl =
    customerId != null
      ? appRoutes.details.makePath(customerId)
      : appRoutes.list.makePath()

  if (!canUser('read', 'orders')) {
    return (
      <PageLayout
        title='Orders'
        navigationButton={{
          label: 'Back',
          icon: 'arrowLeft',
          onClick: () => {
            setLocation(goBackUrl)
          }
        }}
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
      title={<>{customer.email}</>}
      navigationButton={{
        label: 'Back',
        icon: 'arrowLeft',
        onClick: () => {
          setLocation(goBackUrl)
        }
      }}
    >
      <ScrollToTop />
      <Spacer bottom='14'>
        <ResourceList
          type='orders'
          title='All orders'
          query={{
            filters: {
              customer_id_eq: customerId,
              status_matches_any: 'placed,approved,editing,cancelled'
            },
            include: ['billing_address'],
            sort: ['-updated_at']
          }}
          emptyState={<ListEmptyState scope='presetView' />}
          ItemTemplate={ListItemOrder}
        />
      </Spacer>
    </PageLayout>
  )
}
