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

const GiftCardEdit: FC<PageProps<typeof appRoutes.edit>> = ({ params }) => {
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
      gap='only-top'
      scrollToTop
    >
      <SkeletonTemplate isLoading={isLoading}>
        <div>Gift card edit page for id {giftCard?.id}</div>
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default GiftCardEdit
