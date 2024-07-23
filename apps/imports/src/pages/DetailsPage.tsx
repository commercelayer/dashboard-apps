import { ImportDetailsProvider } from '#components/Details/Provider'
import { ImportedResourceType } from '#components/Details/ImportedResourceType'
import { ImportDate } from '#components/Details/ImportDate'
import { appRoutes } from '#data/routes'
import { Link, useLocation, useRoute } from 'wouter'
import { ErrorNotFound } from '#components/ErrorNotFound'
import { ImportReport } from '#components/Details/ImportReport'
import { ImportDetails } from '#components/Details/ImportDetails'
import {
  Button,
  useTokenProvider,
  PageLayout,
  Spacer,
  EmptyState,
  SkeletonTemplate
} from '@commercelayer/app-elements'

const DetailsPage = (): JSX.Element | null => {
  const {
    canUser,
    settings: { mode }
  } = useTokenProvider()
  const [_, setLocation] = useLocation()
  const [_match, params] = useRoute<{ importId?: string }>(
    appRoutes.details.path
  )
  const importId = params == null ? null : params.importId

  if (importId == null || !canUser('read', 'imports')) {
    return (
      <PageLayout
        title='Imports'
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
    <ImportDetailsProvider importId={importId}>
      {({ state: { isLoading, isNotFound } }) =>
        isNotFound ? (
          <ErrorNotFound />
        ) : (
          <SkeletonTemplate isLoading={isLoading}>
            <PageLayout
              title={<ImportedResourceType />}
              mode={mode}
              description={
                <ImportDate
                  atType='created_at'
                  prefixText='Imported on '
                  includeTime
                />
              }
              navigationButton={{
                label: 'Imports',
                icon: 'arrowLeft',
                onClick: () => {
                  setLocation(appRoutes.list.makePath())
                }
              }}
            >
              <Spacer bottom='12'>
                <ImportReport />
              </Spacer>

              <Spacer bottom='12'>
                <ImportDetails />
              </Spacer>
            </PageLayout>
          </SkeletonTemplate>
        )
      }
    </ImportDetailsProvider>
  )
}

export default DetailsPage
