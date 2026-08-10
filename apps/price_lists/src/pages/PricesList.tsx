import {
  EmptyState,
  PageLayout,
  Spacer,
  useResourceFilters,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { useLocation, useRouter } from "wouter"
import { navigate, useSearch } from "wouter/use-browser-location"
import { ListEmptyStatePrice } from "#components/ListEmptyStatePrice"
import { usePricesTableColumns } from "#components/pricesTableColumns"
import { filterInstructions } from "#data/filters"
import { appRoutes } from "#data/routes"

export function PricesList(): React.JSX.Element {
  const { canUser } = useTokenProvider()

  const queryString = useSearch()
  const [, setLocation] = useLocation()
  const { base } = useRouter()

  const { FilteredTable, FiltersBar, FiltersDrawer, hasActiveFilter } =
    useResourceFilters({
      instructions: filterInstructions,
    })

  const columns = usePricesTableColumns()

  const handleFiltersUpdate = (queryString: string): void => {
    navigate(`?${queryString}`, { replace: true })
  }

  /**
   * The details drawer opens over this list, which stays mounted, so the active
   * filters have to travel with the url — otherwise the table behind the drawer
   * would reload unfiltered and the filters would be lost on close.
   */
  const detailsPath = (priceId: string): string => {
    // `useSearch` returns the search including its leading `?`, so it is
    // normalized rather than concatenated
    const search = new URLSearchParams(queryString).toString()
    return `${appRoutes.priceDetails.makePath({ priceId })}${
      search !== "" ? `?${search}` : ""
    }`
  }

  if (!canUser("read", "price_lists") || !canUser("read", "prices")) {
    return (
      <PageLayout title="Prices">
        <EmptyState title="You are not authorized" />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Prices"
      fullWidth
      toolbar={{
        buttons: canUser("create", "prices")
          ? [
              {
                icon: "plus",
                label: "New price",
                size: "small",
                onClick: () => {
                  setLocation(appRoutes.priceNew.makePath({}))
                },
              },
            ]
          : undefined,
      }}
    >
      <FiltersBar queryString={queryString} onUpdate={handleFiltersUpdate} />

      <Spacer bottom="14">
        <FilteredTable
          type="prices"
          columns={columns}
          query={{
            pageSize: 25,
            // the SKU and Price list columns read these relationships
            include: ["sku", "price_list"],
          }}
          defaultSort="-updated_at"
          hideTitle
          // a real href keeps cmd/middle-click opening the price in a new tab
          getRowHref={(price) => `${base}${detailsPath(price.id)}`}
          onRowClick={(price) => {
            setLocation(detailsPath(price.id))
          }}
          emptyState={
            <ListEmptyStatePrice
              scope={hasActiveFilter ? "userFiltered" : "history"}
            />
          }
        />
      </Spacer>

      <FiltersDrawer onUpdate={handleFiltersUpdate} />
    </PageLayout>
  )
}
