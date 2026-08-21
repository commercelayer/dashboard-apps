import {
  EmptyState,
  PageLayout,
  Spacer,
  Tab,
  Tabs,
  useAppLinking,
  useResourceFilters,
  useTokenProvider,
} from "@commercelayer/app-elements"
import { type FC, useEffect, useMemo } from "react"
import { navigate, useSearch } from "wouter/use-browser-location"
import { ListEmptyState } from "#components/ListEmptyState"
import { useSubscriptionsTableColumns } from "#components/subscriptionsTableColumns"
import { instructions } from "#data/filters"
import { type SubscriptionTab, subscriptionTabs } from "#data/lists"
import { useSubscriptionModelsFrequencies } from "#hooks/useSubscriptionModelsFrequencies"

export const SubscriptionsList: FC = () => {
  const { settings, canUser } = useTokenProvider()
  const { navigateTo } = useAppLinking()
  const queryString = useSearch()

  const subscriptionModelsFrequencies = useSubscriptionModelsFrequencies()

  /** The tab is kept in the url via `viewTitle`, so a refresh or a shared link restores it. */
  const [activeTabIndex, activeTab] = useMemo(() => {
    const viewTitle = new URLSearchParams(queryString).get("viewTitle")
    const index = subscriptionTabs.findIndex(
      (tab) => tab.formValues.viewTitle === viewTitle,
    )
    const resolvedIndex = index === -1 ? 0 : index
    return [
      resolvedIndex,
      subscriptionTabs[resolvedIndex] as SubscriptionTab,
    ] as const
  }, [queryString])

  const {
    FilteredTable,
    FiltersBar,
    FiltersDrawer,
    adapters,
    hasActiveFilter,
  } = useResourceFilters({
    // the tab owns the status, so the status field would only contradict it
    instructions: instructions(subscriptionModelsFrequencies, {
      hideFilterStatus: true,
    }),
  })

  const columns = useSubscriptionsTableColumns()

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

  if (!canUser("read", "order_subscriptions")) {
    return (
      <PageLayout title="Subscriptions" mode={settings.mode} fullWidth>
        <EmptyState title="You are not authorized" />
      </PageLayout>
    )
  }

  const table = (
    <FilteredTable
      type="order_subscriptions"
      columns={columns}
      query={{
        // the Customer column reads the name off the source order's billing address
        include: ["customer", "source_order", "source_order.billing_address"],
        pageSize: 25,
      }}
      defaultSort="-updated_at"
      hideTitle
      getRowHref={(subscription) =>
        navigateTo({ app: "subscriptions", resourceId: subscription.id })?.href
      }
      onRowClick={(subscription, event) => {
        navigateTo({
          app: "subscriptions",
          resourceId: subscription.id,
        })?.onClick(event as React.MouseEvent<HTMLAnchorElement>)
      }}
      emptyState={
        <ListEmptyState scope={hasActiveFilter ? "userFiltered" : "history"} />
      }
    />
  )

  return (
    <PageLayout title="Subscriptions" mode={settings.mode} fullWidth>
      {/* Remounted per tab so `Tabs` (which owns its active index internally)
          picks up the tab restored from the url. */}
      <Tabs
        key={activeTabIndex}
        defaultTab={activeTabIndex}
        onTabSwitch={(index) => {
          const tab = subscriptionTabs[index]
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
        {subscriptionTabs.map((tab) => (
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
