import { ListItemShipment } from '#components/ListItemShipment'
import { filtersInstructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import {
  EmptyState,
  PageLayout,
  Spacer,
  useResourceFilters,
  useTokenProvider,
  useTranslation
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'
import { navigate, useSearch } from 'wouter/use-browser-location'

function ShipmentList(): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const { t } = useTranslation()

  const queryString = useSearch()
  const { SearchWithNav, FilteredList, viewTitle } = useResourceFilters({
    instructions: filtersInstructions
  })
  const isInViewPreset = viewTitle != null

  return (
    <PageLayout
      title={viewTitle ?? t('resources.shipments.name_other')}
      mode={mode}
      gap={isInViewPreset ? undefined : 'only-top'}
      navigationButton={{
        onClick: () => {
          setLocation(appRoutes.home.makePath({}))
        },
        label: t('resources.shipments.name_other'),
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
              title={
                isInViewPreset
                  ? t('common.empty_states.all_good_here')
                  : t('common.empty_states.no_resource_found', {
                      resource: t('resources.shipments.name').toLowerCase()
                    })
              }
              description={
                <div>
                  {isInViewPreset ? (
                    <p>
                      {t('common.empty_states.no_resources_found_for_list', {
                        resources: t(
                          'resources.shipments.name_other'
                        ).toLowerCase()
                      })}
                    </p>
                  ) : (
                    <p>
                      {t('common.empty_states.no_resources_found_for_filters', {
                        resources: t(
                          'resources.shipments.name_other'
                        ).toLowerCase()
                      })}
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

export default ShipmentList
