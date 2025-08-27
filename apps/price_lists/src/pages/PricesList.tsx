import { ListEmptyStatePrice } from '#components/ListEmptyStatePrice'
import { ListItemPrice } from '#components/ListItemPrice'
import { pricesFilterInstructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import { usePriceListDetails } from '#hooks/usePriceListDetails'
import {
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

export function PricesList(): React.JSX.Element {
  const {
    canUser,
    settings: { mode }
  } = useTokenProvider()

  const [, params] = useRoute<{ priceListId: string }>(
    appRoutes.pricesList.path
  )

  const priceListId = params?.priceListId ?? ''

  const { priceList, isLoading, error } = usePriceListDetails(priceListId)

  const queryString = useSearch()
  const [, setLocation] = useLocation()

  const { SearchWithNav, FilteredList, hasActiveFilter } = useResourceFilters({
    instructions: pricesFilterInstructions({ priceListId })
  })

  if (error != null) {
    return (
      <PageLayout
        title='Price lists'
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.home.makePath({}))
          },
          label: 'Price lists',
          icon: 'arrowLeft'
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.home.makePath({})}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const pageTitle = priceListId !== '' ? priceList.name : 'All prices'

  if (!canUser('read', 'price_lists') || !canUser('read', 'prices')) {
    return (
      <PageLayout title='Price lists' mode={mode}>
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
          setLocation(appRoutes.home.makePath({}))
        },
        label: 'Price lists',
        icon: 'arrowLeft'
      }}
      scrollToTop
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
        type='prices'
        query={{
          include: [
            'sku',
            'price_volume_tiers',
            'price_frequency_tiers',
            'price_list'
          ],
          sort: {
            created_at: 'desc'
          }
        }}
        actionButton={
          canUser('create', 'prices') && (
            <Link href={appRoutes.priceNew.makePath({ priceListId })} asChild>
              <Button
                variant='secondary'
                size='mini'
                alignItems='center'
                aria-label='Add price'
              >
                <Icon name='plus' />
                Price
              </Button>
            </Link>
          )
        }
        ItemTemplate={ListItemPrice}
        emptyState={
          <ListEmptyStatePrice
            scope={hasActiveFilter ? 'userFiltered' : 'history'}
          />
        }
      />
    </PageLayout>
  )
}
