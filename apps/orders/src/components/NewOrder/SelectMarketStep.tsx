import type { PageProps } from '#components/Routes'
import { appRoutes } from '#data/routes'
import {
  Card,
  EmptyState,
  Icon,
  ListItem,
  PageLayout,
  SkeletonTemplate,
  Spacer,
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
        hidden: true,
        label: 'Active',
        type: 'options',
        sdk: {
          predicate: 'disabled_at_null',
          defaultOptions: ['true']
        },
        render: {
          component: 'inputToggleButton',
          props: {
            mode: 'single',
            options: [{ value: 'true', label: 'True' }]
          }
        }
      },
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
          <Card gap='none'>
            <FilteredList
              hideTitle
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
          </Card>
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
    >
      <Text tag='div' weight='semibold' className='flex gap-2 items-center'>
        {resource.name}{' '}
        {resource.private === true && <Icon name='lockSimple' weight='bold' />}
      </Text>
      <Icon name='caretRight' />
    </ListItem>
  )
})
