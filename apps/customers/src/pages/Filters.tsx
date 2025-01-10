import { instructions } from '#data/filters'
import { appRoutes } from '#data/routes'
import {
  PageLayout,
  useResourceFilters,
  useTranslation
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'

export function Filters(): JSX.Element {
  const [, setLocation] = useLocation()
  const { FiltersForm, adapters } = useResourceFilters({
    instructions
  })
  const { t } = useTranslation()

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
