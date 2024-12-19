import {
  Button,
  EmptyState,
  PageLayout,
  Spacer,
  useResourceList,
  useTokenProvider,
  useTranslation
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
  const { t } = useTranslation()
  const [, params] = useRoute<{ customerId: string }>(appRoutes.orders.path)
  const customerId = params?.customerId ?? ''

  const { customer } = useCustomerDetails(customerId)
  const { ResourceList } = useResourceList({
    type: 'orders',
    query: {
      filters: {
        customer_id_eq: customerId,
        status_matches_any: 'placed,approved,editing,cancelled'
      },
      include: ['billing_address'],
      sort: ['-placed_at']
    }
  })

  const goBackUrl =
    customerId != null
      ? appRoutes.details.makePath(customerId)
      : appRoutes.list.makePath()

  if (!canUser('read', 'orders')) {
    return (
      <PageLayout
        title={t('resources.orders.name_other')}
        navigationButton={{
          label: 'Back',
          icon: 'arrowLeft',
          onClick: () => {
            setLocation(goBackUrl)
          }
        }}
      >
        <EmptyState
          title={t('common.not_authorized')}
          description={t('common.not_authorized_description')}
          action={
            <Link href={goBackUrl}>
              <Button variant='primary'>{t('common.go_back')}</Button>
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
        label: t('common.back'),
        icon: 'arrowLeft',
        onClick: () => {
          setLocation(goBackUrl)
        }
      }}
    >
      <ScrollToTop />
      <Spacer bottom='14'>
        <ResourceList
          title={t('resources.orders.name_other')}
          emptyState={<ListEmptyState scope='presetView' />}
          ItemTemplate={ListItemOrder}
        />
      </Spacer>
    </PageLayout>
  )
}

export default CustomerOrders
