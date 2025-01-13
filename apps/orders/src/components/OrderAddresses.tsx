import { useOrderDetails } from '#hooks/useOrderDetails'
import {
  Button,
  Icon,
  ResourceAddress,
  Section,
  Stack,
  useCoreSdkProvider,
  useTranslation,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { useCustomerAddressOverlay } from './NewOrder/hooks/useCustomerAddressOverlay'
import { useOrderStatus } from './OrderSummary/hooks/useOrderStatus'

interface Props {
  order: Order
}

export const OrderAddresses = withSkeletonTemplate<Props>(
  ({ order }): JSX.Element | null => {
    const { sdkClient } = useCoreSdkProvider()
    const { t } = useTranslation()
    const { isEditing } = useOrderStatus(order)
    const { mutateOrder } = useOrderDetails(order.id)
    const isEditable =
      isEditing || (order.status !== 'draft' && order.status !== 'pending')
    const { Overlay: AssignAddressOverlay, open: openAssignAddressOverlay } =
      useCustomerAddressOverlay(order, () => {
        void mutateOrder()
      })

    if (order.customer == null) {
      return null
    }

    return (
      <>
        <AssignAddressOverlay />
        <Section
          border='none'
          title={t('resources.addresses.name_other')}
          actionButton={
            isEditable &&
            (order.customer?.customer_addresses ?? []).length > 0 && (
              <Button
                alignItems='center'
                variant='secondary'
                size='mini'
                onClick={() => {
                  openAssignAddressOverlay()
                }}
              >
                <Icon name='plus' />
                {t('common.select_resource', {
                  resource: t('resources.addresses.name').toLowerCase()
                })}
              </Button>
            )
          }
        >
          <Stack>
            <ResourceAddress
              title={t('resources.orders.attributes.billing_address')}
              address={order.billing_address}
              editable={isEditable}
              onCreate={(address) => {
                void sdkClient.orders.update({
                  id: order.id,
                  billing_address: {
                    type: 'addresses',
                    id: address.id
                  }
                })
              }}
              showBillingInfo
              requiresBillingInfo={order.requires_billing_info ?? undefined}
            />
            <ResourceAddress
              title={t('resources.orders.attributes.shipping_address')}
              address={order.shipping_address}
              editable={isEditable}
              onCreate={(address) => {
                void sdkClient.orders.update({
                  id: order.id,
                  shipping_address: {
                    type: 'addresses',
                    id: address.id
                  }
                })
              }}
            />
          </Stack>
        </Section>
      </>
    )
  }
)
