import { makeCartsInstructions, makeInstructions } from '#data/filters'
import { presets } from '#data/lists'
import { appRoutes } from '#data/routes'
import { PageLayout, useResourceFilters } from '@commercelayer/app-elements'
import { useLocation } from 'wouter'
import { useSearch } from 'wouter/use-browser-location'

function Filters(): JSX.Element {
  const [, setLocation] = useLocation()

  const queryString = useSearch()
  const isPendingOrdersList =
    new URLSearchParams(queryString).get('viewTitle') ===
    presets.pending.viewTitle

  const { FiltersForm, adapters } = useResourceFilters({
    instructions: isPendingOrdersList
      ? makeCartsInstructions()
      : makeInstructions({})
  })

  const searchParams = new URLSearchParams(location.search)

  return (
    <PageLayout
      overlay
      title='Filters'
      navigationButton={{
        onClick: () => {
          setLocation(
            appRoutes.list.makePath(
              {},
              adapters.adaptUrlQueryToUrlQuery({
                queryString: location.search
              })
            )
          )
        },
        label: searchParams.has('viewTitle')
          ? // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            (searchParams.get('viewTitle') as string)
          : 'Orders',
        icon: 'arrowLeft'
      }}
    >
      <FiltersForm
        onSubmit={(filtersQueryString) => {
          setLocation(appRoutes.list.makePath({}, filtersQueryString))
        }}
      />
    </PageLayout>
  )
}

export default Filters
