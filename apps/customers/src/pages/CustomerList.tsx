import { ListEmptyState } from '#components/ListEmptyState'
import { ListItemCustomer } from '#components/ListItemCustomer'
import { instructions } from '#data/filters'
import { presets } from '#data/lists'
import { appRoutes } from '#data/routes'
import { useCustomerAnonymizedPendingList } from '#hooks/useCustomerAnonymizedPendingList'
import {
  Alert,
  Button,
  HomePageLayout,
  Icon,
  Spacer,
  Text,
  useResourceFilters,
  useTokenProvider,
  useTranslation
} from '@commercelayer/app-elements'
import { Link, useLocation } from 'wouter'
import { navigate, useSearch } from 'wouter/use-browser-location'

export function CustomerList(): React.JSX.Element {
  const { canUser } = useTokenProvider()
  const { t } = useTranslation()

  const queryString = useSearch()
  const [, setLocation] = useLocation()

  const { SearchWithNav, FilteredList, viewTitle, hasActiveFilter } =
    useResourceFilters({
      instructions
    })

  const { customers: customersWithPendingAnonymization } =
    useCustomerAnonymizedPendingList({})
  const hasPendingAnonymization =
    customersWithPendingAnonymization != null &&
    customersWithPendingAnonymization.length > 0

  const isUserCustomFiltered =
    hasActiveFilter && viewTitle === presets.all.viewTitle
  const hideFiltersNav = !(
    viewTitle == null || viewTitle === presets.all.viewTitle
  )

  return (
    <HomePageLayout title={t('resources.customers.name_other')}>
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

      {hasPendingAnonymization && (
        <Spacer bottom='14'>
          <Alert status='warning'>
            <Text weight='semibold'>Pending anonymization requests:</Text>
            <Spacer top='2'>
              {customersWithPendingAnonymization.map((customer) => (
                <Spacer key={customer.id} bottom='1'>
                  <Text color='black' size='small' weight='semibold'>
                    <Link href={appRoutes.details.makePath(customer.id)}>
                      {customer.email}
                    </Link>
                  </Text>
                </Spacer>
              ))}
            </Spacer>
          </Alert>
        </Spacer>
      )}

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
              created_at: 'desc'
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
                  {t('common.new')}
                </Button>
              </Link>
            ) : undefined
          }
        />
      </Spacer>
    </HomePageLayout>
  )
}

export default CustomerList
