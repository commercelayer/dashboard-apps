import { ListItemShipment } from '#components/ListItemShipment'
import { filtersInstructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import {
  EmptyState,
  PageLayout,
  Spacer,
  useResourceFilters,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'
import { navigate, useSearch } from 'wouter/use-browser-location'

export function ShipmentList(): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()

  const queryString = useSearch()
  const { SearchWithNav, FilteredList, viewTitle } = useResourceFilters({
    instructions: filtersInstructions
  })
  const isInViewPreset = viewTitle != null

  return (
    <PageLayout
      title={viewTitle ?? 'Shipments'}
      mode={mode}
      gap={isInViewPreset ? undefined : 'only-top'}
      navigationButton={{
        onClick: () => {
          setLocation(appRoutes.home.makePath({}))
        },
        label: 'Shipments',
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
        hideFiltersNav={isInViewPreset}
        hideSearchBar={isInViewPreset}
      />

      <Spacer bottom='14'>
        <FilteredList
          type='shipments'
          ItemTemplate={ListItemShipment}
          query={{
            fields: {
              shipments: [
                'id',
                'number',
                'updated_at',
                'status',
                'order',
                'stock_location',
                'stock_transfers'
              ],
              orders: ['market', 'shipments'],
              markets: ['name']
            },
            include: [
              'order',
              'order.market',
              'order.shipments',
              'stock_location',
              'stock_transfers'
            ],
            pageSize: 25,
            sort: {
              updated_at: 'desc'
            }
          }}
          emptyState={
            <EmptyState
              title='No shipments found!'
              description={
                <div>
                  {isInViewPreset ? (
                    <p>There are no shipments for the current list.</p>
                  ) : (
                    <p>
                      We didn't find any shipments matching the current
                      selection.
                    </p>
                  )}
                </div>
              }
            />
          }
        />
      </Spacer>
    </PageLayout>
  )
}
