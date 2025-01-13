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
  useTranslation,
  withSkeletonTemplate,
  type PageProps
} from '@commercelayer/app-elements'
import type { Market } from '@commercelayer/sdk'
import { useLocation } from 'wouter'
import { useSearch } from 'wouter/use-browser-location'

export const SelectMarketStep: React.FC<
  Pick<PageProps<typeof appRoutes.new>, 'overlay'>
> = ({ overlay }) => {
  const [, setLocation] = useLocation()
  const { t } = useTranslation()
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
        label: t('common.search'),
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
      title={t('common.select_resource', {
        resource: t('resources.markets.name').toLowerCase()
      })}
      overlay={overlay}
      gap='only-top'
      navigationButton={{
        label: t('common.close'),
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
                  title={t('common.empty_states.no_resource_found', {
                    resource: t('resources.markets.name').toLowerCase()
                  })}
                  icon='shield'
                  description={t(
                    'common.empty_states.no_resource_found_for_organization',
                    {
                      resource: t('resources.markets.name').toLowerCase()
                    }
                  )}
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
