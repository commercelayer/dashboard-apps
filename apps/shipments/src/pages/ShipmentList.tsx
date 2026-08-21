import {
  EmptyState,
  PageLayout,
  Spacer,
  Tab,
  Tabs,
  useAppLinking,
  useResourceFilters,
  useTranslation,
} from "@commercelayer/app-elements"
import { useEffect, useMemo } from "react"
import { navigate, useSearch } from "wouter/use-browser-location"
import { useShipmentsTableColumns } from "#components/shipmentsTableColumns"
import { makeFiltersInstructions } from "#data/filters"
import { type ShipmentTab, shipmentTabs } from "#data/lists"

function ShipmentList(): React.JSX.Element {
  const { t } = useTranslation()
  const { navigateTo } = useAppLinking()

  const queryString = useSearch()

  /** The tab is kept in the url via `viewTitle`, so a refresh or a shared link restores it. */
  const [activeTabIndex, activeTab] = useMemo(() => {
    const viewTitle = new URLSearchParams(queryString).get("viewTitle")
    const index = shipmentTabs.findIndex(
      (tab) => tab.formValues.viewTitle === viewTitle,
    )
    const resolvedIndex = index === -1 ? 0 : index
    return [resolvedIndex, shipmentTabs[resolvedIndex] as ShipmentTab] as const
  }, [queryString])

  const { FilteredTable, FiltersBar, FiltersDrawer, adapters } =
    useResourceFilters({
      // the tab owns the status, so the status field would only contradict it
      instructions: makeFiltersInstructions({ hideFilterStatus: true }),
    })

  const columns = useShipmentsTableColumns()

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
      type="shipments"
      columns={columns}
      query={{
        pageSize: 25,
        // the Origin and Destination columns read these relationships
        include: ["stock_location", "shipping_address"],
      }}
      defaultSort="-updated_at"
      hideTitle
      getRowHref={(shipment) =>
        navigateTo({ app: "shipments", resourceId: shipment.id })?.href
      }
      onRowClick={(shipment, event) => {
        navigateTo({ app: "shipments", resourceId: shipment.id })?.onClick(
          event as React.MouseEvent<HTMLAnchorElement>,
        )
      }}
      emptyState={
        <EmptyState
          title={t("common.empty_states.all_good_here")}
          description={
            <div>
              <p>
                {t("common.empty_states.no_resources_found_for_list", {
                  resources: t("resources.shipments.name_other").toLowerCase(),
                })}
              </p>
            </div>
          }
        />
      }
    />
  )

  return (
    <PageLayout title={t("resources.shipments.name_other")} fullWidth>
      {/* Remounted per tab so `Tabs` (which owns its active index internally)
          picks up the tab restored from the url. */}
      <Tabs
        key={activeTabIndex}
        defaultTab={activeTabIndex}
        onTabSwitch={(index) => {
          const tab = shipmentTabs[index]
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
        {shipmentTabs.map((tab) => (
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

export default ShipmentList
