import {
  Button,
  EmptyState,
  PageHeading,
  type PageHeadingProps,
  removeFromResourceLists,
  SkeletonTemplate,
  Spacer,
  useAppLinking,
  useConfirmDialog,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { ResourceInfoBlocks } from "dashboard-apps-common/src/components/ResourceInfoBlocks"
import { getResourceModalButton } from "dashboard-apps-common/src/helpers/resourceModal"
import { useLocation, useRoute } from "wouter"
import { useSearch } from "wouter/use-browser-location"
import { PriceInfo } from "#components/PriceInfo"
import { PriceTiers } from "#components/PriceTiers"
import { appRoutes } from "#data/routes"
import { usePriceDetails } from "#hooks/usePriceDetails"

export function PriceDetails(): React.JSX.Element {
  const {
    settings: { extras },
    canUser,
  } = useTokenProvider()
  const { goBack } = useAppLinking()

  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ priceId: string }>(appRoutes.priceDetails.path)
  const priceId = params?.priceId ?? ""
  const queryString = useSearch()

  const { price, isLoading, error, mutatePrice } = usePriceDetails(priceId)

  const { sdkClient } = useCoreSdkProvider()

  const { show: showDeleteDialog, ConfirmDialog } = useConfirmDialog()

  // The drawer is driven by the route: open while this component is mounted, and
  // closing means navigating away.
  const { Overlay: DetailsDrawer } = useOverlay({ initialOpen: true })

  const closeDrawer = (): void => {
    // `goBack` returns to another app when the price was opened from one; within
    // the app it falls back to the list, keeping the filters the url carries.
    const search = new URLSearchParams(queryString).toString()
    goBack({
      currentResourceId: priceId,
      defaultRelativePath:
        search !== ""
          ? appRoutes.home.makePath({}, search)
          : appRoutes.home.makePath({}),
    })
  }

  if (error != null) {
    return (
      <DetailsDrawer drawer onBackdropClick={closeDrawer}>
        <div className="p-6">
          <PageHeading
            title="Price"
            gap="none"
            navigationButton={{
              onClick: closeDrawer,
              label: "",
              icon: "x",
              variant: "button",
            }}
          />
          <EmptyState
            title="Not authorized"
            action={
              <Button variant="primary" onClick={closeDrawer}>
                Go back
              </Button>
            }
          />
        </div>
      </DetailsDrawer>
    )
  }

  const pageTitle = price?.sku?.name

  const pageToolbar: PageHeadingProps["toolbar"] = {
    buttons: [],
    dropdownItems: [],
  }

  if (canUser("update", "prices")) {
    pageToolbar.dropdownItems?.push([
      {
        label: "Edit",
        onClick: () => {
          setLocation(
            appRoutes.priceEdit.makePath(
              { priceId },
              new URLSearchParams(queryString).toString(),
            ),
          )
        },
      },
    ])
  }

  // its own group, so a divider separates the destructive action
  if (canUser("destroy", "prices")) {
    pageToolbar.dropdownItems?.push([
      {
        label: "Delete",
        onClick: () => {
          showDeleteDialog()
        },
      },
    ])
  }

  if (extras?.openResourceModal != null) {
    const resourceInspectorButton = getResourceModalButton(
      "prices",
      price.id,
      extras,
    )
    pageToolbar.buttons?.push(resourceInspectorButton)
  }

  return (
    <DetailsDrawer drawer onBackdropClick={closeDrawer}>
      <div className="p-6">
        <PageHeading
          title={
            <SkeletonTemplate isLoading={isLoading}>
              {pageTitle}
            </SkeletonTemplate>
          }
          description={
            <SkeletonTemplate isLoading={isLoading}>
              {price?.sku?.code ?? ""}
            </SkeletonTemplate>
          }
          navigationButton={{
            onClick: closeDrawer,
            label: "",
            icon: "x",
            variant: "button",
          }}
          toolbar={pageToolbar}
          gap="none"
        />
        <SkeletonTemplate isLoading={isLoading}>
          <Spacer bottom="4">
            <Spacer top="14">
              <PriceInfo price={price} />
            </Spacer>
            <Spacer top="14">
              <PriceTiers
                price={price}
                mutatePrice={mutatePrice}
                type="volume"
              />
            </Spacer>
            <Spacer top="14">
              <PriceTiers
                price={price}
                mutatePrice={mutatePrice}
                type="frequency"
              />
            </Spacer>
            <Spacer top="14">
              <ResourceInfoBlocks
                resource={price}
                title={pageTitle ?? ""}
                onUpdated={async () => {
                  void mutatePrice()
                }}
              />
            </Spacer>
            <Spacer top="14"></Spacer>
          </Spacer>
        </SkeletonTemplate>
        {canUser("destroy", "prices") && (
          <ConfirmDialog
            icon="trash"
            title={`Delete price for ${price?.sku?.code}`}
            description="This action cannot be undone."
            confirm={{
              label: "Delete price",
              variant: "danger",
              onClick: async () => {
                await sdkClient.prices.delete(price.id)
                // the list stays mounted under this drawer, so it has to be told
                removeFromResourceLists("prices", price.id)
                setLocation(appRoutes.home.makePath({}))
              },
            }}
          />
        )}
      </div>
    </DetailsDrawer>
  )
}
