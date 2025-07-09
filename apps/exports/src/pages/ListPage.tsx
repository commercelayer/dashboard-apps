import { Item } from '#components/List/Item'
import { ListExportProvider } from '#components/List/Provider'
import { instructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  HomePageLayout,
  Icon,
  List,
  useCoreSdkProvider,
  useResourceFilters,
  useTokenProvider
} from '@commercelayer/app-elements'
import { type FC } from 'react'
import { Link, useLocation } from 'wouter'
import { navigate, useSearch } from 'wouter/use-browser-location'

const ListPage: FC = () => {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const queryString = useSearch()
  const [, setLocation] = useLocation()

  const { sdkFilters, SearchWithNav, hasActiveFilter } = useResourceFilters({
    instructions
  })

  if (sdkFilters == null) {
    return null
  }

  if (!canUser('read', 'exports')) {
    return (
      <HomePageLayout title='Exports'>
        <EmptyState title='You are not authorized' />
      </HomePageLayout>
    )
  }

  return (
    <HomePageLayout title='Exports'>
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
      />
      <ListExportProvider
        sdkClient={sdkClient}
        pageSize={25}
        filters={sdkFilters}
      >
        {({ state, changePage }) => {
          const { isLoading, currentPage, list } = state

          if (isLoading) {
            return <List isLoading />
          }

          if (list == null) {
            return (
              <div>
                <EmptyState title='Unable to load list' />
              </div>
            )
          }

          if (list.length === 0) {
            return (
              <div>
                <EmptyState
                  title={
                    hasActiveFilter ? 'No exports found!' : 'No exports yet!'
                  }
                  description={
                    hasActiveFilter
                      ? "We didn't find any exports matching the current filters selection."
                      : 'Create your first export'
                  }
                  action={
                    canUser('create', 'exports') && !hasActiveFilter ? (
                      <Link href={appRoutes.selectResource.makePath()}>
                        <Button variant='primary'>New export</Button>
                      </Link>
                    ) : undefined
                  }
                />
              </div>
            )
          }

          const isRefetching = currentPage !== list.meta.currentPage
          const { recordCount, recordsPerPage, pageCount } = list.meta

          return (
            <List
              isDisabled={isRefetching}
              title='All'
              actionButton={
                canUser('create', 'exports') ? (
                  <Link href={appRoutes.selectResource.makePath()} asChild>
                    <Button
                      variant='secondary'
                      size='mini'
                      alignItems='center'
                      aria-label='Add export'
                    >
                      <Icon name='plus' />
                      New
                    </Button>
                  </Link>
                ) : undefined
              }
              pagination={{
                recordsPerPage,
                recordCount,
                currentPage,
                onChangePageRequest: changePage,
                pageCount
              }}
            >
              {list.map((job) => {
                return <Item key={job.id} job={job} />
              })}
            </List>
          )
        }}
      </ListExportProvider>
    </HomePageLayout>
  )
}

export default ListPage
