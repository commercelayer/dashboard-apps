import {
  PageLayout,
  Spacer,
  Tab,
  Tabs,
  useAppLinking,
  useCoreSdkProvider,
  useResourceFilters,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import { type FC, useEffect, useMemo } from "react"
import { useCountryCodes } from "src/metricsApi/useCountryCodes"
import { useLocation } from "wouter"
import { navigate, useSearch } from "wouter/use-browser-location"
import { ListEmptyState } from "#components/ListEmptyState"
import { useOrdersTableColumns } from "#components/ordersTableColumns"
import { makeCartsInstructions, makeInstructions } from "#data/filters"
import {
  type OrderTab,
  orderTabs,
  orderTabsPredicateWhitelist,
} from "#data/lists"
import { appRoutes } from "#data/routes"

const Home: FC = () => {
  const [, setLocation] = useLocation()
  const { t } = useTranslation()
  const { sdkClient } = useCoreSdkProvider()
  const { canUser } = useTokenProvider()
  const { navigateTo } = useAppLinking()
  const { countryCodes } = useCountryCodes()
  const queryString = useSearch()

  /** The tab is kept in the url via `viewTitle`, so a refresh or a shared link restores it. */
  const [activeTabIndex, activeTab] = useMemo(() => {
    const viewTitle = new URLSearchParams(queryString).get("viewTitle")
    const index = orderTabs.findIndex(
      (tab) => tab.formValues.viewTitle === viewTitle,
    )
    const resolvedIndex = index === -1 ? 0 : index
    return [resolvedIndex, orderTabs[resolvedIndex] as OrderTab] as const
  }, [queryString])

  const {
    FilteredTable,
    FiltersBar,
    FiltersDrawer,
    adapters,
    hasActiveFilter,
  } = useResourceFilters({
    instructions:
      activeTab.instructions === "carts"
        ? makeCartsInstructions()
        : makeInstructions({
            countryCodes,
            hiddenFilters: activeTab.hiddenFilters,
          }),
    predicateWhitelist: orderTabsPredicateWhitelist,
  })

  const handleFiltersUpdate = (queryString: string): void => {
    navigate(`?${queryString}`, { replace: true })
  }

  /**
   * Landing without a tab in the url (e.g. `/orders`) would show the first tab
   * as active while none of its filters are applied, so they are written once.
   *
   * Filters already present in the url take precedence: an inbound link such as
   * `/orders?tags_id_in=xxx` (from an order detail, or from another app) must keep
   * filtering by what it asked for, and only get the tab's filters on top.
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

  const columns = useOrdersTableColumns(activeTab.sortBy)

  const table = (
    <FilteredTable
      type="orders"
      columns={columns}
      metricsQuery={{
        search: {
          limit: 25,
          fields: ["order.*", "billing_address.*", "market.*", "customer.*"],
        },
      }}
      defaultSort={`-${activeTab.sortBy}`}
      hideTitle
      getRowHref={(order) =>
        navigateTo({ app: "orders", resourceId: order.id })?.href
      }
      onRowClick={(order, event) => {
        navigateTo({ app: "orders", resourceId: order.id })?.onClick(
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
      title={t("resources.orders.name_other")}
      fullWidth
      toolbar={{
        buttons: canUser("create", "orders")
          ? [
              {
                icon: "plus",
                label: `${t("common.new")} ${t("resources.orders.name").toLowerCase()}`,
                size: "small",
                onClick: () => {
                  void sdkClient.markets
                    .list({
                      fields: ["id"],
                      filters: {
                        disabled_at_null: true,
                      },
                      pageSize: 1,
                    })
                    .then((markets) => {
                      if (markets.meta.recordCount > 1) {
                        setLocation(appRoutes.new.makePath({}))
                      } else {
                        const [resource] = markets
                        if (resource != null) {
                          void sdkClient.orders
                            .create({
                              market: {
                                type: "markets",
                                id: resource.id,
                              },
                            })
                            .then((order) => {
                              setLocation(
                                appRoutes.new.makePath({ orderId: order.id }),
                              )
                            })
                        }
                      }
                    })
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
          const tab = orderTabs[index]
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
        {orderTabs.map((tab) => (
          <Tab
            key={tab.label}
            name={tab.label}
            separatorBefore={tab.separatorBefore}
          >
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

export default Home
