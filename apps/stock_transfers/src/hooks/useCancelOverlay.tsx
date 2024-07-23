import { Button, PageHeading, useOverlay } from '@commercelayer/app-elements'
import { type StockTransfer } from '@commercelayer/sdk'

interface OverlayHook {
  show: () => void
  Overlay: React.FC<{ stockTransfer: StockTransfer; onConfirm: () => void }>
}

export function useCancelOverlay(): OverlayHook {
  const { Overlay: OverlayElement, open, close } = useOverlay()

  return {
    show: open,
    Overlay: ({ stockTransfer, onConfirm }) => {
      return (
        <OverlayElement backgroundColor='light'>
          <PageHeading
            title={`Confirm that you want to cancel stock transfer #${
              stockTransfer.number ?? ''
            }`}
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
