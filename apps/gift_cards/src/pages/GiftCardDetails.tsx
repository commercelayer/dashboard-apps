import { GenericPageNotFound } from '#components/Routes'
import { appRoutes, type PageProps } from '#data/routes'
import { useGiftCardDetails } from '#hooks/useGiftCardDetails'
import {
  PageLayout,
  SkeletonTemplate,
  goBack,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { FC } from 'react'
import { useLocation } from 'wouter'

const GiftCardDetails: FC<PageProps<typeof appRoutes.details>> = ({
  params
}) => {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  const giftCardId = params?.giftCardId

  const { giftCard, isLoading, error } = useGiftCardDetails(giftCardId)

  if (error != null) {
    return <GenericPageNotFound />
  }

  return (
    <PageLayout
      mode={mode}
      title={
        <SkeletonTemplate isLoading={isLoading}>
          {`Gift card ${giftCard?.formatted_balance}`}
        </SkeletonTemplate>
      }
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
      gap='only-top'
      scrollToTop
    >
      <SkeletonTemplate isLoading={isLoading}>
        <div>Gift card details page {giftCard?.id}</div>
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default GiftCardDetails
