import { PromotionForm } from '#components/PromotionForm'
import { GenericPageNotFound, type PageProps } from '#components/Routes'
import { promotionConfig } from '#data/promotions/config'
import { appRoutes } from '#data/routes'
import { PageLayout, useTokenProvider } from '@commercelayer/app-elements'
import { useLocation } from 'wouter'

function Page(props: PageProps<typeof appRoutes.newPromotion>): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  const config = promotionConfig[props.params.promotionType]

  if (config == null) {
    return <GenericPageNotFound />
  }

  return (
    <PageLayout
      title={`New ${config.titleNew}`}
      // description='Enter basic details to create the promotion, then set activation rules or coupons to limit its reach after creation.'
      overlay={props.overlay}
      mode={mode}
      gap='only-top'
      navigationButton={{
        label: 'Back',
        onClick() {
          setLocation(appRoutes.newSelectType.makePath({}))
        }
      }}
    >
      <PromotionForm
        promotionConfig={config}
        defaultValues={{
          currency_code: 'USD',
          max_quantity: 1,
          apply_the_discount_to: 'all'
        }}
      />
    </PageLayout>
  )
}

export default Page
