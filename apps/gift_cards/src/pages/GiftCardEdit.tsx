import { Form } from '#components/Form'
import { appRoutes } from '#data/routes'
import { useGiftCardDetails } from '#hooks/useGiftCardDetails'
import {
  GenericPageNotFound,
  PageLayout,
  SkeletonTemplate,
  goBack,
  useCoreSdkProvider,
  useTokenProvider,
  type PageProps
} from '@commercelayer/app-elements'
import type { FC } from 'react'
import { useLocation } from 'wouter'

const GiftCardEdit: FC<PageProps<typeof appRoutes.edit>> = ({ params }) => {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const { sdkClient } = useCoreSdkProvider()
  const giftCardId = params?.giftCardId
  const { giftCard, isLoading, error } = useGiftCardDetails(params?.giftCardId)

  if (error != null) {
    return <GenericPageNotFound />
  }

  return (
    <PageLayout
      mode={mode}
      overlay
      title={
        <SkeletonTemplate isLoading={isLoading}>Edit card</SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          goBack({
            setLocation,
            defaultRelativePath: appRoutes.details.makePath({
              giftCardId
            })
          })
        },
        label: 'Back',
        icon: 'arrowLeft'
      }}
      scrollToTop
    >
      {giftCard != null && (
        <Form
          giftCard={giftCard}
          onSubmit={async (formValues) =>
            await sdkClient.gift_cards.update({
              id: giftCard.id,
              ...formValues,
              expires_at: formValues.expires_at?.toJSON(),
              // @ts-expect-error wrong type from SDK
              balance_max_cents: formValues.balance_max_cents,
              market:
                formValues.market != null
                  ? sdkClient.markets.relationship(formValues.market)
                  : null
            })
          }
        />
      )}
    </PageLayout>
  )
}

export default GiftCardEdit
