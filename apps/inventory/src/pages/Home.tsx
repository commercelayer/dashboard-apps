import { ListEmptyStateStockLocations } from '#components/ListEmptyStateStockLocations'
import { ListItemStockLocation } from '#components/ListItemStockLocation'
import { stockLocationsInstructions } from '#data/filters'
import {
  EmptyState,
  HomePageLayout,
  useResourceFilters,
  useTokenProvider
} from '@commercelayer/app-elements'
import { navigate, useSearch } from 'wouter/use-browser-location'

export function Home(): JSX.Element {
  const { canUser } = useTokenProvider()

  const queryString = useSearch()

  const { SearchWithNav, FilteredList, hasActiveFilter } = useResourceFilters({
    instructions: stockLocationsInstructions
  })

  if (!canUser('read', 'stock_locations')) {
    return (
      <HomePageLayout title='Inventory'>
        <EmptyState title='You are not authorized' />
      </HomePageLayout>
    )
  }

  return (
    <HomePageLayout title='Inventory'>
      <SearchWithNav
        queryString={queryString}
        onUpdate={(qs) => {
          navigate(`?${qs}`, {
            replace: true
          })
        }}
        onFilterClick={() => {}}
        hideFiltersNav
      />
      <FilteredList
        type='stock_locations'
        query={{
          sort: {
            created_at: 'desc'
          }
        }}
        ItemTemplate={ListItemStockLocation}
        emptyState={
          <ListEmptyStateStockLocations
            scope={hasActiveFilter ? 'userFiltered' : 'history'}
          />
        }
      />
    </HomePageLayout>
  )
}
