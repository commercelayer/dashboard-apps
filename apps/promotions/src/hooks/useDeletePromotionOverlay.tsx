import { appRoutes } from '#data/routes'
import type { Promotion } from '#types'
import {
  Button,
  PageHeading,
  useCoreSdkProvider,
  useOverlay
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'

interface OverlayHook {
  show: () => void
  Overlay: React.FC<{ promotion: Promotion }>
}

export function useDeletePromotionOverlay(): OverlayHook {
  const { Overlay: OverlayElement, open, close } = useOverlay()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()

  return {
    show: open,
    Overlay: ({ promotion }) => {
      return (
        <OverlayElement backgroundColor='light'>
          <PageHeading
            title={`Confirm that you want to cancel the promotion ${promotion.name}`}
            navigationButton={{
              onClick: () => {
                close()
              },
              label: 'Close',
              icon: 'x'
            }}
            description='This action cannot be undone, proceed with caution.'
          />

          <Button
            variant='danger'
            fullWidth
            onClick={() => {
              void sdkClient[promotion.type].delete(promotion.id).then(() => {
                setLocation(appRoutes.home.makePath({}))
              })
            }}
          >
            Delete
          </Button>
        </OverlayElement>
      )
    }
  }
}
