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
import type { FC } from "react"
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

  const { show: showDeleteDialog, ConfirmDialog } = useConfirmDialog()

  // The drawer is driven by the route: open while this component is mounted, and
  // closing means navigating away.
  const { Overlay: DetailsDrawer } = useOverlay({ initialOpen: true })

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
          setLocation(
            appRoutes.editStockItem.makePath(
              stockItemId,
              new URLSearchParams(queryString).toString(),
            ),
          )
        },
      },
    ])
  }

  if (canUser("destroy", "stock_items")) {
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
              <StockItemInfo stockItem={stockItem} />
            </Spacer>
            <Spacer top="14">
              <ResourceInfoBlocks
                resource={stockItem}
                title={pageTitle ?? ""}
                onUpdated={async () => {
                  void mutateStockItem()
                }}
              />
            </Spacer>
          </Spacer>
        </SkeletonTemplate>
        {canUser("destroy", "stock_items") && (
          <ConfirmDialog
            icon="trash"
            title={`Delete stock item for ${stockItem?.sku?.code}`}
            description="This action cannot be undone."
            confirm={{
              label: "Delete stock item",
              variant: "danger",
              onClick: async () => {
                await sdkClient.stock_items.delete(stockItem.id)
                // the list stays mounted under this drawer, so it has to be told
                removeFromResourceLists("stock_items", stockItem.id)
                setLocation(
                  appRoutes.home.makePath(
                    new URLSearchParams(queryString).toString(),
                  ),
                )
              },
            }}
          />
        )}
      </div>
    </DetailsDrawer>
  )
}
