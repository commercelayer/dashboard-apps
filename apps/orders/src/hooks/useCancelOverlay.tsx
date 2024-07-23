import { Button, PageHeading, useOverlay } from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'

interface OverlayHook {
  show: () => void
  Overlay: React.FC<{ order: Order; onConfirm: () => void }>
}

export function useCancelOverlay(): OverlayHook {
  const { Overlay: OverlayElement, open, close } = useOverlay()

  return {
    show: open,
    Overlay: ({ order, onConfirm }) => {
      return (
        <OverlayElement>
          <PageHeading
            title={`Confirm that you want to cancel order ${
              order.market?.name ?? ''
            } #${order.number ?? ''}`}
            navigationButton={{
              onClick: () => {
                close()
              },
              label: 'Cancel',
              icon: 'x'
            }}
            description='This action cannot be undone, proceed with caution.'
          />

          <Button
            variant='danger'
            fullWidth
            onClick={() => {
              onConfirm()
              close()
            }}
          >
            Cancel
          </Button>
        </OverlayElement>
      )
    }
  }
}
