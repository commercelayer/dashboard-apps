import { filtersInstructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import { PageLayout, useResourceFilters } from '@commercelayer/app-elements'
import { useLocation } from 'wouter'

export function Filters(): JSX.Element {
  const [, setLocation] = useLocation()
  const { FiltersForm, adapters } = useResourceFilters({
    instructions: filtersInstructions
  })

  return (
    <PageLayout
      title='Filters'
      overlay
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
        label: 'Cancel',
        icon: 'x'
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
