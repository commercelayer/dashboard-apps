import { ListItemStockLocation } from '#components/ListItemStockLocation'
import { appRoutes } from '#data/routes'
import {
  EmptyState,
  HomePageLayout,
  ListItem,
  SearchBar,
  Section,
  Spacer,
  StatusIcon,
  Text,
  useResourceList,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useState } from 'react'
import { Link } from 'wouter'

export function Home(): JSX.Element {
  const { canUser } = useTokenProvider()

  const [searchValue, setSearchValue] = useState<string>()

  const { list } = useResourceList({
    type: 'stock_locations',
    query: {
      filters: {
        ...(searchValue != null ? { name_cont: searchValue } : {})
      },
      sort: ['-updated_at']
    }
  })

  if (!canUser('read', 'stock_locations')) {
    return (
      <HomePageLayout title='Inventory'>
        <EmptyState title='You are not authorized' />
      </HomePageLayout>
    )
  }

  return (
    <HomePageLayout title='Inventory'>
      <Spacer top='4'>
        <SearchBar
          initialValue={searchValue}
          onSearch={setSearchValue}
          placeholder='Search stock locations...'
          onClear={() => {
            setSearchValue('')
          }}
        />
      </Spacer>
      <Spacer top='14'>
        <Section title='Browse' titleSize='small'>
          {(searchValue == null || searchValue?.length === 0) && (
            <Link href={appRoutes.list.makePath()} asChild>
              <ListItem>
                <Text weight='semibold'>All inventory</Text>
                <StatusIcon name='caretRight' />
              </ListItem>
            </Link>
          )}
          {list?.map((stockLocation) => (
            <ListItemStockLocation
              resource={stockLocation}
              key={stockLocation.id}
            />
          ))}
        </Section>
      </Spacer>
    </HomePageLayout>
  )
}
