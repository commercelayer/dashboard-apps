import { isMockedId } from '#mocks'
import {
  Button,
  PageHeading,
  SkeletonTemplate,
  useCoreSdkProvider,
  useOverlay
} from '@commercelayer/app-elements'
import type { Coupon } from '@commercelayer/sdk'
import { useState } from 'react'
import { makeCoupon } from 'src/mocks/resources/coupons'

interface Options {
  coupon: Coupon
  deleteRule: boolean
}
interface OverlayHook {
  show: (options: Options) => void
  Overlay: React.FC<{ onClose: () => void }>
}

export function useDeleteCouponOverlay(): OverlayHook {
  const { Overlay: OverlayElement, open, close } = useOverlay()
  const { sdkClient } = useCoreSdkProvider()
  const [options, setOptions] = useState<Options>({
    coupon: makeCoupon(),
    deleteRule: false
  })

  return {
    show: (options) => {
      setOptions(options)
      open()
    },
    Overlay: ({ onClose }) => {
      return (
        <OverlayElement backgroundColor='light'>
          <SkeletonTemplate isLoading={isMockedId(options.coupon.id)}>
            <PageHeading
              title={`Confirm that you want to cancel the coupon with code ${options.coupon.code}`}
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
                console.log('coupon', options)
                void sdkClient.coupons
                  .delete(options.coupon.id)
                  .then(async () => {
                    if (
                      options.deleteRule &&
                      options.coupon.promotion_rule?.id != null
                    ) {
                      await sdkClient.coupon_codes_promotion_rules.delete(
                        options.coupon.promotion_rule.id
                      )
                    }
                  })
                  .then(() => {
                    onClose()
                    close()
                  })
              }}
            >
              Delete
            </Button>
          </SkeletonTemplate>
        </OverlayElement>
      )
    }
  }
}
