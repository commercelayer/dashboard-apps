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
      <HomePageLayout title='Price lists'>
        <EmptyState title='You are not authorized' />
      </HomePageLayout>
    )
  }

  return (
    <HomePageLayout title='Price lists'>
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
          {list?.map((priceList) => (
            <ListItemPriceList resource={priceList} key={priceList.id} />
          ))}
        </Section>
      </Spacer>
    </HomePageLayout>
  )
}
