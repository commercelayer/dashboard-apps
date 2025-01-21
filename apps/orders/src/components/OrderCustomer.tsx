import { useOrderDetails } from '#hooks/useOrderDetails'
import {
  Button,
  Icon,
  ListItem,
  Section,
  StatusIcon,
  Text,
  useAppLinking,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { useEditCustomerOverlay } from './NewOrder/hooks/useEditCustomerOverlay'
import { languageList } from './NewOrder/languages'
import { useOrderStatus } from './OrderSummary/hooks/useOrderStatus'

interface Props {
  order: Order
}

export const OrderCustomer = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element | null => {
    const { canAccess } = useTokenProvider()
    const { t } = useTranslation()
    const { mutateOrder } = useOrderDetails(order.id)
    const { isEditing } = useOrderStatus(order)
    const { Overlay: EditCustomerOverlay, open: openEditCustomerOverlay } =
      useEditCustomerOverlay(order, () => {
        void mutateOrder()
      })
    const { navigateTo } = useAppLinking()

    if (order.customer == null) {
      return null
    }

    const navigateToCustomer = canAccess('customers')
      ? navigateTo({
          app: 'customers',
          resourceId: order.customer.id
        })
      : {}

    return (
      <>
        <EditCustomerOverlay />
        <Section
          title={t('resources.customers.name')}
          actionButton={
            (order.status === 'draft' || order.status === 'pending') &&
            isEditing ? (
              <Button
                alignItems='center'
                variant='secondary'
                size='mini'
                onClick={() => {
                  openEditCustomerOverlay()
                }}
              >
                <Icon name='pencilSimple' />
                {t('common.edit')}
              </Button>
            ) : null
          }
        >
          <ListItem
            icon={<StatusIcon name='user' background='teal' gap='large' />}
            {...navigateToCustomer}
          >
            <div>
              <Text tag='div' weight='semibold'>
                {order.customer.email}
              </Text>
              <Text size='small' tag='div' variant='info' weight='medium'>
                {
                  languageList.find(
                    ({ value }) => value === order.language_code
                  )?.label
                }{' '}
                · {order.customer.total_orders_count}{' '}
                {t('resources.orders.name', {
                  count: order.customer.total_orders_count ?? 0
                }).toLowerCase()}
              </Text>
            </div>
            {canAccess('customers') && <StatusIcon name='caretRight' />}
          </ListItem>
        </Section>
      </>
    )
  }
)
