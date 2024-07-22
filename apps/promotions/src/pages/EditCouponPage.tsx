import { CouponForm } from '#components/CouponForm'
import type { PageProps } from '#components/Routes'
import { couponToFormValues } from '#data/formConverters/coupon'
import { appRoutes } from '#data/routes'
import { useCoupon } from '#hooks/useCoupon'
import { usePromotion } from '#hooks/usePromotion'
import {
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'

function Page(props: PageProps<typeof appRoutes.editCoupon>): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  const { isLoading } = usePromotion(props.params.promotionId)
  const { coupon, isLoading: isLoadingCoupon } = useCoupon(
    props.params.couponId
  )

  return (
    <PageLayout
      title='Edit coupon'
      overlay={props.overlay}
      mode={mode}
      gap='only-top'
      navigationButton={{
        label: 'Close',
        icon: 'x',
        onClick() {
          setLocation(
            appRoutes.promotionDetails.makePath({
              promotionId: props.params.promotionId
            })
          )
        }
      }}
    >
      <SkeletonTemplate isLoading={isLoading || isLoadingCoupon}>
        <Spacer top='10'>
          <CouponForm
            promotionId={props.params.promotionId}
            couponId={props.params.couponId}
            defaultValues={couponToFormValues(coupon)}
          />
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default Page
