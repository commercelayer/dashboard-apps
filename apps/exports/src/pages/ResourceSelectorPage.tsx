import { availableResources, showResourceNiceName } from '#data/resources'
import { appRoutes } from '#data/routes'
import {
  Card,
  Icon,
  List,
  ListItem,
  PageLayout,
  SearchBar,
  Spacer,
  Text,
  useTokenProvider
} from '@commercelayer/app-elements'
import { isEmpty } from 'lodash-es'
import { useState } from 'react'
import { Link, useLocation } from 'wouter'

export function ResourceSelectorPage(): React.JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [search, setSearch] = useState<string | null>()

  const list =
    isEmpty(search) || search == null
      ? availableResources
      : availableResources.filter((resource) =>
          resource.toLowerCase().includes(search.toLowerCase())
        )

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
      overlay
      gap='only-top'
    >
      <Spacer top='6' bottom='14'>
        <SearchBar
          placeholder='Search…'
          initialValue={search ?? ''}
          onSearch={setSearch}
          onClear={() => {
            setSearch(null)
          }}
        />
      </Spacer>
      <Spacer bottom='14'>
        {list.length === 0 ? (
          <Card overflow='visible' gap='6'>
            <Text>No resources found.</Text>
          </Card>
        ) : (
          <Card gap='none'>
            <List>
              {list.map((resource, index) => (
                <Link
                  key={resource}
                  href={appRoutes.newExport.makePath(resource)}
                  asChild
                >
                  <ListItem
                    borderStyle={index === list.length - 1 ? 'none' : 'solid'}
                  >
                    <Text weight='semibold'>
                      {showResourceNiceName(resource)}
                    </Text>
                    <Icon name='caretRight' />
                  </ListItem>
                </Link>
              ))}
            </List>
          </Card>
        )}
      </Spacer>
    </PageLayout>
  )
}
