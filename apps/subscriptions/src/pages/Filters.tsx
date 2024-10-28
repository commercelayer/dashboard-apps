import { instructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import { useSubscriptionModelsFrequencies } from '#hooks/useSubscriptionModelsFrequencies'
import { PageLayout, useResourceFilters } from '@commercelayer/app-elements'
import { useCallback, type FC } from 'react'
import { useLocation } from 'wouter'

export const Filters: FC = () => {
  const [, setLocation] = useLocation()
  const subscriptionModelsFrequencies = useSubscriptionModelsFrequencies()

  const filters = useCallback(() => {
    return useResourceFilters({
      instructions: instructions(subscriptionModelsFrequencies)
    })
  }, [subscriptionModelsFrequencies])

  const { FiltersForm, adapters } = filters()

  return (
    <PageLayout
      title='Filters'
      navigationButton={{
        onClick: () => {
          setLocation(
            appRoutes.list.makePath(
              adapters.adaptUrlQueryToUrlQuery({
                queryString: location.search
              })
            )
          )
        },
        label: 'Cancel',
        icon: 'x'
      }}
      overlay
    >
      <FiltersForm
        onSubmit={(filtersQueryString) => {
          setLocation(appRoutes.list.makePath({}, filtersQueryString))
        }}
      />
    </PageLayout>
  )
}
