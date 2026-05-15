import { PageLayout, useResourceFilters } from "@commercelayer/app-elements"
import { useLocation, useRoute } from "wouter"
import { stockItemsInstructions } from "#data/filters"
import { appRoutes } from "#data/routes"

export function Filters(): React.JSX.Element {
  const [, setLocation] = useLocation()

  const [matchesStockLocation, stockLocationParams] = useRoute<{
    stockLocationId: string
  }>(appRoutes.stockLocationFilters.path)

  const stockLocationId = matchesStockLocation
    ? (stockLocationParams?.stockLocationId ?? "")
    : ""

  const { FiltersForm, adapters } = useResourceFilters({
    instructions: stockItemsInstructions({ stockLocationId }),
  })

  const makeListPath = (filters?: string): string =>
    stockLocationId !== ""
      ? appRoutes.stockLocation.makePath(stockLocationId, filters)
      : appRoutes.list.makePath(filters)

  return (
    <PageLayout
      title="Filters"
      navigationButton={{
        label: "Back",
        icon: "arrowLeft",
        onClick: () => {
          setLocation(
            makeListPath(
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
          setLocation(makeListPath(filtersQueryString))
        }}
      />
    </PageLayout>
  )
}

export default Filters
