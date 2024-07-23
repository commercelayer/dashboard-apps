import { ListEmptyState } from '#components/ListEmptyState'
import { ListItemTag } from '#components/ListItemTag'
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

export function TagList(): JSX.Element {
  const { canUser } = useTokenProvider()

  const queryString = useSearch()
  const [, setLocation] = useLocation()

  const { SearchWithNav, FilteredList, viewTitle, hasActiveFilter } =
    useResourceFilters({
      instructions
    })

  const isUserCustomFiltered =
    hasActiveFilter && viewTitle === presets.all.viewTitle

  return (
    <HomePageLayout title='Tags'>
      <SearchWithNav
        queryString={queryString}
        onUpdate={(qs) => {
          navigate(`?${qs}`, {
            replace: true
          })
        }}
        onFilterClick={(queryString) => {
          setLocation(appRoutes.list.makePath(queryString))
        }}
        hideFiltersNav
      />

      <Spacer bottom='14'>
        <FilteredList
          type='tags'
          ItemTemplate={ListItemTag}
          query={{
            fields: {
              tags: ['id', 'name', 'created_at', 'updated_at']
            },
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
            canUser('create', 'tags') ? (
              <Link href={appRoutes.new.makePath()} asChild>
                <Button
                  variant='secondary'
                  size='mini'
                  alignItems='center'
                  aria-label='Add tag'
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
