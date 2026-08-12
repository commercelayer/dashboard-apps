import {
  EmptyState,
  PageLayout,
  Spacer,
  useAppLinking,
  useResourceFilters,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { FC } from "react"
import { useLocation } from "wouter"
import { navigate, useSearch } from "wouter/use-browser-location"
import { useBundlesTableColumns } from "#components/bundlesTableColumns"
import { ListEmptyState } from "#components/ListEmptyState"
import { instructions } from "#data/filters"
import { appRoutes } from "#data/routes"

export const BundlesList: FC = () => {
  const { canUser } = useTokenProvider()
  const { navigateTo } = useAppLinking()

  const queryString = useSearch()
  const [, setLocation] = useLocation()

  const { FilteredTable, FiltersBar, FiltersDrawer, hasActiveFilter } =
    useResourceFilters({
      instructions,
    })

  const columns = useBundlesTableColumns()

  const handleFiltersUpdate = (queryString: string): void => {
    navigate(`?${queryString}`, { replace: true })
  }

  if (!canUser("read", "bundles")) {
    return (
      <PageLayout title="Bundles" fullWidth>
        <EmptyState title="You are not authorized" />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Bundles"
      fullWidth
      toolbar={{
        buttons: canUser("create", "bundles")
          ? [
              {
                icon: "plus",
                label: "New bundle",
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
          type="bundles"
          columns={columns}
          query={{
            fields: {
              bundles: [
                "id",
                "name",
                "code",
                "image_url",
                "currency_code",
                "formatted_price_amount",
                "formatted_compare_at_amount",
                "created_at",
                "updated_at",
                "market",
              ],
              markets: ["id", "name"],
            },
            // the Market column reads this relationship
            include: ["market"],
            pageSize: 25,
          }}
          defaultSort="name"
          hideTitle
          getRowHref={(bundle) =>
            navigateTo({ app: "bundles", resourceId: bundle.id })?.href
          }
          onRowClick={(bundle, event) => {
            navigateTo({ app: "bundles", resourceId: bundle.id })?.onClick(
              event as React.MouseEvent<HTMLAnchorElement>,
            )
          }}
          emptyState={
            <ListEmptyState
              scope={hasActiveFilter ? "userFiltered" : "history"}
            />
          }
        />
      </Spacer>

      <FiltersDrawer onUpdate={handleFiltersUpdate} />
    </PageLayout>
  )
}
