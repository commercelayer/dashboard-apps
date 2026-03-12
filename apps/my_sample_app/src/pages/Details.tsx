import { appRoutes } from '#data/routes'
import {
  EmptyState,
  PageLayout,
  type PageProps,
  ResourceDetails,
  ResourceMetadata,
  Spacer,
  formatResourceName,
  useCoreApi
} from '@commercelayer/app-elements'
import type { FC } from 'react'
import { useLocation } from 'wouter'

const Page: FC<PageProps<typeof appRoutes.details>> = ({ params }) => {
  const { resourceType, resourceId } = params
  const [, setLocation] = useLocation()
  const { data, isLoading, mutate } = useCoreApi(resourceType, 'retrieve', [
    resourceId
  ])

  return (
    <PageLayout
      title={formatResourceName({
        resource: resourceType,
        format: 'title',
        count: 'singular'
      })}
      navigationButton={{
        label: 'Back',
        onClick: () => {
          setLocation(appRoutes.list.makePath({ resourceType }))
        }
      }}
    >
      {isLoading ? (
        <div>Loading...</div>
      ) : data == null ? (
        <EmptyState title='Resource not found' />
      ) : (
        <>
          <Spacer bottom='14'>
            <ResourceDetails
              resource={data}
              onUpdated={async () => {
                void mutate()
              }}
            />
          </Spacer>
          <ResourceMetadata
            resourceType={resourceType}
            resourceId={resourceId}
          />
        </>
      )}
    </PageLayout>
  )
}

export default Page
