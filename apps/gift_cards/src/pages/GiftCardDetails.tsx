import {
  GenericPageNotFound,
  maskGiftCardCode,
  PageHeading,
  type PageHeadingProps,
  type PageProps,
  SkeletonTemplate,
  Spacer,
  Tab,
  Tabs,
  useAppLinking,
  useConfirmDialog,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { ResourceInfoBlocks } from "dashboard-apps-common/src/components/ResourceInfoBlocks"
import { getResourceModalButton } from "dashboard-apps-common/src/helpers/resourceModal"
import { type FC, useMemo, useState } from "react"
import { useLocation } from "wouter"
import { useSearch } from "wouter/use-browser-location"
import { BalanceLog } from "#components/BalanceLog"
import { DetailsImage } from "#components/DetailsImage"
import { DetailsInfo } from "#components/DetailsInfo"
import { DetailsRecap } from "#components/DetailsRecap"
import { GiftCardTimeline } from "#components/GiftCardTimeline"
import { appRoutes } from "#data/routes"
import {
  giftCardIncludeAttribute,
  useGiftCardDetails,
} from "#hooks/useGiftCardDetails"

const GiftCardDetails: FC<PageProps<typeof appRoutes.details>> = ({
  params,
}) => {
  const {
    settings: { extras },
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const { sdkClient } = useCoreSdkProvider()
  const { canUser } = useTokenProvider()
  const { goBack } = useAppLinking()

  const giftCardId = params?.giftCardId
  const { giftCard, isLoading, error, mutateGiftCard } =
    useGiftCardDetails(giftCardId)

  const queryString = useSearch()

  // The drawer is driven by the route: it is open for as long as this component
  // is mounted, and closing it means navigating away.
  const { Overlay: DetailsDrawer } = useOverlay({ initialOpen: true })

  const closeDrawer = (): void => {
    // `goBack` returns to another app when the gift card was opened from one;
    // within the app it falls back to the list, keeping the url's filters.
    const search = new URLSearchParams(queryString).toString()
    goBack({
      currentResourceId: giftCardId,
      defaultRelativePath:
        search !== ""
          ? appRoutes.home.makePath({}, search)
          : appRoutes.home.makePath({}),
    })
  }

  const { show: showDeleteDialog, ConfirmDialog } = useConfirmDialog()
  const [isUpdating, setIsUpdating] = useState(false)

  const toolbarButtons = useMemo<
    NonNullable<PageHeadingProps["toolbar"]>["buttons"]
  >(() => {
    const otherToolbarButtons = []
    if (extras?.openResourceModal != null) {
      const resourceInspectorButton = getResourceModalButton(
        "gift_cards",
        giftCardId,
        extras,
      )
      otherToolbarButtons.push(resourceInspectorButton)
    }

    if (!canUser("update", "gift_cards")) {
      return [...otherToolbarButtons]
    }

    if (["inactive"].includes(giftCard.status)) {
      return [
        {
          label: "Activate",
          size: "small",
          disabled: isUpdating,
          onClick: () => {
            setIsUpdating(true)
            void sdkClient.gift_cards
              ._activate(giftCard.id, {
                include: giftCardIncludeAttribute,
              })
              .then(mutateGiftCard)
              .finally(() => {
                setIsUpdating(false)
              })
          },
        },
        ...otherToolbarButtons,
      ]
    }

    if (["draft"].includes(giftCard.status)) {
      return [
        {
          label: "Purchase",
          size: "small",
          disabled: isUpdating,
          onClick: () => {
            setIsUpdating(true)
            void sdkClient.gift_cards
              ._purchase(giftCard.id, {
                include: giftCardIncludeAttribute,
              })
              .then(mutateGiftCard)
              .finally(() => {
                setIsUpdating(false)
              })
          },
        },
        ...otherToolbarButtons,
      ]
    }

    if (["active"].includes(giftCard.status)) {
      return [
        {
          label: "Deactivate",
          size: "small",
          disabled: isUpdating,
          onClick: () => {
            setIsUpdating(true)
            void sdkClient.gift_cards
              ._deactivate(giftCard.id, {
                include: giftCardIncludeAttribute,
              })
              .then(mutateGiftCard)
              .finally(() => {
                setIsUpdating(false)
              })
          },
        },
        ...otherToolbarButtons,
      ]
    }

    return []
  }, [giftCard, isUpdating])

  const toolbarDropdownItems = useMemo<
    NonNullable<PageHeadingProps["toolbar"]>["dropdownItems"]
  >(() => {
    return [
      [
        canUser("update", "gift_cards") && {
          label: "Edit",
          onClick: () => {
            setLocation(appRoutes.edit.makePath({ giftCardId }))
          },
        },
      ].filter((o) => o !== false),
      [
        canUser("destroy", "gift_cards") && {
          label: "Delete",
          onClick: () => {
            showDeleteDialog()
          },
        },
      ].filter((o) => o !== false),
    ]
  }, [giftCard])

  if (error != null) {
    return <GenericPageNotFound />
  }

  return (
    <DetailsDrawer drawer onBackdropClick={closeDrawer}>
      <div className="p-6">
        <PageHeading
          title={
            <SkeletonTemplate isLoading={isLoading}>
              {`Gift card ${giftCard?.formatted_initial_balance}`}
            </SkeletonTemplate>
          }
          description={
            <SkeletonTemplate isLoading={isLoading}>
              {maskGiftCardCode(giftCard.code)}
            </SkeletonTemplate>
          }
          navigationButton={{
            onClick: closeDrawer,
            label: "",
            icon: "x",
            variant: "button",
          }}
          toolbar={{
            buttons: toolbarButtons,
            dropdownItems: toolbarDropdownItems,
          }}
          gap="none"
        />
        <SkeletonTemplate isLoading={isLoading}>
          <Spacer top="14">
            <DetailsRecap giftCard={giftCard} />
          </Spacer>
          <Spacer top="14">
            <Tabs>
              <Tab name="Overview">
                <Spacer top="6">
                  <DetailsInfo giftCard={giftCard} />
                </Spacer>
                <Spacer top="14">
                  <DetailsImage giftCard={giftCard} />
                </Spacer>
                <Spacer top="14">
                  <ResourceInfoBlocks
                    resource={giftCard}
                    title={`Gift card ${giftCard?.formatted_initial_balance}`}
                    onUpdated={async () => {
                      void mutateGiftCard()
                    }}
                  />
                </Spacer>
                <Spacer top="14">
                  <GiftCardTimeline giftCard={giftCard} />
                </Spacer>
              </Tab>
              <Tab name="Balance log">
                <Spacer top="6">
                  <BalanceLog giftCardId={giftCard.id} />
                </Spacer>
              </Tab>
            </Tabs>
          </Spacer>
        </SkeletonTemplate>

        {canUser("destroy", "gift_cards") && (
          <ConfirmDialog
            icon="trash"
            title={`Delete gift card ${maskGiftCardCode(giftCard.code)}`}
            description="This action cannot be undone."
            confirm={{
              label: "Delete gift card",
              variant: "danger",
              onClick: async () => {
                await sdkClient.gift_cards.delete(giftCard.id)
                setLocation(appRoutes.home.makePath({}))
              },
            }}
          />
        )}
      </div>
    </DetailsDrawer>
  )
}

export default GiftCardDetails
