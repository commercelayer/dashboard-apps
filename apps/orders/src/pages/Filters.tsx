import { makeInstructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import { PageLayout, useResourceFilters } from '@commercelayer/app-elements'
import { useLocation } from 'wouter'

function Filters(): JSX.Element {
  const [, setLocation] = useLocation()
  const { FiltersForm, adapters } = useResourceFilters({
    instructions: makeInstructions({})
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
