import { appRoutes } from '#data/routes'
import {
  formatResourceName,
  HomePageLayout,
  Icon,
  List,
  ListItem,
  Spacer
} from '@commercelayer/app-elements'
import type { ListableResourceType } from '@commercelayer/sdk'
import type { FC } from 'react'
import { useLocation } from 'wouter'

const resources: ListableResourceType[] = [
  'customers',
  'markets',
  'shipments',
  'skus'
]

const Page: FC = () => {
  const [, setLocation] = useLocation()
  return (
    <HomePageLayout title='My Sample App'>
      <Spacer top='14'>
        <List title='Resources'>
          {resources.map((resourceType) => (
            <ListItem
              key={resourceType}
              onClick={() => {
                setLocation(appRoutes.list.makePath({ resourceType }))
              }}
            >
              {formatResourceName({
                resource: resourceType,
                format: 'title',
                count: 'plural'
              })}
              <Icon name='caretRight' />
            </ListItem>
          ))}
        </List>
      </Spacer>
    </HomePageLayout>
  )
}

export default Page
