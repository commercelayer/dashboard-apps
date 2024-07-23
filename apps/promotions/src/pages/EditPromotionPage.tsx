import { PromotionForm } from '#components/PromotionForm'
import type { PageProps } from '#components/Routes'
import { promotionToFormValues } from '#data/formConverters/promotion'
import { promotionConfig } from '#data/promotions/config'
import { appRoutes } from '#data/routes'
import { usePromotion } from '#hooks/usePromotion'
import {
  PageLayout,
  SkeletonTemplate,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'

function Page(props: PageProps<typeof appRoutes.editPromotion>): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  const { isLoading, promotion } = usePromotion(props.params.promotionId)

  return (
    <PageLayout
      overlay={props.overlay}
      title='Edit promotion'
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
      <SkeletonTemplate isLoading={isLoading}>
        <PromotionForm
          promotionConfig={promotionConfig[promotion.type]}
          promotionId={props.params.promotionId}
          defaultValues={promotionToFormValues(promotion)}
        />
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default Page
