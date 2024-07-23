import { availableResources, showResourceNiceName } from '#data/resources'
import { appRoutes } from '#data/routes'
import {
  Icon,
  List,
  ListItem,
  PageLayout,
  Spacer,
  Text,
  useTokenProvider
} from '@commercelayer/app-elements'
import { Link, useLocation } from 'wouter'

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
        label: 'Exports',
        icon: 'arrowLeft',
        onClick: () => {
          setLocation(appRoutes.list.makePath())
        }
      }}
    >
      <Spacer bottom='14'>
        <List>
          {availableResources.sort().map((resource) => (
            <Link
              key={resource}
              href={appRoutes.newExport.makePath(resource)}
              asChild
            >
              <ListItem>
                <Text weight='semibold'>{showResourceNiceName(resource)}</Text>
                <Icon name='caretRight' />
              </ListItem>
            </Link>
          ))}
        </List>
      </Spacer>
    </PageLayout>
  )
}
