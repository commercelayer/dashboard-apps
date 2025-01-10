import { hasPaymentMethod } from '#utils/order'
import {
  Button,
  ListDetails,
  ListDetailsItem,
  PageHeading,
  ResourcePaymentMethod,
  Spacer,
  useOverlay,
  useTranslation
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'

interface OverlayHook {
  show: () => void
  Overlay: React.FC<{ order: Order; onConfirm: () => void }>
}

export function useCaptureOverlay(): OverlayHook {
  const { Overlay, open, close } = useOverlay()
  const { t } = useTranslation()

  return {
    show: open,
    Overlay: ({ order, onConfirm }) => (
      <Overlay backgroundColor='light'>
        <PageHeading
          title={t('apps.orders.details.confirm_capture')}
          navigationButton={{
            onClick: () => {
              close()
            },
            label: t('common.cancel'),
            icon: 'x'
          }}
          description={t('apps.orders.details.irreversible_action')}
        />

        <Spacer bottom='14'>
          <ListDetails>
            <ListDetailsItem label={t('resources.orders.name')}>
              #{order.number}
            </ListDetailsItem>
            <ListDetailsItem label={t('resources.customers.name')}>
              {order.customer_email}
            </ListDetailsItem>
            <ListDetailsItem label={t('apps.orders.details.payment_method')}>
              {hasPaymentMethod(order) ? (
                <ResourcePaymentMethod
                  resource={order}
                  variant='plain'
                  showPaymentResponse
                />
              ) : (
                '-'
              )}
            </ListDetailsItem>
            <ListDetailsItem label={t('common.amount')}>
              {order.formatted_total_amount}
            </ListDetailsItem>
          </ListDetails>
        </Spacer>
        <Button
          fullWidth
          onClick={() => {
            onConfirm()
            close()
          }}
        >
          {t('apps.orders.actions.capture')} {order.formatted_total_amount}
        </Button>
      </Overlay>
    )
  }
}
