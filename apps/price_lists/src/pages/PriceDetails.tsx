import {
  Button,
  EmptyState,
  PageHeading,
  type PageHeadingProps,
  PageLayout,
  ResourceDetails,
  ResourceMetadata,
  SkeletonTemplate,
  Spacer,
  useAppLinking,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { getResourceModalButton } from "dashboard-apps-common/src/helpers/resourceModal"
import { useEffect, useState } from "react"
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

  const { Overlay, open, close } = useOverlay()

  // The drawer is driven by the route: open while this component is mounted, and
  // closing means navigating away.
  const { Overlay: DetailsDrawer, open: openDrawer } = useOverlay()

  useEffect(() => {
    openDrawer()
  }, [openDrawer])

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

  const [isDeleting, setIsDeleting] = useState(false)

  if (error != null) {
    return (
      <DetailsDrawer drawer onBackdropClick={closeDrawer}>
        <div className="p-6">
          <PageHeading
            title="Price"
            navigationButton={{ onClick: closeDrawer, label: "", icon: "x" }}
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
          setLocation(appRoutes.priceEdit.makePath({ priceId }))
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
          open()
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
          navigationButton={{ onClick: closeDrawer, label: "", icon: "x" }}
          toolbar={pageToolbar}
          gap="only-top"
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
              <ResourceDetails
                resource={price}
                onUpdated={async () => {
                  void mutatePrice()
                }}
              />
            </Spacer>
            <Spacer top="14">
              <ResourceMetadata
                resourceId={price.id}
                resourceType="prices"
                overlay={{
                  title: pageTitle ?? "",
                }}
              />
            </Spacer>
          </Spacer>
        </SkeletonTemplate>
        {canUser("destroy", "prices") && (
          <Overlay backgroundColor="light">
            <PageLayout
              title={`Confirm that you want to delete the price related to ${price?.sku?.code} (${price?.sku?.name}) SKU.`}
              description="This action cannot be undone, proceed with caution."
              minHeight={false}
              navigationButton={{
                onClick: () => {
                  close()
                },
                label: `Cancel`,
                icon: "x",
              }}
            >
              <Button
                variant="danger"
                size="small"
                disabled={isDeleting}
                onClick={(e) => {
                  setIsDeleting(true)
                  e.stopPropagation()
                  void sdkClient.prices
                    .delete(price.id)
                    .then(() => {
                      setLocation(appRoutes.home.makePath({}))
                    })
                    .catch(() => {})
                }}
                fullWidth
              >
                Delete price
              </Button>
            </PageLayout>
          </Overlay>
        )}
      </div>
    </DetailsDrawer>
  )
}
