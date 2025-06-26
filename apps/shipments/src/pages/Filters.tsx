import { makeFiltersInstructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import {
  PageLayout,
  useResourceFilters,
  useTranslation
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'
import { useSearch } from 'wouter/use-browser-location'

function Filters(): React.JSX.Element {
  const [, setLocation] = useLocation()
  const { t } = useTranslation()
  const queryString = useSearch()
  const params = new URLSearchParams(queryString)
  const viewTitle = params.get('viewTitle') ?? undefined
  const isInViewPreset = viewTitle != null

  const { FiltersForm, adapters } = useResourceFilters({
    instructions: makeFiltersInstructions({
      hideFilterStatus: isInViewPreset
    })
  })

  return (
    <PageLayout
      title={t('common.filters')}
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
        label: t('common.cancel'),
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

export default Filters
