import { ListEmptyState } from '#components/ListEmptyState'
import { ListItemSubscription } from '#components/ListItemSubscription'
import { instructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import { useSubscriptionModelsFrequencies } from '#hooks/useSubscriptionModelsFrequencies'
import {
  EmptyState,
  HomePageLayout,
  PageLayout,
  Spacer,
  useResourceFilters,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useCallback, type FC } from 'react'
import { useLocation } from 'wouter'
import { navigate, useSearch } from 'wouter/use-browser-location'

export const SubscriptionsList: FC = () => {
  const { settings, canUser } = useTokenProvider()
  const [, setLocation] = useLocation()
  const queryString = useSearch()

  const subscriptionModelsFrequencies = useSubscriptionModelsFrequencies()

  const filters = useCallback(() => {
    return useResourceFilters({
      instructions: instructions(subscriptionModelsFrequencies)
    })
  }, [subscriptionModelsFrequencies])

  const { SearchWithNav, FilteredList, hasActiveFilter } = filters()

  if (!canUser('read', 'order_subscriptions')) {
    return (
      <PageLayout
        title='Subscriptions'
        mode={settings.mode}
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.list.makePath({}))
          },
          label: `Subscriptions`,
          icon: 'arrowLeft'
        }}
      >
        <EmptyState title='You are not authorized' />
      </PageLayout>
    )
  }

  return (
    <HomePageLayout title='Subscriptions'>
      <SearchWithNav
        queryString={queryString}
        onUpdate={(qs) => {
          navigate(`?${qs}`, {
            replace: true
          })
        }}
        onFilterClick={(queryString) => {
          setLocation(appRoutes.filters.makePath({}, queryString))
        }}
        hideFiltersNav={false}
      />

      <Spacer top='14'>
        <FilteredList
          type='order_subscriptions'
          ItemTemplate={ListItemSubscription}
          query={{
            include: ['market'],
            sort: {
              updated_at: 'desc'
            },
            pageSize: 25
          }}
          emptyState={
            <ListEmptyState
              scope={hasActiveFilter ? 'userFiltered' : 'history'}
            />
          }
        />
      </Spacer>
    </HomePageLayout>
  )
}
