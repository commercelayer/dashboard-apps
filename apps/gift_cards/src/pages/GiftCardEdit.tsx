import { Form } from '#components/Form'
import { appRoutes } from '#data/routes'
import { useGiftCardDetails } from '#hooks/useGiftCardDetails'
import {
  GenericPageNotFound,
  PageLayout,
  SkeletonTemplate,
  useAppLinking,
  useCoreSdkProvider,
  useTokenProvider,
  type PageProps
} from '@commercelayer/app-elements'
import isEmpty from 'lodash/isEmpty'
import type { FC } from 'react'

const GiftCardEdit: FC<PageProps<typeof appRoutes.edit>> = ({ params }) => {
  const {
    settings: { mode }
  } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const giftCardId = params?.giftCardId
  const { giftCard, isLoading, error } = useGiftCardDetails(params?.giftCardId)
  const { goBack } = useAppLinking()

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
            currentResourceId: giftCardId,
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
          onSubmit={async ({ code, ...formValues }) => {
            return await sdkClient.gift_cards.update({
              id: giftCard.id,
              ...formValues,
              expires_at: formValues.expires_at?.toJSON() ?? null,

              // remove recipient relationship if recipient_email if was set and now is empty
              gift_card_recipient:
                isEmpty(formValues.recipient_email) &&
                giftCard.gift_card_recipient != null
                  ? sdkClient.gift_card_recipients.relationship(null)
                  : undefined,

              market: sdkClient.markets.relationship(
                formValues.market != null && !isEmpty(formValues.market)
                  ? formValues.market
                  : null
              )
            })
          }}
        />
      )}
    </PageLayout>
  )
}

export default GiftCardEdit
