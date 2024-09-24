import { ListEmptyStateStockItems } from '#components/ListEmptyStateStockItems'
import { ListItemStockItem } from '#components/ListItemStockItem'
import { stockItemsInstructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import { useStockLocationDetails } from '#hooks/useStockLocationDetails'
import {
  A,
  Button,
  EmptyState,
  Icon,
  PageLayout,
  SkeletonTemplate,
  useResourceFilters,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'
import { navigate, useSearch } from 'wouter/use-browser-location'

export function StockItemsList(): JSX.Element {
  const {
    canUser,
    settings: { mode }
  } = useTokenProvider()

  const [, params] = useRoute<{ stockLocationId: string }>(
    appRoutes.stockLocation.path
  )

  const stockLocationId = params?.stockLocationId ?? ''

  const { stockLocation, isLoading, error } =
    useStockLocationDetails(stockLocationId)

  const queryString = useSearch()
  const [, setLocation] = useLocation()

  const { SearchWithNav, FilteredList, hasActiveFilter } = useResourceFilters({
    instructions: stockItemsInstructions({ stockLocationId })
  })

  if (error != null) {
    return (
      <PageLayout
        title='Inventory'
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.home.makePath())
          },
          label: 'Inventory',
          icon: 'arrowLeft'
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.home.makePath()}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const pageTitle = stockLocation.name

  if (!canUser('read', 'stock_locations')) {
    return (
      <PageLayout title='Inventory' mode={mode}>
        <EmptyState title='You are not authorized' />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      mode={mode}
      gap='only-top'
      navigationButton={{
        onClick: () => {
          setLocation(appRoutes.home.makePath())
        },
        label: 'Inventory',
        icon: 'arrowLeft'
      }}
    >
      <SearchWithNav
        queryString={queryString}
        onUpdate={(qs: any) => {
          navigate(`?${qs}`, {
            replace: true
          })
        }}
        onFilterClick={() => {}}
        hideFiltersNav
      />

      <FilteredList
        type='stock_items'
        query={{
          include: ['sku', 'reserved_stock'],
          sort: {
            created_at: 'desc'
          }
        }}
        actionButton={
          canUser('create', 'stock_items') ? (
            <Link
              href={appRoutes.newStockItem.makePath(stockLocationId)}
              asChild
            >
              <A
                href=''
                variant='secondary'
                size='mini'
                alignItems='center'
                aria-label='Add stock item'
              >
                <Icon name='plus' />
                Stock item
              </A>
            </Link>
          ) : undefined
        }
        ItemTemplate={ListItemStockItem}
        emptyState={
          <ListEmptyStateStockItems
            scope={hasActiveFilter ? 'userFiltered' : 'history'}
          />
        }
      />
    </PageLayout>
  )
}
