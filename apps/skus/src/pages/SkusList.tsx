import { ListEmptyState } from '#components/ListEmptyState'
import { ListItemSku } from '#components/ListItemSku'
import { instructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  HomePageLayout,
  Icon,
  Spacer,
  useResourceFilters,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { FC } from 'react'
import { Link, useLocation } from 'wouter'
import { navigate, useSearch } from 'wouter/use-browser-location'

export const SkusList: FC = () => {
  const { canUser } = useTokenProvider()

  const queryString = useSearch()
  const [, setLocation] = useLocation()

  const { SearchWithNav, FilteredList, hasActiveFilter } = useResourceFilters({
    instructions
  })

  if (!canUser('read', 'skus')) {
    return (
      <HomePageLayout title='SKUs'>
        <EmptyState title='You are not authorized' />
      </HomePageLayout>
    )
  }

  return (
    <HomePageLayout title='SKUs'>
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
        hideFiltersNav={false}
      />

      <Spacer bottom='14'>
        <FilteredList
          type='skus'
          ItemTemplate={ListItemSku}
          query={{
            pageSize: 25,
            sort: {
              code: 'asc'
            }
          }}
          emptyState={
            <ListEmptyState
              scope={hasActiveFilter ? 'userFiltered' : 'history'}
            />
          }
          actionButton={
            canUser('create', 'skus') ? (
              <Link href={appRoutes.new.makePath({})} asChild>
                <Button
                  variant='secondary'
                  size='mini'
                  alignItems='center'
                  aria-label='Add SKU'
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
