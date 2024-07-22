import { ListEmptyState } from '#components/ListEmptyState'
import { ListItemPromotion } from '#components/ListItemPromotion'
import type { PageProps } from '#components/Routes'
import { filtersInstructions, predicateWhitelist } from '#data/filters'
import { appRoutes } from '#data/routes'
import {
  PageLayout,
  Spacer,
  useResourceFilters,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'
import { navigate, useSearch } from 'wouter/use-browser-location'

function Page(props: PageProps<typeof appRoutes.promotionList>): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()

  const queryString = useSearch()
  const [, setLocation] = useLocation()

  const { SearchWithNav, FilteredList, viewTitle, hasActiveFilter } =
    useResourceFilters({
      instructions: filtersInstructions,
      predicateWhitelist
    })

  const hideFiltersNav = !(viewTitle == null)

  return (
    <PageLayout
      title={viewTitle ?? 'Promotions'}
      overlay={props.overlay}
      mode={mode}
      navigationButton={{
        label: 'Promotions',
        onClick() {
          setLocation(appRoutes.home.makePath({}))
        }
      }}
      gap='only-top'
    >
      <SearchWithNav
        queryString={queryString}
        onUpdate={(qs) => {
          navigate(`?${qs}`, {
            replace: true
          })
        }}
        onFilterClick={(queryString) => {
          setLocation(appRoutes.filters.makePath({}, queryString))
        }}
        hideFiltersNav={hideFiltersNav}
      />

      <Spacer bottom='14'>
        <FilteredList
          type='promotions'
          ItemTemplate={ListItemPromotion}
          query={{
            fields: {
              promotions: [
                'id',
                'starts_at',
                'expires_at',
                'name',
                'coupons',
                'reference_origin',
                'disabled_at',
                'total_usage_limit',
                'total_usage_count',
                'coupon_codes_promotion_rule'
              ]
            },
            include: ['coupon_codes_promotion_rule'],
            pageSize: 25,
            sort: {
              updated_at: 'desc'
            }
          }}
          emptyState={
            <ListEmptyState
              scope={hasActiveFilter ? 'userFiltered' : 'history'}
            />
          }
        />
      </Spacer>
    </PageLayout>
  )
}

export default Page
