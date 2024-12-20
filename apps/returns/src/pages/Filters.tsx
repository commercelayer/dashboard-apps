import { instructions } from '#data/filters'
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
    instructions
  })

  return (
    <PageLayout
      title={t('common.filters')}
      navigationButton={{
        label: t('common.back'),
        icon: 'arrowLeft',
        onClick: () => {
          setLocation(
            appRoutes.list.makePath(
              adapters.adaptUrlQueryToUrlQuery({
                queryString: location.search
              })
            )
          )
        }
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
