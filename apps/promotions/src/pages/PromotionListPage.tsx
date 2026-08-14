import {
  PageLayout,
  Spacer,
  Tab,
  Tabs,
  useAppLinking,
  useResourceFilters,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { useEffect, useMemo } from "react"
import { useLocation } from "wouter"
import { navigate, useSearch } from "wouter/use-browser-location"
import { ListEmptyState } from "#components/ListEmptyState"
import { usePromotionsTableColumns } from "#components/promotionsTableColumns"
import type { PageProps } from "#components/Routes"
import { filtersInstructions } from "#data/filters"
import { getPromotionTabs, type PromotionTab } from "#data/lists"
import { appRoutes } from "#data/routes"
import { usePromotionPermission } from "#hooks/usePromotionPermission"

function Page(
  props: PageProps<typeof appRoutes.promotionList>,
): React.JSX.Element {
  const {
    settings: { mode },
  } = useTokenProvider()
  const { navigateTo } = useAppLinking()
  const [, setLocation] = useLocation()
  const { canUserManagePromotions } = usePromotionPermission()

  const queryString = useSearch()

  // rebuilt per render: the tabs compare against "now" (see `getPromotionTabs`)
  const promotionTabs = getPromotionTabs()

  /** The tab is kept in the url via `viewTitle`, so a refresh or a shared link restores it. */
  const [activeTabIndex, activeTab] = useMemo(() => {
    const viewTitle = new URLSearchParams(queryString).get("viewTitle")
    const index = promotionTabs.findIndex(
      (tab) => tab.formValues.viewTitle === viewTitle,
    )
    const resolvedIndex = index === -1 ? 0 : index
    return [
      resolvedIndex,
      promotionTabs[resolvedIndex] as PromotionTab,
    ] as const
  }, [queryString])

  const {
    FilteredTable,
    FiltersBar,
    FiltersDrawer,
    adapters,
    hasActiveFilter,
  } = useResourceFilters({
    instructions: filtersInstructions,
  })

  const columns = usePromotionsTableColumns()

  const handleFiltersUpdate = (queryString: string): void => {
    navigate(`?${queryString}`, { replace: true })
  }

  /**
   * Landing without a tab in the url would show the first tab as active while
   * none of its filters are applied, so they are written once. Filters already in
   * the url win, so an inbound link keeps filtering by what it asked for.
   */
  const hasTabInUrl = new URLSearchParams(queryString).get("viewTitle") != null
  useEffect(() => {
    if (!hasTabInUrl) {
      const incomingFilters = Object.entries(
        adapters.adaptUrlQueryToFormValues({ queryString }),
      ).filter(([, value]) => hasFilterValue(value))

      navigate(
        `?${adapters.adaptFormValuesToUrlQuery({
          formValues: {
            ...activeTab.formValues,
            ...Object.fromEntries(incomingFilters),
          },
        })}`,
        { replace: true },
      )
    }
  }, [hasTabInUrl])

  /** Active promotions are ordered the way they are evaluated, not by recency. */
  const isActiveTab = activeTab.label === "Active"

  const table = (
    <FilteredTable
      type="promotions"
      columns={columns}
      query={{
        // no sparse `fields`: `coupons_count` is not in the list type's field
        // union, and asking for a subset would drop it from the response
        pageSize: 25,
      }}
      defaultSort={isActiveTab ? "priority" : "-created_at"}
      hideTitle
      getRowHref={(promotion) =>
        navigateTo({ app: "promotions", resourceId: promotion.id })?.href
      }
      onRowClick={(promotion, event) => {
        navigateTo({ app: "promotions", resourceId: promotion.id })?.onClick(
          event as React.MouseEvent<HTMLAnchorElement>,
        )
      }}
      emptyState={
        <ListEmptyState scope={hasActiveFilter ? "userFiltered" : "history"} />
      }
    />
  )

  return (
    <PageLayout
      title="Promotions"
      overlay={props.overlay}
      mode={mode}
      fullWidth
      toolbar={{
        // creating any single promotion type is enough to offer the action: the
        // next page is where a type gets picked
        buttons: canUserManagePromotions("create", "atLeastOne")
          ? [
              {
                icon: "plus",
                label: "New promotion",
                size: "small",
                onClick: () => {
                  setLocation(appRoutes.newSelectType.makePath({}))
                },
              },
            ]
          : undefined,
      }}
    >
      {/* Remounted per tab so `Tabs` (which owns its active index internally)
          picks up the tab restored from the url. */}
      <Tabs
        key={activeTabIndex}
        defaultTab={activeTabIndex}
        onTabSwitch={(index) => {
          const tab = promotionTabs[index]
          if (tab == null || index === activeTabIndex) {
            return
          }
          // switching tab replaces the filters with the tab's own ones
          navigate(
            `?${adapters.adaptFormValuesToUrlQuery({
              formValues: tab.formValues,
            })}`,
            { replace: true },
          )
        }}
      >
        {promotionTabs.map((tab) => (
          <Tab key={tab.label} name={tab.label}>
            {/* The tab's own filters are the baseline: only what the user adds
                on top of them shows up as a removable pill. The spacer brings the
                gap below the tab bar to 24px: 16 from the panel, 8 from here. */}
            <Spacer top="2">
              <FiltersBar
                queryString={queryString}
                onUpdate={handleFiltersUpdate}
                defaultValues={tab.formValues}
              />
            </Spacer>
            <Spacer bottom="14">{table}</Spacer>
          </Tab>
        ))}
      </Tabs>

      <FiltersDrawer onUpdate={handleFiltersUpdate} />
    </PageLayout>
  )
}

/**
 * Whether a filter value is actually set. Not `lodash/isEmpty`, which reports
 * booleans and numbers as empty and would drop them.
 */
function hasFilterValue(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0
  }
  return value != null && value !== ""
}

export default Page
