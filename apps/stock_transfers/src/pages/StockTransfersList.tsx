import {
  PageLayout,
  Spacer,
  Tab,
  Tabs,
  useAppLinking,
  useResourceFilters,
} from "@commercelayer/app-elements"
import { useEffect, useMemo } from "react"
import { navigate, useSearch } from "wouter/use-browser-location"
import { ListEmptyState } from "#components/ListEmptyState"
import { useStockTransfersTableColumns } from "#components/stockTransfersTableColumns"
import { makeFiltersInstructions } from "#data/filters"
import { type StockTransferTab, stockTransferTabs } from "#data/lists"

export function StockTransfersList(): React.JSX.Element {
  const { navigateTo } = useAppLinking()

  const queryString = useSearch()

  /** The tab is kept in the url via `viewTitle`, so a refresh or a shared link restores it. */
  const [activeTabIndex, activeTab] = useMemo(() => {
    const viewTitle = new URLSearchParams(queryString).get("viewTitle")
    const index = stockTransferTabs.findIndex(
      (tab) => tab.formValues.viewTitle === viewTitle,
    )
    const resolvedIndex = index === -1 ? 0 : index
    return [
      resolvedIndex,
      stockTransferTabs[resolvedIndex] as StockTransferTab,
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
    instructions: makeFiltersInstructions({ hideFilterStatus: true }),
  })

  const columns = useStockTransfersTableColumns()

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

  const table = (
    <FilteredTable
      type="stock_transfers"
      columns={columns}
      query={{
        fields: {
          stock_transfers: [
            "id",
            "number",
            "status",
            "updated_at",
            "origin_stock_location",
            "destination_stock_location",
          ],
          stock_locations: ["id", "name"],
        },
        // the Origin and Destination columns read these relationships
        include: ["origin_stock_location", "destination_stock_location"],
        pageSize: 25,
      }}
      defaultSort="-updated_at"
      hideTitle
      getRowHref={(stockTransfer) =>
        navigateTo({ app: "stock_transfers", resourceId: stockTransfer.id })
          ?.href
      }
      onRowClick={(stockTransfer, event) => {
        navigateTo({
          app: "stock_transfers",
          resourceId: stockTransfer.id,
        })?.onClick(event as React.MouseEvent<HTMLAnchorElement>)
      }}
      emptyState={
        <ListEmptyState scope={hasActiveFilter ? "userFiltered" : "history"} />
      }
    />
  )

  return (
    <PageLayout title="Stock transfers" fullWidth>
      {/* Remounted per tab so `Tabs` (which owns its active index internally)
          picks up the tab restored from the url. */}
      <Tabs
        key={activeTabIndex}
        defaultTab={activeTabIndex}
        onTabSwitch={(index) => {
          const tab = stockTransferTabs[index]
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
        {stockTransferTabs.map((tab) => (
          <Tab key={tab.label} name={tab.label}>
            {/* the tab's own filters are the baseline: only what the user adds on
                top of them shows up as a removable pill */}
            <FiltersBar
              queryString={queryString}
              onUpdate={handleFiltersUpdate}
              defaultValues={tab.formValues}
            />
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
