import { appRoutes } from '#data/routes'
import {
  Button,
  PageLayout,
  useCoreSdkProvider,
  useOverlay
} from '@commercelayer/app-elements'
import type { Sku } from '@commercelayer/sdk'
import { useState } from 'react'
import { useLocation } from 'wouter'

interface OverlayHook {
  show: () => void
  Overlay: React.FC
}

export function useSkuDeleteOverlay(sku: Sku): OverlayHook {
  const { Overlay: OverlayElement, open, close } = useOverlay()
  const [, setLocation] = useLocation()

  return {
    show: () => {
      open()
    },
    Overlay: () => {
      const [isDeleting, setIsDeleting] = useState(false)
      const { sdkClient } = useCoreSdkProvider()

      return (
        <OverlayElement backgroundColor='light'>
          <PageLayout
            title={`Confirm that you want to delete the ${sku.code} (${sku.name}) SKU.`}
            description='This action cannot be undone, proceed with caution.'
            minHeight={false}
            navigationButton={{
              onClick: () => {
                close()
              },
              label: `Cancel`,
              icon: 'x'
            }}
          >
            <Button
              variant='danger'
              size='small'
              disabled={isDeleting}
              onClick={(e) => {
                setIsDeleting(true)
                e.stopPropagation()
                void sdkClient.skus
                  .delete(sku.id)
                  .then(() => {
                    setLocation(appRoutes.list.makePath({}))
                  })
                  .catch(() => {})
              }}
              fullWidth
            >
              Delete SKU
            </Button>
          </PageLayout>
        </OverlayElement>
      )
    }
  }
}
