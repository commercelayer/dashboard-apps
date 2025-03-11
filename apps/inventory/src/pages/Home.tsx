import { ListEmptyStateStockLocations } from '#components/ListEmptyStateStockLocations'
import { ListItemStockLocation } from '#components/ListItemStockLocation'
import { appRoutes } from '#data/routes'
import {
  EmptyState,
  HomePageLayout,
  ListItem,
  SearchBar,
  Section,
  SkeletonTemplate,
  Spacer,
  StatusIcon,
  Text,
  useResourceList,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useState } from 'react'
import { Link } from 'wouter'

export function Home(): React.JSX.Element {
  const { canUser } = useTokenProvider()

  const [searchValue, setSearchValue] = useState<string>()

  const { meta, isLoading, isFirstLoading, ResourceList } = useResourceList({
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

  const stockLocationCount = meta?.recordCount != null ? meta?.recordCount : 0
  const noStockLocations = stockLocationCount === 0 && !isFirstLoading
  const showSearchBar = stockLocationCount > 0 || searchValue != null

  return (
    <HomePageLayout title='Inventory'>
      {showSearchBar && (
        <Spacer top='6'>
          <SearchBar
            initialValue={searchValue}
            onSearch={setSearchValue}
            placeholder='Search stock locations...'
            onClear={() => {
              setSearchValue('')
            }}
          />
        </Spacer>
      )}
      <Spacer top={showSearchBar ? '14' : '6'}>
        {noStockLocations ? (
          <ListEmptyStateStockLocations
            scope={searchValue != null ? 'userFiltered' : 'history'}
          />
        ) : (
          <SkeletonTemplate isLoading={isLoading || isFirstLoading}>
            <Section title='Browse' titleSize='small'>
              {(searchValue == null || searchValue?.length === 0) && (
                <Link href={appRoutes.list.makePath()} asChild>
                  <ListItem>
                    <Text weight='semibold'>All inventory</Text>
                    <StatusIcon name='caretRight' />
                  </ListItem>
                </Link>
              )}
              <ResourceList ItemTemplate={ListItemStockLocation} />
            </Section>
          </SkeletonTemplate>
        )}
      </Spacer>
    </HomePageLayout>
  )
}
