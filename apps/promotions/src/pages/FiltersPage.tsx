import { PageLayout, useResourceFilters } from "@commercelayer/app-elements"
import { useLocation } from "wouter"
import type { PageProps } from "#components/Routes"
import { filtersInstructions } from "#data/filters"
import { appRoutes } from "#data/routes"

function Page(props: PageProps<typeof appRoutes.filters>): React.JSX.Element {
  const [, setLocation] = useLocation()
  const { FiltersForm, adapters } = useResourceFilters({
    instructions: filtersInstructions,
  })

  return (
    <PageLayout
      title="Filters"
      overlay={props.overlay}
      navigationButton={{
        label: "Cancel",
        icon: "x",
        onClick() {
          setLocation(
            appRoutes.promotionList.makePath(
              {},
              adapters.adaptUrlQueryToUrlQuery({
                queryString: location.search,
              }),
            ),
          )
        },
      }}
    >
      <FiltersForm
        onSubmit={(filtersQueryString) => {
          setLocation(appRoutes.promotionList.makePath({}, filtersQueryString))
        }}
      />
    </PageLayout>
  )
}

export default Page
