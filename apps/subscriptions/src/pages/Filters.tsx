import { PageLayout, useResourceFilters } from "@commercelayer/app-elements"
import { type FC, useCallback } from "react"
import { useLocation } from "wouter"
import { instructions } from "#data/filters"
import { appRoutes } from "#data/routes"
import { useSubscriptionModelsFrequencies } from "#hooks/useSubscriptionModelsFrequencies"

export const Filters: FC = () => {
  const [, setLocation] = useLocation()
  const subscriptionModelsFrequencies = useSubscriptionModelsFrequencies()

  const filters = useCallback(() => {
    return useResourceFilters({
      instructions: instructions(subscriptionModelsFrequencies),
    })
  }, [subscriptionModelsFrequencies])

  const { FiltersForm, adapters } = filters()

  return (
    <PageLayout
      title="Filters"
      navigationButton={{
        onClick: () => {
          setLocation(
            appRoutes.list.makePath(
              adapters.adaptUrlQueryToUrlQuery({
                queryString: location.search,
              }),
            ),
          )
        },
        label: "Cancel",
        icon: "x",
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
