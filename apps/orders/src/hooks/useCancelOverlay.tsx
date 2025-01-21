import {
  Button,
  PageHeading,
  useOverlay,
  useTranslation
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'

interface OverlayHook {
  show: () => void
  Overlay: React.FC<{ order: Order; onConfirm: () => void }>
}

export function useCancelOverlay(): OverlayHook {
  const { Overlay: OverlayElement, open, close } = useOverlay()
  const { t } = useTranslation()

  return {
    show: open,
    Overlay: ({ order, onConfirm }) => {
      return (
        <OverlayElement>
          <PageHeading
            title={t('apps.orders.details.confirm_order_cancellation', {
              number: order.number
            })}
            navigationButton={{
              onClick: () => {
                close()
              },
              label: t('common.cancel'),
              icon: 'x'
            }}
            description={t('apps.orders.details.irreversible_action')}
          />

          <Button
            variant='danger'
            fullWidth
            onClick={() => {
              onConfirm()
              close()
            }}
          >
            {t('common.cancel')}
          </Button>
        </OverlayElement>
      )
    }
  }
}
