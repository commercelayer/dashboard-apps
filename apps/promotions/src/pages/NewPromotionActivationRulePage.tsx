import type { PageProps } from '#components/Routes'
import { appRoutes } from '#data/routes'
import { RuleBuilderForm } from '#data/ruleBuilder/form/RuleBuilderForm'
import { usePromotion } from '#hooks/usePromotion'
import {
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'

function Page(
  props: PageProps<typeof appRoutes.newPromotionActivationRule>
): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  const { isLoading, promotion } = usePromotion(props.params.promotionId)

  return (
    <PageLayout
      title='New activation rule'
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
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer top='10'>
          {promotion.type !== 'flex_promotions' ? (
            <RuleBuilderForm
              promotion={promotion}
              onSuccess={() => {
                setLocation(
                  appRoutes.promotionDetails.makePath({
                    promotionId: props.params.promotionId
                  })
                )
              }}
            />
          ) : (
            <EmptyState
              title='Action denied!'
              description='Activation rules cannot be defined for a Flex promotion.'
            />
          )}
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default Page
