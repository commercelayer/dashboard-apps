import { CouponForm } from '#components/CouponForm'
import type { PageProps } from '#components/Routes'
import { appRoutes } from '#data/routes'
import { usePromotion } from '#hooks/usePromotion'
import {
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'

function Page(props: PageProps<typeof appRoutes.newCoupon>): React.JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  const { isLoading } = usePromotion(props.params.promotionId)
  const couponListLocation = `${appRoutes.promotionDetails.makePath({
    promotionId: props.params.promotionId
  })}?tab=1`

  return (
    <PageLayout
      title='New coupon'
      overlay={props.overlay}
      mode={mode}
      gap='only-top'
      navigationButton={{
        label: 'Close',
        icon: 'x',
        onClick() {
          setLocation(couponListLocation)
        }
      }}
    >
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer top='10'>
          <CouponForm
            promotionId={props.params.promotionId}
            onSuccess={() => {
              setLocation(couponListLocation)
            }}
          />
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default Page
