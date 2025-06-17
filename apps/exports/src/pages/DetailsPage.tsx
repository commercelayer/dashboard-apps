import { ExportDate } from '#components/Details/ExportDate'
import { ExportDetails } from '#components/Details/ExportDetails'
import { ExportedResourceType } from '#components/Details/ExportedResourceType'
import { ExportReport } from '#components/Details/ExportReport'
import { ExportDetailsProvider } from '#components/Details/Provider'
import { ErrorNotFound } from '#components/ErrorNotFound'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  isMockedId,
  PageLayout,
  ResourceDetails,
  ResourceMetadata,
  SkeletonTemplate,
  Spacer,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link, useLocation, useRoute } from 'wouter'

const DetailsPage = (): React.JSX.Element | null => {
  const {
    canUser,
    settings: { mode }
  } = useTokenProvider()
  const [_match, params] = useRoute<{ exportId?: string }>(
    appRoutes.details.path
  )
  const [_, setLocation] = useLocation()

  const exportId = params == null ? null : params.exportId

  if (exportId == null || !canUser('read', 'exports')) {
    return (
      <PageLayout
        title='Exports'
        navigationButton={{
          label: 'Back',
          icon: 'arrowLeft',
          onClick: () => {
            setLocation(appRoutes.list.makePath())
          }
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.list.makePath()}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <ExportDetailsProvider exportId={exportId}>
      {({ state: { isLoading, data, isNotFound }, refetch }) =>
        isNotFound ? (
          <ErrorNotFound />
        ) : (
          <SkeletonTemplate isLoading={isLoading}>
            <PageLayout
              title={<ExportedResourceType />}
              mode={mode}
              description={
                <ExportDate
                  atType={
                    data.status === 'completed' ? 'completed_at' : 'started_at'
                  }
                  prefixText={
                    data.status === 'completed' ? 'Exported on ' : 'Started on'
                  }
                  includeTime
                />
              }
              navigationButton={{
                label: 'Exports',
                icon: 'arrowLeft',
                onClick: () => {
                  setLocation(appRoutes.list.makePath())
                }
              }}
            >
              <Spacer bottom='14'>
                <ExportReport />
              </Spacer>

              <Spacer bottom='14'>
                <ExportDetails />
              </Spacer>

              <Spacer top='14'>
                <ResourceDetails
                  resource={data}
                  onUpdated={async () => {
                    void refetch()
                  }}
                />
              </Spacer>
              {!isMockedId(data.id) && (
                <Spacer top='14'>
                  <ResourceMetadata
                    resourceType='exports'
                    resourceId={data.id}
                    overlay={{
                      title: 'Back'
                    }}
                  />
                </Spacer>
              )}
            </PageLayout>
          </SkeletonTemplate>
        )
      }
    </ExportDetailsProvider>
  )
}

export default DetailsPage
