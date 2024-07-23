import { Item } from '#components/List/Item'
import { ListExportProvider } from '#components/List/Provider'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  HomePageLayout,
  Icon,
  List,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link } from 'wouter'

function ListPage(): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()

  if (!canUser('read', 'exports')) {
    return (
      <HomePageLayout title='Exports'>
        <EmptyState title='You are not authorized' />
      </HomePageLayout>
    )
  }

  return (
    <HomePageLayout title='Exports'>
      <Spacer top='14'>
        <ListExportProvider sdkClient={sdkClient} pageSize={25}>
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
                    title='No export yet!'
                    description='Create your first export'
                    action={
                      canUser('create', 'exports') ? (
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
                title='All Exports'
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
      </Spacer>
    </HomePageLayout>
  )
}

export default ListPage
