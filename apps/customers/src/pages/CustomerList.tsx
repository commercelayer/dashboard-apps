import { ListEmptyState } from '#components/ListEmptyState'
import { ListItemCustomer } from '#components/ListItemCustomer'
import { instructions } from '#data/filters'
import { presets } from '#data/lists'
import { appRoutes } from '#data/routes'
import {
  Button,
  HomePageLayout,
  Icon,
  Spacer,
  useResourceFilters,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link, useLocation } from 'wouter'
import { navigate, useSearch } from 'wouter/use-browser-location'

export function CustomerList(): JSX.Element {
  const { canUser } = useTokenProvider()

  const queryString = useSearch()
  const [, setLocation] = useLocation()

  const { SearchWithNav, FilteredList, viewTitle, hasActiveFilter } =
    useResourceFilters({
      instructions
    })

  const isUserCustomFiltered =
    hasActiveFilter && viewTitle === presets.all.viewTitle
  const hideFiltersNav = !(
    viewTitle == null || viewTitle === presets.all.viewTitle
  )

  return (
    <HomePageLayout title='Customers'>
      <SearchWithNav
        queryString={queryString}
        onUpdate={(qs) => {
          navigate(`?${qs}`, {
            replace: true
          })
        }}
        onFilterClick={(queryString) => {
          setLocation(appRoutes.filters.makePath(queryString))
        }}
        hideFiltersNav={hideFiltersNav}
      />

      <Spacer bottom='14'>
        <FilteredList
          type='customers'
          ItemTemplate={ListItemCustomer}
          query={{
            fields: {
              customers: [
                'id',
                'email',
                'total_orders_count',
                'created_at',
                'updated_at',
                'customer_group'
              ]
            },
            include: ['customer_group'],
            pageSize: 25,
            sort: {
              updated_at: 'desc'
            }
          }}
          emptyState={
            <ListEmptyState
              scope={
                isUserCustomFiltered
                  ? 'userFiltered'
                  : viewTitle !== presets.all.viewTitle
                    ? 'presetView'
                    : 'history'
              }
            />
          }
          actionButton={
            canUser('create', 'customers') ? (
              <Link href={appRoutes.new.makePath()} asChild>
                <Button
                  variant='secondary'
                  size='mini'
                  alignItems='center'
                  aria-label='Add customer'
                >
                  <Icon name='plus' />
                  New
                </Button>
              </Link>
            ) : undefined
          }
        />
      </Spacer>
    </HomePageLayout>
  )
}
