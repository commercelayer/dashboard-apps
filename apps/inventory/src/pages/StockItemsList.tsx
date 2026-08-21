import {
  EmptyState,
  PageLayout,
  Spacer,
  useResourceFilters,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { useLocation, useRouter } from "wouter"
import { navigate, useSearch } from "wouter/use-browser-location"
import { ListEmptyStateStockItems } from "#components/ListEmptyStateStockItems"
import { useStockItemsTableColumns } from "#components/stockItemsTableColumns"
import { stockItemsInstructions } from "#data/filters"
import { appRoutes } from "#data/routes"

export function StockItemsList(): React.JSX.Element {
  const { canUser } = useTokenProvider()

  const queryString = useSearch()
  const [, setLocation] = useLocation()
  const { base } = useRouter()

  const { FilteredTable, FiltersBar, FiltersDrawer, hasActiveFilter } =
    useResourceFilters({
      instructions: stockItemsInstructions,
    })

  const columns = useStockItemsTableColumns()

  const handleFiltersUpdate = (queryString: string): void => {
    navigate(`?${queryString}`, { replace: true })
  }

  /**
   * The details drawer opens over this list, which stays mounted, so the active
   * filters have to travel with the url — otherwise the table behind the drawer
   * would reload unfiltered and the filters would be lost on close.
   */
  const detailsPath = (stockItemId: string): string =>
    // `useSearch` returns the search including its leading `?`, so it is
    // normalized rather than concatenated
    appRoutes.stockItem.makePath(
      stockItemId,
      new URLSearchParams(queryString).toString(),
    )

  if (!canUser("read", "stock_locations")) {
    return (
      <PageLayout title="Inventory">
        <EmptyState title="You are not authorized" />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Inventory"
      fullWidth
      toolbar={{
        buttons: canUser("create", "stock_items")
          ? [
              {
                icon: "plus",
                label: "New stock item",
                size: "small",
                onClick: () => {
                  setLocation(appRoutes.newStockItem.makePath())
                },
              },
            ]
          : undefined,
      }}
    >
      <FiltersBar queryString={queryString} onUpdate={handleFiltersUpdate} />

      <Spacer bottom="14">
        <FilteredTable
          type="stock_items"
          columns={columns}
          query={{
            pageSize: 25,
            // the SKU, Stock location and Quantity columns read these
            include: ["sku", "reserved_stock", "stock_location"],
          }}
          defaultSort="-updated_at"
          hideTitle
          // a real href keeps cmd/middle-click opening the stock item in a new tab
          getRowHref={(stockItem) => `${base}${detailsPath(stockItem.id)}`}
          onRowClick={(stockItem) => {
            setLocation(detailsPath(stockItem.id))
          }}
          emptyState={
            <ListEmptyStateStockItems
              scope={hasActiveFilter ? "userFiltered" : "history"}
            />
          }
        />
      </Spacer>

      <FiltersDrawer onUpdate={handleFiltersUpdate} />
    </PageLayout>
  )
}
