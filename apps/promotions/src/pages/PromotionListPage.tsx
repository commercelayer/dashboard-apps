import { ListEmptyState } from '#components/ListEmptyState'
import { ListItemPromotion } from '#components/ListItemPromotion'
import type { PageProps } from '#components/Routes'
import { filtersInstructions } from '#data/filters'
import { presets } from '#data/lists'
import { appRoutes } from '#data/routes'
import {
  PageLayout,
  Spacer,
  useResourceFilters,
  useTokenProvider
} from '@commercelayer/app-elements'
import { useLocation } from 'wouter'
import { navigate, useSearch } from 'wouter/use-browser-location'

function Page(
  props: PageProps<typeof appRoutes.promotionList>
): React.JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()

  const queryString = useSearch()
  const [, setLocation] = useLocation()

  const { SearchWithNav, FilteredList, viewTitle, hasActiveFilter } =
    useResourceFilters({
      instructions: filtersInstructions
    })

  /** Whether the user is viewing only active promotions */
  const isActivePreset =
    viewTitle != null && viewTitle === presets.active.viewTitle

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
      />

      <Spacer bottom='14'>
        <FilteredList
          type='promotions'
          // @ts-expect-error // TODO: fix Promotion type in the sdk
          ItemTemplate={ListItemPromotion}
          query={{
            fields: {
              promotions: [
                'id',
                'starts_at',
                'expires_at',
                'name',
                'status',
                'coupons',
                'reference_origin',
                'disabled_at',
                'total_usage_limit',
                'total_usage_count',
                'coupon_codes_promotion_rule',
                'exclusive',
                'priority'
              ]
            },
            include: ['coupon_codes_promotion_rule'],
            pageSize: 25,
            sort: isActivePreset
              ? {
                  exclusive: 'desc',
                  priority: 'asc',
                  starts_at: 'asc',
                  created_at: 'desc'
                }
              : {
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
