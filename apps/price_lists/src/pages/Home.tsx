import { ListItemPriceList } from '#components/ListItemPriceList'
import { appRoutes } from '#data/routes'
import {
  A,
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
    type: 'price_lists',
    query: {
      filters: {
        ...(searchValue != null ? { name_cont: searchValue } : {})
      },
      sort: ['-updated_at']
    }
  })

  if (!canUser('read', 'price_lists')) {
    return (
      <HomePageLayout title='Prices'>
        <EmptyState title='You are not authorized' />
      </HomePageLayout>
    )
  }

  const priceListCount = meta?.recordCount != null ? meta?.recordCount : 0
  const noPriceLists = priceListCount === 0 && !isFirstLoading
  const showSearchBar = priceListCount > 0 || searchValue != null

  const NoPriceListsMessage = (): React.JSX.Element =>
    noPriceLists && searchValue == null ? (
      <EmptyState
        title='No price lists yet!'
        description={
          <div>
            <p>Add a price list with the API, or use the CLI.</p>
            <A
              target='_blank'
              href='https://docs.commercelayer.io/core/v/api-reference/price_lists'
              rel='noreferrer'
            >
              View API reference.
            </A>
          </div>
        }
      />
    ) : (
      <>
        <Text weight='semibold'>
          No results found. Try a new search.
          <br />
          If you were looking for an SKU instead of a Price list, search again
          within{' '}
          <Link href={appRoutes.pricesList.makePath({})}>All Prices</Link>.
        </Text>
      </>
    )

  return (
    <HomePageLayout title='Prices'>
      {showSearchBar && (
        <Spacer top='6'>
          <SearchBar
            initialValue={searchValue}
            onSearch={setSearchValue}
            placeholder='Search price lists...'
            onClear={() => {
              setSearchValue('')
            }}
          />
        </Spacer>
      )}
      <Spacer top={showSearchBar ? '14' : '6'}>
        {noPriceLists ? (
          <NoPriceListsMessage />
        ) : (
          <SkeletonTemplate isLoading={isFirstLoading || isLoading}>
            <Section title='Browse' titleSize='small'>
              {(searchValue == null || searchValue?.length === 0) && (
                <Link href={appRoutes.pricesList.makePath({})} asChild>
                  <ListItem>
                    <Text weight='semibold'>All prices</Text>
                    <StatusIcon name='caretRight' />
                  </ListItem>
                </Link>
              )}
              <ResourceList ItemTemplate={ListItemPriceList} />
            </Section>
          </SkeletonTemplate>
        )}
      </Spacer>
    </HomePageLayout>
  )
}
