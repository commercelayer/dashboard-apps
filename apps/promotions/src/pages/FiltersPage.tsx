import type { PageProps } from '#components/Routes'
import { filtersInstructions, predicateWhitelist } from '#data/filters'
import { appRoutes } from '#data/routes'
import { PageLayout, useResourceFilters } from '@commercelayer/app-elements'
import { useLocation } from 'wouter'

function Page(props: PageProps<typeof appRoutes.filters>): JSX.Element {
  const [, setLocation] = useLocation()
  const { FiltersForm, adapters } = useResourceFilters({
    instructions: filtersInstructions,
    predicateWhitelist
  })

  return (
    <PageLayout
      title='Filters'
      overlay={props.overlay}
      navigationButton={{
        label: 'Cancel',
        icon: 'x',
        onClick() {
          setLocation(
            appRoutes.promotionList.makePath(
              adapters.adaptUrlQueryToUrlQuery({
                queryString: location.search
              })
            )
          )
        }
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
