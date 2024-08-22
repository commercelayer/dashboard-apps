import { appRoutes } from '#data/routes'
import type { Promotion } from '#types'
import {
  Button,
  PageHeading,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'

interface OverlayHook {
  show: () => void
  Overlay: React.FC<{ promotion: Promotion }>
}

export function useDeletePromotionOverlay(): OverlayHook {
  const { Overlay: OverlayElement, open, close } = useOverlay()
  const { sdkClient } = useCoreSdkProvider()
  const {
    settings: { accessToken, domain, organizationSlug }
  } = useTokenProvider()
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
              // @ts-expect-error TODO: flex_promotions
              if (promotion.type === 'flex_promotions') {
                void fetch(
                  // @ts-expect-error TODO: flex_promotions
                  `https://${organizationSlug}.${domain}/api/flex_promotions/${promotion.id}`,
                  {
                    method: 'DELETE',
                    headers: {
                      authorization: `Bearer ${accessToken}`,
                      'content-type': 'application/vnd.api+json'
                    },
                    body: null
                  }
                ).then(() => {
                  setLocation(appRoutes.home.makePath({}))
                })
              } else {
                void sdkClient[promotion.type].delete(promotion.id).then(() => {
                  setLocation(appRoutes.home.makePath({}))
                })
              }
            }}
          >
            Delete
          </Button>
        </OverlayElement>
      )
    }
  }
}
