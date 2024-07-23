import { Button, PageHeading, useOverlay } from '@commercelayer/app-elements'
import { type Return } from '@commercelayer/sdk'

interface OverlayHook {
  show: () => void
  Overlay: React.FC<{ returnObj: Return; onConfirm: () => void }>
}

export function useCancelOverlay(): OverlayHook {
  const { Overlay: OverlayElement, open, close } = useOverlay()

  return {
    show: open,
    Overlay: ({ returnObj, onConfirm }) => {
      return (
        <OverlayElement>
          <PageHeading
            title={`Confirm that you want to cancel return #${
              returnObj.number ?? ''
            }`}
            navigationButton={{
              label: 'Close',
              icon: 'x',
              onClick: () => {
                close()
              }
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
