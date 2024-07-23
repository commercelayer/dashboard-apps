import { appRoutes } from '#data/routes'
import { useLocation, Link } from 'wouter'
import { availableResources } from '#data/resources'
import {
  List,
  ListItem,
  PageLayout,
  Spacer,
  useTokenProvider,
  Icon,
  Text,
  formatResourceName
} from '@commercelayer/app-elements'

export function ResourceSelectorPage(): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [_, setLocation] = useLocation()

  return (
    <PageLayout
      title='Select type'
      mode={mode}
      navigationButton={{
        label: 'Imports',
        icon: 'arrowLeft',
        onClick: () => {
          setLocation(appRoutes.list.makePath())
        }
      }}
    >
      <Spacer bottom='12'>
        <List>
          {availableResources.sort().map((resource) => (
            <Link
              key={resource}
              href={appRoutes.newImport.makePath(resource)}
              asChild
            >
              <ListItem>
                <Text weight='semibold'>
                  {formatResourceName({
                    resource,
                    count: 'plural',
                    format: 'title'
                  })}
                </Text>
                <Icon name='caretRight' />
              </ListItem>
            </Link>
          ))}
        </List>
      </Spacer>
    </PageLayout>
  )
}
