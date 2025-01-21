import { Form } from '#components/Form'
import { appRoutes } from '#data/routes'
import {
  PageLayout,
  useAppLinking,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import isEmpty from 'lodash/isEmpty'
import type { FC } from 'react'

const GiftCardNew: FC = () => {
  const {
    settings: { mode }
  } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const { goBack } = useAppLinking()

  return (
    <PageLayout
      mode={mode}
      overlay
      title='New gift card'
      navigationButton={{
        onClick: () => {
          goBack({
            defaultRelativePath: appRoutes.list.makePath({})
          })
        },
        label: 'Back',
        icon: 'arrowLeft'
      }}
      scrollToTop
    >
      <Form
        onSubmit={async (formValues) => {
          const newGiftCard = await sdkClient.gift_cards.create({
            ...formValues,
            expires_at: formValues.expires_at?.toJSON(),
            balance_max_cents: formValues.balance_max_cents,
            market: sdkClient.markets.relationship(
              formValues.market != null && !isEmpty(formValues.market)
                ? formValues.market
                : null
            )
          })
          await sdkClient.gift_cards._purchase(newGiftCard.id)
          return newGiftCard
        }}
      />
    </PageLayout>
  )
}

export default GiftCardNew
