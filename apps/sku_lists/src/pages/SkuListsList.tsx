import {
  Button,
  EmptyState,
  PageLayout,
  Spacer,
  useResourceFilters,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { Link, useLocation, useRouter } from "wouter"
import { navigate, useSearch } from "wouter/use-browser-location"
import { useSkuListsTableColumns } from "#components/skuListsTableColumns"
import { instructions } from "#data/filters"
import { appRoutes } from "#data/routes"

export function SkuListsList(): React.JSX.Element {
  const { canUser } = useTokenProvider()

  const queryString = useSearch()
  const [, setLocation] = useLocation()
  const { base } = useRouter()

  /**
   * The details drawer opens over this list, which stays mounted, so the active
   * search has to travel with the url — otherwise the table behind the drawer
   * would reload unsearched and the term would be lost on close.
   */
  const detailsPath = (skuListId: string): string => {
    // `useSearch` returns the search including its leading `?`, so it is
    // normalized rather than concatenated
    const search = new URLSearchParams(queryString).toString()
    return `${appRoutes.details.makePath({ skuListId })}${
      search !== "" ? `?${search}` : ""
    }`
  }

  // search only: the instructions hold no filters, so `FiltersBar` renders the
  // search bar without a filters button and no drawer is needed
  const { FilteredTable, FiltersBar, hasActiveFilter } = useResourceFilters({
    instructions,
  })

  const columns = useSkuListsTableColumns()

  const newSkuListButton = canUser("create", "sku_lists") && (
    <Link href={appRoutes.new.makePath({})}>
      <Button variant="primary">Add a SKU list</Button>
    </Link>
  )

  if (!canUser("read", "sku_lists")) {
    return (
      <PageLayout title="SKU Lists">
        <EmptyState title="You are not authorized" />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="SKU Lists"
      fullWidth
      toolbar={{
        buttons: canUser("create", "sku_lists")
          ? [
              {
                icon: "plus",
                label: "New SKU list",
                size: "small",
                onClick: () => {
                  setLocation(appRoutes.new.makePath({}))
                },
              },
            ]
          : undefined,
      }}
    >
      <FiltersBar
        queryString={queryString}
        onUpdate={(qs) => {
          navigate(`?${qs}`, { replace: true })
        }}
      />

      <Spacer bottom="14">
        <FilteredTable
          type="sku_lists"
          columns={columns}
          query={{ pageSize: 25 }}
          defaultSort="-created_at"
          hideTitle
          // a real href keeps cmd/middle-click opening the list in a new tab
          getRowHref={(skuList) => `${base}${detailsPath(skuList.id)}`}
          onRowClick={(skuList) => {
            setLocation(detailsPath(skuList.id))
          }}
          emptyState={
            hasActiveFilter ? (
              <EmptyState
                title="No SKU lists found!"
                description={
                  <div>
                    <p>We didn't find any SKU lists matching the search.</p>
                  </div>
                }
                action={newSkuListButton}
              />
            ) : (
              <EmptyState title="No SKU lists yet!" action={newSkuListButton} />
            )
          }
        />
      </Spacer>
    </PageLayout>
  )
}
