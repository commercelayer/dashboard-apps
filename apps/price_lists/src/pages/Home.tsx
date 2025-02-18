import { ListItemPriceList } from '#components/ListItemPriceList'
import { appRoutes } from '#data/routes'
import {
  Button,
  EmptyState,
  HomePageLayout,
  Icon,
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

export function Home(): JSX.Element {
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

  const NoPriceListsMessage = (): JSX.Element =>
    noPriceLists && searchValue == null ? (
      <EmptyState
        title='No price lists yet!'
        action={
          canUser('create', 'price_lists') && (
            <Link href={appRoutes.priceListNew.makePath({})}>
              <Button variant='primary'>Add a price list</Button>
            </Link>
          )
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
        <Spacer top='4'>
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
      <Spacer top={showSearchBar ? '14' : '4'}>
        {noPriceLists ? (
          <NoPriceListsMessage />
        ) : (
          <SkeletonTemplate isLoading={isFirstLoading || isLoading}>
            <Section
              title='Browse'
              titleSize='small'
              actionButton={
                canUser('create', 'price_lists') ? (
                  <Link href={appRoutes.priceListNew.makePath({})} asChild>
                    <Button
                      variant='secondary'
                      size='mini'
                      alignItems='center'
                      aria-label='Add price list'
                    >
                      <Icon name='plus' />
                      New
                    </Button>
                  </Link>
                ) : undefined
              }
            >
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
