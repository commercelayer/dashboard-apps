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
import { type FC, useEffect, useState } from "react"
import { useLocation, useRoute } from "wouter"
import { useSearch } from "wouter/use-browser-location"
import { StockItemInfo } from "#components/StockItemInfo"
import { appRoutes } from "#data/routes"
import { useStockItemDetails } from "#hooks/useStockItemDetails"

export const StockItemDetails: FC = () => {
  const {
    settings: { extras },
    canUser,
  } = useTokenProvider()
  const { goBack } = useAppLinking()

  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ stockItemId: string }>(appRoutes.stockItem.path)
  const stockItemId = params?.stockItemId ?? ""
  const queryString = useSearch()

  const { stockItem, isLoading, error, mutateStockItem } =
    useStockItemDetails(stockItemId)

  const { sdkClient } = useCoreSdkProvider()

  const { Overlay, open, close } = useOverlay()

  // The drawer is driven by the route: open while this component is mounted, and
  // closing means navigating away.
  const { Overlay: DetailsDrawer, open: openDrawer } = useOverlay()

  useEffect(() => {
    openDrawer()
  }, [openDrawer])

  const [isDeleting, setIsDeleting] = useState(false)

  const closeDrawer = (): void => {
    // `goBack` returns to another app when the stock item was opened from one;
    // within the app it falls back to the list, keeping the url's filters.
    const search = new URLSearchParams(queryString).toString()
    goBack({
      currentResourceId: stockItemId,
      defaultRelativePath: appRoutes.home.makePath(search),
    })
  }

  if (error != null) {
    return (
      <DetailsDrawer drawer onBackdropClick={closeDrawer}>
        <div className="p-6">
          <PageHeading
            title="Stock item"
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

  const pageTitle = stockItem?.sku?.name

  const pageToolbar: PageHeadingProps["toolbar"] = {
    buttons: [],
    dropdownItems: [],
  }

  if (canUser("update", "stock_items")) {
    pageToolbar.dropdownItems?.push([
      {
        label: "Edit",
        onClick: () => {
          setLocation(appRoutes.editStockItem.makePath(stockItemId))
        },
      },
    ])
  }

  if (canUser("destroy", "stock_items")) {
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
      "stock_items",
      stockItem.id,
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
              {stockItem?.sku?.code ?? ""}
            </SkeletonTemplate>
          }
          navigationButton={{ onClick: closeDrawer, label: "", icon: "x" }}
          toolbar={pageToolbar}
          gap="only-top"
        />
        <SkeletonTemplate isLoading={isLoading}>
          <Spacer bottom="4">
            <Spacer top="14">
              <StockItemInfo stockItem={stockItem} />
            </Spacer>
            <Spacer top="14">
              <ResourceDetails
                resource={stockItem}
                onUpdated={async () => {
                  void mutateStockItem()
                }}
              />
            </Spacer>
            <Spacer top="14">
              <ResourceMetadata
                resourceId={stockItem.id}
                resourceType="stock_items"
                overlay={{
                  title: pageTitle ?? "",
                }}
              />
            </Spacer>
          </Spacer>
        </SkeletonTemplate>
        {canUser("destroy", "stock_items") && (
          <Overlay backgroundColor="light">
            <PageLayout
              title={`Confirm that you want to cancel the stock item related to ${stockItem?.sku?.code} (${stockItem?.sku?.name}) SKU.`}
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
                  void sdkClient.stock_items
                    .delete(stockItem.id)
                    .then(() => {
                      setLocation(appRoutes.home.makePath())
                    })
                    .catch(() => {})
                }}
                fullWidth
              >
                Delete stock item
              </Button>
            </PageLayout>
          </Overlay>
        )}
      </div>
    </DetailsDrawer>
  )
}
