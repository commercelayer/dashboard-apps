import { ExportedResourceType } from '#components/Details/ExportedResourceType'
import { ExportDetailsProvider } from '#components/Details/Provider'
import { ExportDate } from '#components/Details/ExportDate'
import { ErrorNotFound } from '#components/ErrorNotFound'
import { appRoutes } from '#data/routes'
import {
  useTokenProvider,
  PageLayout,
  Spacer,
  Button,
  EmptyState,
  SkeletonTemplate
} from '@commercelayer/app-elements'
import { useLocation, useRoute, Link } from 'wouter'
import { ExportReport } from '#components/Details/ExportReport'
import { ExportDetails } from '#components/Details/ExportDetails'

const DetailsPage = (): JSX.Element | null => {
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
      {({ state: { isLoading, data, isNotFound } }) =>
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
              <Spacer bottom='12'>
                <ExportReport />
              </Spacer>

              <Spacer bottom='12'>
                <ExportDetails />
              </Spacer>
            </PageLayout>
          </SkeletonTemplate>
        )
      }
    </ExportDetailsProvider>
  )
}

export default DetailsPage
