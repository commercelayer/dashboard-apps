import {
  Button,
  PageHeading,
  useOverlay,
  useTranslation
} from '@commercelayer/app-elements'
import { type Return } from '@commercelayer/sdk'

interface OverlayHook {
  show: () => void
  Overlay: React.FC<{ returnObj: Return; onConfirm: () => void }>
}

export function useCancelOverlay(): OverlayHook {
  const { Overlay: OverlayElement, open, close } = useOverlay()
  const { t } = useTranslation()

  return {
    show: open,
    Overlay: ({ returnObj, onConfirm }) => {
      return (
        <OverlayElement>
          <PageHeading
            title={t('apps.returns.details.confirm_return_cancellation', {
              number: returnObj.number
            })}
            navigationButton={{
              label: t('common.close'),
              icon: 'x',
              onClick: () => {
                close()
              }
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
