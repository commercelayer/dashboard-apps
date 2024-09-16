import { ListEmptyState } from '#components/ListEmptyState'
import { instructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import {
  Button,
  HomePageLayout,
  Icon,
  Spacer,
  useResourceFilters,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { FC } from 'react'
import { Link, useLocation } from 'wouter'
import { navigate, useSearch } from 'wouter/use-browser-location'

const GiftCardList: FC = () => {
  const { canUser } = useTokenProvider()
  const queryString = useSearch()
  const [, setLocation] = useLocation()

  const { SearchWithNav, FilteredList, hasActiveFilter } = useResourceFilters({
    instructions
  })

  return (
    <HomePageLayout title='Gift cards'>
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
        searchBarDebounceMs={1000}
      />

      <Spacer bottom='14'>
        <FilteredList
          type='gift_cards'
          ItemTemplate={({ resource }) => <div>{resource?.id}</div>}
          emptyState={
            <ListEmptyState
              scope={hasActiveFilter ? 'userFiltered' : 'history'}
            />
          }
          actionButton={
            canUser('create', 'gift_cards') ? (
              <Link href={appRoutes.new.makePath({})} asChild>
                <Button
                  variant='secondary'
                  size='mini'
                  alignItems='center'
                  aria-label='Add gift card'
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

export default GiftCardList
