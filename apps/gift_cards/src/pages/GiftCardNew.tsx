import { Form } from '#components/Form'
import { appRoutes } from '#data/routes'
import {
  PageLayout,
  goBack,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import isEmpty from 'lodash/isEmpty'
import type { FC } from 'react'
import { useLocation } from 'wouter'

const GiftCardNew: FC = () => {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const { sdkClient } = useCoreSdkProvider()

  return (
    <PageLayout
      mode={mode}
      overlay
      title='New gift card'
      navigationButton={{
        onClick: () => {
          goBack({
            setLocation,
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
            // @ts-expect-error wrong type from SDK
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
