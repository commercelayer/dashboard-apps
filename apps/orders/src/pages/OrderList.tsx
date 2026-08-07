import {
  PageLayout,
  Spacer,
  useAppLinking,
  useResourceFilters,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { type FC, useCallback } from "react"
import { useCountryCodes } from "src/metricsApi/useCountryCodes"
import { useLocation } from "wouter"
import { navigate, useSearch } from "wouter/use-browser-location"
import { ListEmptyState } from "#components/ListEmptyState"
import { useOrdersTableColumns } from "#components/ordersTableColumns"
import { makeCartsInstructions, makeInstructions } from "#data/filters"
import { presets } from "#data/lists"
import { appRoutes } from "#data/routes"

const OrderList: FC = () => {
  const {
    settings: { mode },
  } = useTokenProvider()
  const { t } = useTranslation()
  const { countryCodes } = useCountryCodes()
  const queryString = useSearch()
  const [, setLocation] = useLocation()
  const { navigateTo } = useAppLinking()

  const isPendingOrdersList =
    new URLSearchParams(queryString).get("viewTitle") ===
    presets.pending.viewTitle

  // carts are sorted by last update, placed orders by placement date.
  // Metrics attributes are namespaced, unlike the filters' date predicate.
  const metricsSortAttribute = isPendingOrdersList
    ? "order.updated_at"
    : "order.placed_at"

  const { SearchWithNav, FilteredTable, viewTitle, hasActiveFilter, adapters } =
    useResourceFilters({
      instructions: isPendingOrdersList
        ? makeCartsInstructions()
        : makeInstructions({
            sortByAttribute: "placed_at",
            countryCodes,
          }),
    })

  const activeFilters = adapters.adaptUrlQueryToFormValues({ queryString })
  const searchFilterValue = activeFilters?.aggregated_details
  const isMaybeIdSearch =
    typeof searchFilterValue === "string" &&
    /^[a-zA-Z]{10}$/.test(searchFilterValue)

  const preProcess = useCallback(
    (list: Order[]) => {
      if (!isMaybeIdSearch) return list

      const exactMatch = list.find((item) => item.id === searchFilterValue)
      if (exactMatch != null) return [exactMatch]

      // No exact match: drop case-insensitive ID false positives from the API
      return list.filter(
        (item) => item.id.toLowerCase() !== searchFilterValue.toLowerCase(),
      )
    },
    [isMaybeIdSearch, searchFilterValue],
  )

  const hideFiltersNav = !(
    viewTitle == null ||
    viewTitle === presets.history.viewTitle ||
    isPendingOrdersList
  )

  const columns = useOrdersTableColumns(metricsSortAttribute)

  return (
    <PageLayout
      title={viewTitle ?? presets.history.viewTitle}
      mode={mode}
      gap="only-top"
      // the table is data-dense: let it use all the width available
      fullWidth
      navigationButton={{
        onClick: () => {
          setLocation(appRoutes.home.makePath({}))
        },
        label: t("resources.orders.name_other"),
        icon: "arrowLeft",
      }}
    >
      <SearchWithNav
        queryString={queryString}
        onUpdate={(qs) => {
          navigate(`?${qs}`, {
            replace: true,
          })
        }}
        onFilterClick={(queryString) => {
          setLocation(appRoutes.filters.makePath({}, queryString))
        }}
        hideFiltersNav={hideFiltersNav}
        searchBarDebounceMs={1000}
      />

      <Spacer bottom="14">
        <FilteredTable
          type="orders"
          columns={columns}
          metricsQuery={{
            search: {
              limit: 25,
              fields: [
                "order.*",
                "billing_address.*",
                "market.*",
                "customer.*",
              ],
            },
          }}
          defaultSort={`-${metricsSortAttribute}`}
          preProcess={preProcess}
          hideTitle={viewTitle === presets.pending.viewTitle}
          getRowHref={(order) =>
            navigateTo({ app: "orders", resourceId: order.id })?.href
          }
          onRowClick={(order, event) => {
            // the row's click target is the stretched anchor; `navigateTo` types
            // its handler against the specific elements it supports
            navigateTo({ app: "orders", resourceId: order.id })?.onClick(
              event as React.MouseEvent<HTMLAnchorElement>,
            )
          }}
          emptyState={
            <ListEmptyState
              scope={
                hasActiveFilter
                  ? "userFiltered"
                  : viewTitle !== presets.history.viewTitle
                    ? "presetView"
                    : "history"
              }
            />
          }
        />
      </Spacer>
    </PageLayout>
  )
}

export default OrderList
