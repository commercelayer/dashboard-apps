import { filtersInstructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import {
  PageLayout,
  useResourceFilters,
  useTranslation
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'

function Filters(): JSX.Element {
  const [, setLocation] = useLocation()
  const { t } = useTranslation()
  const { FiltersForm, adapters } = useResourceFilters({
    instructions: filtersInstructions
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
