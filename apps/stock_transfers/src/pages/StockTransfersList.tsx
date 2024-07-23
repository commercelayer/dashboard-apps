import { ListEmptyState } from '#components/ListEmptyState'
import { ListItemStockTransfer } from '#components/ListItemStockTransfer'
import { instructions } from '#data/filters'
import { presets } from '#data/lists'
import { appRoutes } from '#data/routes'
import {
  PageLayout,
  Spacer,
  useResourceFilters,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'
import { navigate, useSearch } from 'wouter/use-browser-location'

export function StockTransfersList(): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()

  const queryString = useSearch()
  const [, setLocation] = useLocation()

  const { SearchWithNav, FilteredList, viewTitle, hasActiveFilter } =
    useResourceFilters({
      instructions
    })

  const hideFiltersNav = !(
    viewTitle == null || viewTitle === presets.history.viewTitle
  )

  return (
    <PageLayout
      title={viewTitle ?? presets.history.viewTitle}
      mode={mode}
      gap='only-top'
      navigationButton={{
        onClick: () => {
          setLocation(appRoutes.home.makePath({}))
        },
        label: 'Stock Transfers',
        icon: 'arrowLeft'
      }}
    >
      <SearchWithNav
        queryString={queryString}
        onUpdate={(qs) => {
          navigate(`?${qs}`, {
            replace: true
          })
        }}
        onFilterClick={(queryString) => {
          setLocation(appRoutes.filters.makePath({}, queryString))
        }}
        hideFiltersNav={hideFiltersNav}
      />

      <Spacer bottom='14'>
        <FilteredList
          type='stock_transfers'
          ItemTemplate={ListItemStockTransfer}
          query={{
            fields: {
              stock_transfers: [
                'id',
                'number',
                'updated_at',
                'status',
                'origin_stock_location',
                'destination_stock_location'
              ]
            },
            include: ['origin_stock_location', 'destination_stock_location'],
            pageSize: 25,
            sort: {
              updated_at: 'desc'
            }
          }}
          emptyState={
            <ListEmptyState
              scope={
                hasActiveFilter
                  ? 'userFiltered'
                  : viewTitle !== presets.history.viewTitle
                    ? 'presetView'
                    : 'history'
              }
            />
          }
        />
      </Spacer>
    </PageLayout>
  )
}
