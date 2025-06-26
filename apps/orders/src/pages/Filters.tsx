import { makeCartsInstructions, makeInstructions } from '#data/filters'
import { presets } from '#data/lists'
import { appRoutes } from '#data/routes'
import {
  PageLayout,
  useResourceFilters,
  useTranslation
} from '@commercelayer/app-elements'
import type { FC } from 'react'
import { useCountryCodes } from 'src/metricsApi/useCountryCodes'
import { useLocation } from 'wouter'
import { useSearch } from 'wouter/use-browser-location'

const Filters: FC = () => {
  const { countryCodes } = useCountryCodes()
  const [, setLocation] = useLocation()
  const { t } = useTranslation()

  const queryString = useSearch()
  const isPendingOrdersList =
    new URLSearchParams(queryString).get('viewTitle') ===
    presets.pending.viewTitle

  const { FiltersForm, adapters } = useResourceFilters({
    instructions: isPendingOrdersList
      ? makeCartsInstructions()
      : makeInstructions({
          countryCodes
        })
  })

  const searchParams = new URLSearchParams(location.search)

  return (
    <PageLayout
      overlay
      title={t('common.filters')}
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
          : t('resources.orders.name_other'),
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
