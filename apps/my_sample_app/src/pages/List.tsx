import { appRoutes } from '#data/routes'
import {
  Icon,
  ListItem,
  PageLayout,
  type PageProps,
  Text,
  formatResourceName,
  useResourceList
} from '@commercelayer/app-elements'
import type { FC } from 'react'
import { useLocation } from 'wouter'

const Page: FC<PageProps<typeof appRoutes.list>> = ({ params }) => {
  const { resourceType } = params
  const [, setLocation] = useLocation()
  const { ResourceList, isLoading } = useResourceList({
    type: resourceType,
    query: {
      pageSize: 25
    }
  })

  if (isLoading) {
    return null
  }

  return (
    <PageLayout
      title={formatResourceName({
        resource: resourceType,
        format: 'title',
        count: 'plural'
      })}
      navigationButton={{
        label: 'Select type',
        onClick: () => {
          setLocation(appRoutes.home.makePath({}))
        }
      }}
    >
      <ResourceList
        title='All'
        ItemTemplate={({ resource }) => {
          if (resource == null) {
            return null
          }
          return (
            <ListItem
              onClick={() => {
                setLocation(
                  appRoutes.details.makePath({
                    resourceType,
                    resourceId: resource.id
                  })
                )
              }}
            >
              <div>
                <Text tag='div' weight='semibold'>
                  #{resource.id}
                </Text>
                <Text tag='div' variant='info'>
                  {/* for customers */}
                  {'email' in resource && resource.email}
                  {/* for other markets and skus */}
                  {'name' in resource && resource.name}
                  {/* for other shipments */}
                  {'number' in resource && resource.number}
                </Text>
              </div>
              <Icon name='caretRight' />
            </ListItem>
          )
        }}
      />
    </PageLayout>
  )
}

export default Page
