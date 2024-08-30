import type { PageProps } from '#components/Routes'
import { appRoutes } from '#data/routes'
import {
  AvatarLetter,
  EmptyState,
  Icon,
  ListItem,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  StatusIcon,
  Text,
  useCoreSdkProvider,
  useResourceFilters,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Market } from '@commercelayer/sdk'
import { useLocation } from 'wouter'
import { useSearch } from 'wouter/use-browser-location'

export const SelectMarketStep: React.FC<
  Pick<PageProps<typeof appRoutes.new>, 'overlay'>
> = ({ overlay }) => {
  const [, setLocation] = useLocation()
  const search = useSearch()

  const { SearchWithNav, FilteredList } = useResourceFilters({
    instructions: [
      {
        label: 'Search',
        type: 'textSearch',
        sdk: {
          predicate: 'name_cont'
        },
        render: {
          component: 'searchBar'
        }
      }
    ]
  })

  return (
    <PageLayout
      title='Select market'
      overlay={overlay}
      gap='only-top'
      navigationButton={{
        label: 'Close',
        icon: 'x',
        onClick() {
          setLocation(appRoutes.home.makePath({}))
        }
      }}
    >
      <SearchWithNav
        hideFiltersNav
        onFilterClick={() => {}}
        onUpdate={(qs) => {
          setLocation(appRoutes.new.makePath({}, qs))
        }}
        queryString={search}
        searchBarDebounceMs={1000}
      />

      <SkeletonTemplate>
        <Spacer bottom='14'>
          <FilteredList
            emptyState={
              <EmptyState
                title='No markets found!'
                icon='shield'
                description='No markets found for this organization.'
              />
            }
            type='markets'
            ItemTemplate={MarketItemTemplate}
            query={{}}
          />
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

const MarketItemTemplate = withSkeletonTemplate<{
  resource?: Market
}>(({ resource }) => {
  const [, setLocation] = useLocation()
  const { sdkClient } = useCoreSdkProvider()

  if (resource == null) {
    return null
  }

  return (
    <ListItem
      onClick={() => {
        void sdkClient.orders
          .create({
            market: {
              type: 'markets',
              id: resource.id
            }
          })
          .then((order) => {
            setLocation(appRoutes.new.makePath({ orderId: order.id }))
          })
      }}
      icon={
        resource.disabled_at != null ? (
          <StatusIcon name='minus' background='gray' gap='large' />
        ) : (
          <AvatarLetter text={resource.name} />
        )
      }
    >
      <div>
        <Text tag='div' weight='semibold' className='flex gap-2 items-center'>
          {resource.name}{' '}
          {resource.private === true && (
            <Icon name='lockSimple' weight='bold' />
          )}
        </Text>

        <Text tag='div' size='small' variant='info'>
          {resource.disabled_at == null ? 'Active' : 'Disabled'}
        </Text>
      </div>
      <Icon name='caretRight' />
    </ListItem>
  )
})
