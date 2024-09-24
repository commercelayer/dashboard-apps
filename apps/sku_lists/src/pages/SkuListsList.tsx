import { ListItemSkuList } from '#components/ListItemSkuList'
import { instructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  HomePageLayout,
  Icon,
  useResourceFilters,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link } from 'wouter'
import { navigate, useSearch } from 'wouter/use-browser-location'

export function SkuListsList(): JSX.Element {
  const { canUser } = useTokenProvider()

  const queryString = useSearch()

  const { SearchWithNav, FilteredList, hasActiveFilter } = useResourceFilters({
    instructions
  })

  if (!canUser('read', 'sku_lists')) {
    return (
      <HomePageLayout title='SKU Lists'>
        <EmptyState title='You are not authorized' />
      </HomePageLayout>
    )
  }

  return (
    <HomePageLayout title='SKU Lists'>
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
        type='sku_lists'
        query={{
          sort: {
            created_at: 'desc'
          }
        }}
        ItemTemplate={ListItemSkuList}
        emptyState={
          hasActiveFilter ? (
            <EmptyState
              title='No SKU lists found!'
              description={
                <div>
                  <p>We didn't find any SKU lists matching the search.</p>
                </div>
              }
              action={
                canUser('create', 'sku_lists') && (
                  <Link href={appRoutes.new.makePath({})}>
                    <Button variant='primary'>Add a SKU list</Button>
                  </Link>
                )
              }
            />
          ) : (
            <EmptyState
              title='No SKU lists yet!'
              action={
                canUser('create', 'sku_lists') && (
                  <Link href={appRoutes.new.makePath({})}>
                    <Button variant='primary'>Add a SKU list</Button>
                  </Link>
                )
              }
            />
          )
        }
        actionButton={
          canUser('create', 'sku_lists') ? (
            <Link href={appRoutes.new.makePath({})} asChild>
              <Button
                variant='secondary'
                size='mini'
                alignItems='center'
                aria-label='Add SKU list'
              >
                <Icon name='plus' />
                New
              </Button>
            </Link>
          ) : undefined
        }
      />
    </HomePageLayout>
  )
}
