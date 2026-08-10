import {
  EmptyState,
  HomePageLayout,
  Spacer,
  useResourceFilters,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { FC } from "react"
import { useLocation, useRouter } from "wouter"
import { navigate, useSearch } from "wouter/use-browser-location"
import { ListEmptyState } from "#components/ListEmptyState"
import { useSkusTableColumns } from "#components/skusTableColumns"
import { instructions } from "#data/filters"
import { appRoutes } from "#data/routes"

export const SkusList: FC = () => {
  const { canUser } = useTokenProvider()

  const queryString = useSearch()
  const [, setLocation] = useLocation()
  const { base } = useRouter()

  /**
   * The details drawer opens over this list, which stays mounted, so the active
   * filters have to travel with the url — otherwise the table behind the drawer
   * would reload unfiltered and the filters would be lost on close.
   */
  const detailsPath = (skuId: string): string => {
    // `useSearch` returns the search including its leading `?`, so it is
    // normalized rather than concatenated
    const search = new URLSearchParams(queryString).toString()
    return `${appRoutes.details.makePath({ skuId })}${
      search !== "" ? `?${search}` : ""
    }`
  }

  const { FilteredTable, FiltersBar, FiltersDrawer, hasActiveFilter } =
    useResourceFilters({
      instructions,
    })

  const columns = useSkusTableColumns()

  const handleFiltersUpdate = (queryString: string): void => {
    navigate(`?${queryString}`, { replace: true })
  }

  if (!canUser("read", "skus")) {
    return (
      <HomePageLayout title="SKUs">
        <EmptyState title="You are not authorized" />
      </HomePageLayout>
    )
  }

  return (
    <HomePageLayout
      title="SKUs"
      fullWidth
      toolbar={{
        buttons: canUser("create", "skus")
          ? [
              {
                icon: "plus",
                label: "New SKU",
                size: "small",
                onClick: () => {
                  setLocation(appRoutes.new.makePath({}))
                },
              },
            ]
          : undefined,
      }}
    >
      <FiltersBar queryString={queryString} onUpdate={handleFiltersUpdate} />

      <Spacer bottom="14">
        <FilteredTable
          type="skus"
          columns={columns}
          query={{
            pageSize: 25,
            // the `Shipping category` column reads this relationship
            include: ["shipping_category"],
          }}
          defaultSort="code"
          hideTitle
          // a real href keeps cmd/middle-click opening the SKU in a new tab
          getRowHref={(sku) => `${base}${detailsPath(sku.id)}`}
          onRowClick={(sku) => {
            setLocation(detailsPath(sku.id))
          }}
          emptyState={
            <ListEmptyState
              scope={hasActiveFilter ? "userFiltered" : "history"}
            />
          }
        />
      </Spacer>

      <FiltersDrawer onUpdate={handleFiltersUpdate} />
    </HomePageLayout>
  )
}
