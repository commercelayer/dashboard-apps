import { appRoutes } from '#data/routes'
import {
  Button,
  Icon,
  Section,
  useTranslation,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import { useLocation, useRoute } from 'wouter'

import { ListItemOrder } from '#components/ListItemOrder'
import { useCustomerOrdersList } from '#hooks/useCustomerOrdersList'

export const CustomerLastOrders = withSkeletonTemplate((): JSX.Element => {
  const [, params] = useRoute<{ customerId: string }>(appRoutes.details.path)
  const [, setLocation] = useLocation()
  const { t } = useTranslation()
  const customerId = params?.customerId ?? ''
  if (customerId.length === 0) return <></>

  const { orders } = useCustomerOrdersList({
    id: customerId,
    settings: { pageSize: 5 }
  })
  if (orders === undefined || orders?.meta.recordCount === 0) return <></>

  const showAll = orders != null && orders?.meta.pageCount > 1
  const ordersListItems = orders?.map((order, idx) => {
    return <ListItemOrder resource={order} key={idx} />
  })

  return (
    <Section
      title={`${t('resources.orders.name_other')} · ${orders?.meta?.recordCount}`}
      actionButton={
        showAll && (
          <Button
            variant='secondary'
            size='mini'
            onClick={() => {
              setLocation(appRoutes.orders.makePath(customerId))
            }}
            alignItems='center'
          >
            <Icon name='eye' size={16} />
            {t('common.see_all')}
          </Button>
        )
      }
    >
      {ordersListItems}
    </Section>
  )
})
