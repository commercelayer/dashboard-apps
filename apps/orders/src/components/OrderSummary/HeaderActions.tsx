import { useOrderDetails } from '#hooks/useOrderDetails'
import { useTriggerAttribute } from '#hooks/useTriggerAttribute'
import {
  Button,
  Dropdown,
  DropdownItem,
  Icon,
  useCoreSdkProvider,
  useTokenProvider,
  useTranslation
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'
import { useAddItemOverlay } from './hooks/useAddItemOverlay'
import { useOrderStatus } from './hooks/useOrderStatus'
import { arrayOf } from './utils'

export const HeaderActions: React.FC<{ order: Order }> = ({ order }) => {
  const { sdkClient } = useCoreSdkProvider()
  const { canUser } = useTokenProvider()
  const { dispatch } = useTriggerAttribute(order.id)
  const { mutateOrder } = useOrderDetails(order.id)
  const { isEditing } = useOrderStatus(order)
  const { show: showAddItemOverlay, Overlay: AddItemOverlay } =
    useAddItemOverlay(order)
  const { t } = useTranslation()

  const canEdit =
    order.status === 'placed' &&
    arrayOf<Order['payment_status']>(['free', 'authorized', 'paid']).includes(
      order.payment_status
    ) &&
    canUser('update', 'orders')

  /** Define whether the `editing` feature is on or off. */
  const editFeature = true

  if (editFeature && canEdit) {
    return (
      <Button
        variant='secondary'
        size='mini'
        alignItems='center'
        onClick={(e) => {
          e.preventDefault()
          void dispatch('_start_editing').catch(() => {
            void mutateOrder()
          })
        }}
      >
        <Icon name='pencilSimple' size={16} />
        {t('common.edit')}
      </Button>
    )
  }

  if (isEditing) {
    return (
      <>
        <AddItemOverlay
          onConfirm={({ type, code }) => {
            void sdkClient.line_items
              .create({
                order: sdkClient.orders.relationship(order.id),
                quantity: 1,
                ...(type === 'skus'
                  ? { sku_code: code }
                  : { bundle_code: code })
              })
              .then(async () => {
                void mutateOrder()
              })
          }}
        />
        <Dropdown
          dropdownLabel={
            <Button variant='secondary' size='mini' alignItems='center'>
              {t('apps.orders.actions.add_item')}
              <Icon name='caretDown' />
            </Button>
          }
          dropdownItems={
            <>
              <DropdownItem
                label={t('common.add_resource', {
                  resource: t('resources.skus.name')
                })}
                onClick={() => {
                  showAddItemOverlay('skus')
                }}
              />
              <DropdownItem
                label={t('common.add_resource', {
                  resource: t('resources.bundles.name').toLowerCase()
                })}
                onClick={() => {
                  showAddItemOverlay('bundles')
                }}
              />
            </>
          }
        />
      </>
    )
  }

  return null
}
