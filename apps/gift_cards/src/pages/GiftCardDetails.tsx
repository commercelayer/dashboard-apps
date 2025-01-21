import { BalanceLog } from '#components/BalanceLog'
import { DetailsImage } from '#components/DetailsImage'
import { DetailsInfo } from '#components/DetailsInfo'
import { DetailsRecap } from '#components/DetailsRecap'
import { appRoutes } from '#data/routes'
import { useDeleteOverlay } from '#hooks/useDeleteOverlay'
import {
  giftCardIncludeAttribute,
  useGiftCardDetails
} from '#hooks/useGiftCardDetails'
import { isMockedId } from '#mocks'
import { maskGiftCardCode } from '#utils/code'
import {
  GenericPageNotFound,
  PageLayout,
  ResourceDetails,
  ResourceMetadata,
  ResourceTags,
  SkeletonTemplate,
  Spacer,
  useAppLinking,
  useCoreSdkProvider,
  useTokenProvider,
  type PageLayoutProps,
  type PageProps
} from '@commercelayer/app-elements'
import { useMemo, useState, type FC } from 'react'
import { useLocation } from 'wouter'

const GiftCardDetails: FC<PageProps<typeof appRoutes.details>> = ({
  params
}) => {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const { sdkClient } = useCoreSdkProvider()
  const { canUser } = useTokenProvider()
  const { goBack } = useAppLinking()

  const giftCardId = params?.giftCardId
  const { giftCard, isLoading, error, mutateGiftCard } =
    useGiftCardDetails(giftCardId)

  const { DeleteOverlay, openDeleteOverlay } = useDeleteOverlay()
  const [isUpdating, setIsUpdating] = useState(false)

  const toolbarButtons = useMemo<
    NonNullable<PageLayoutProps['toolbar']>['buttons']
  >(() => {
    if (!canUser('update', 'gift_cards')) {
      return []
    }

    if (['inactive'].includes(giftCard.status)) {
      return [
        {
          label: 'Activate',
          size: 'small',
          disabled: isUpdating,
          onClick: () => {
            setIsUpdating(true)
            void sdkClient.gift_cards
              ._activate(giftCard.id, {
                include: giftCardIncludeAttribute
              })
              .then(mutateGiftCard)
              .finally(() => {
                setIsUpdating(false)
              })
          }
        }
      ]
    }

    if (['draft'].includes(giftCard.status)) {
      return [
        {
          label: 'Purchase',
          size: 'small',
          disabled: isUpdating,
          onClick: () => {
            setIsUpdating(true)
            void sdkClient.gift_cards
              ._purchase(giftCard.id, {
                include: giftCardIncludeAttribute
              })
              .then(mutateGiftCard)
              .finally(() => {
                setIsUpdating(false)
              })
          }
        }
      ]
    }

    if (['active'].includes(giftCard.status)) {
      return [
        {
          label: 'Deactivate',
          size: 'small',
          disabled: isUpdating,
          onClick: () => {
            setIsUpdating(true)
            void sdkClient.gift_cards
              ._deactivate(giftCard.id, {
                include: giftCardIncludeAttribute
              })
              .then(mutateGiftCard)
              .finally(() => {
                setIsUpdating(false)
              })
          }
        }
      ]
    }

    return []
  }, [giftCard, isUpdating])

  const toolbarDropdownItems = useMemo<
    NonNullable<PageLayoutProps['toolbar']>['dropdownItems']
  >(() => {
    return [
      [
        canUser('update', 'gift_cards') && {
          label: 'Edit',
          onClick: () => {
            setLocation(appRoutes.edit.makePath({ giftCardId }))
          }
        }
      ].filter((o) => o !== false),
      [
        canUser('destroy', 'gift_cards') && {
          label: 'Delete',
          onClick: () => {
            openDeleteOverlay()
          }
        }
      ].filter((o) => o !== false)
    ]
  }, [giftCard])

  if (error != null) {
    return <GenericPageNotFound />
  }

  return (
    <PageLayout
      mode={mode}
      isLoading={isLoading}
      title={`Gift card ${giftCard?.formatted_initial_balance}`}
      navigationButton={{
        onClick: () => {
          goBack({
            currentResourceId: giftCardId,
            defaultRelativePath: appRoutes.list.makePath({})
          })
        },
        label: 'Back',
        icon: 'arrowLeft'
      }}
      gap='only-top'
      scrollToTop
      toolbar={{
        buttons: toolbarButtons,
        dropdownItems: toolbarDropdownItems
      }}
    >
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer top='14'>
          <DetailsRecap giftCard={giftCard} />
        </Spacer>
        <Spacer top='14'>
          <DetailsInfo giftCard={giftCard} />
        </Spacer>
        <Spacer top='14'>
          <DetailsImage giftCard={giftCard} />
        </Spacer>
        <Spacer top='14'>
          <BalanceLog giftCard={giftCard} />
        </Spacer>
        <Spacer top='14'>
          <ResourceDetails
            resource={giftCard}
            onUpdated={async () => {
              void mutateGiftCard()
            }}
          />
        </Spacer>
        {!isMockedId(giftCard.id) && (
          <>
            <Spacer top='14'>
              <ResourceTags
                resourceType='gift_cards'
                resourceId={giftCard.id}
                overlay={{
                  title: `Gift card ${giftCard?.formatted_initial_balance}`
                }}
              />
            </Spacer>
            <Spacer top='14'>
              <ResourceMetadata
                resourceType='gift_cards'
                resourceId={giftCard.id}
                overlay={{
                  title: `Gift card ${giftCard?.formatted_initial_balance}`
                }}
              />
            </Spacer>
          </>
        )}
      </SkeletonTemplate>

      <DeleteOverlay
        title={`Confirm that you want to delete the gift card ending with ${maskGiftCardCode(giftCard.code)} with balance ${giftCard?.formatted_balance}?`}
        onDelete={async () => {
          // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
          return await sdkClient.gift_cards.delete(giftCard.id).then(() => {
            setLocation(appRoutes.list.makePath({}))
          })
        }}
      />
    </PageLayout>
  )
}

export default GiftCardDetails
