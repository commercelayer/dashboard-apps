import { PageLayout, useResourceFilters } from "@commercelayer/app-elements"
import { useLocation } from "wouter"
import { instructions } from "#data/filters"
import { appRoutes } from "#data/routes"

export function Filters(): React.JSX.Element {
  const [, setLocation] = useLocation()
  const { FiltersForm, adapters } = useResourceFilters({
    instructions,
  })

  return (
    <PageLayout
      title="Filters"
      navigationButton={{
        label: "Back",
        icon: "arrowLeft",
        onClick: () => {
          setLocation(
            appRoutes.list.makePath(
              adapters.adaptUrlQueryToUrlQuery({
                queryString: location.search,
              }),
            ),
          )
        },
      }}
      overlay
    >
      <FiltersForm
        onSubmit={(filtersQueryString) => {
          setLocation(appRoutes.list.makePath(filtersQueryString))
        }}
      />
    </PageLayout>
  )
}

export default Filters
