import {
  EmptyState,
  PageLayout,
  Spacer,
  useResourceFilters,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { FC } from "react"
import { useLocation, useRouter } from "wouter"
import { navigate, useSearch } from "wouter/use-browser-location"
import { useExportsTableColumns } from "#components/exportsTableColumns"
import { instructions } from "#data/filters"
import { appRoutes } from "#data/routes"

const ListPage: FC = () => {
  const { canUser } = useTokenProvider()
  const queryString = useSearch()
  const [, setLocation] = useLocation()
  // the anchor needs an absolute path, `setLocation` a base-relative one —
  // the same split `useAppLinking` makes for the apps whose routes it fits
  const { base } = useRouter()

  const { FilteredTable, FiltersBar, FiltersDrawer, hasActiveFilter } =
    useResourceFilters({
      instructions,
    })

  const columns = useExportsTableColumns()

  const handleFiltersUpdate = (queryString: string): void => {
    navigate(`?${queryString}`, { replace: true })
  }

  if (!canUser("read", "exports")) {
    return (
      <PageLayout title="Exports" fullWidth>
        <EmptyState title="You are not authorized" />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Exports"
      fullWidth
      toolbar={{
        buttons: canUser("create", "exports")
          ? [
              {
                icon: "plus",
                label: "New export",
                size: "small",
                onClick: () => {
                  setLocation(appRoutes.selectResource.makePath())
                },
              },
            ]
          : undefined,
      }}
    >
      <FiltersBar queryString={queryString} onUpdate={handleFiltersUpdate} />

      <Spacer bottom="14">
        <FilteredTable
          type="exports"
          columns={columns}
          query={{
            pageSize: 25,
          }}
          defaultSort="-created_at"
          hideTitle
          // this app keeps its details at `/:exportId`, while `navigateTo` builds
          // the `/list/:id` shape every other app uses — so the route is built here
          getRowHref={(job) => `${base}${appRoutes.details.makePath(job.id)}`}
          onRowClick={(job) => {
            setLocation(appRoutes.details.makePath(job.id))
          }}
          emptyState={
            <EmptyState
              title={hasActiveFilter ? "No exports found" : "No exports yet"}
              description={
                hasActiveFilter
                  ? "Try a different search or filter."
                  : "Exported records will show up here."
              }
            />
          }
        />
      </Spacer>

      <FiltersDrawer onUpdate={handleFiltersUpdate} />
    </PageLayout>
  )
}

export default ListPage
