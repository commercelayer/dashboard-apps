import {
  PageLayout,
  Spacer,
  useResourceFilters,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { useLocation } from "wouter"
import { navigate, useSearch } from "wouter/use-browser-location"
import { ListEmptyState } from "#components/ListEmptyState"
import { useTagsTableColumns } from "#components/tagsTableColumns"
import { instructions } from "#data/filters"
import { appRoutes } from "#data/routes"

export function TagList(): React.JSX.Element {
  const { canUser } = useTokenProvider()
  const [, setLocation] = useLocation()

  const queryString = useSearch()

  const { FilteredTable, FiltersBar, FiltersDrawer, hasActiveFilter } =
    useResourceFilters({
      instructions,
    })

  const columns = useTagsTableColumns()

  const handleFiltersUpdate = (queryString: string): void => {
    navigate(`?${queryString}`, { replace: true })
  }

  return (
    <PageLayout
      title="Tags"
      fullWidth
      toolbar={{
        buttons: canUser("create", "tags")
          ? [
              {
                icon: "plus",
                label: "New tag",
                size: "small",
                onClick: () => {
                  setLocation(appRoutes.new.makePath())
                },
              },
            ]
          : undefined,
      }}
    >
      {/* no tabs: a tag has no status to group by */}
      <FiltersBar queryString={queryString} onUpdate={handleFiltersUpdate} />

      <Spacer bottom="14">
        <FilteredTable
          type="tags"
          columns={columns}
          query={{
            fields: {
              tags: ["id", "name", "created_at", "updated_at"],
            },
            pageSize: 25,
          }}
          defaultSort="name"
          hideTitle
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
