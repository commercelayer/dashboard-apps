import {
  Alert,
  PageLayout,
  Spacer,
  Tab,
  Tabs,
  Text,
  useAppLinking,
  useResourceFilters,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import { useEffect, useMemo } from "react"
import { Link, useLocation } from "wouter"
import { navigate, useSearch } from "wouter/use-browser-location"
import { useCustomersTableColumns } from "#components/customersTableColumns"
import { ListEmptyState } from "#components/ListEmptyState"
import { instructions } from "#data/filters"
import { type CustomerTab, customerTabs } from "#data/lists"
import { appRoutes } from "#data/routes"
import { useCustomerAnonymizedPendingList } from "#hooks/useCustomerAnonymizedPendingList"

function CustomerList(): React.JSX.Element {
  const { canUser } = useTokenProvider()
  const { t } = useTranslation()
  const { navigateTo } = useAppLinking()

  const queryString = useSearch()
  const [, setLocation] = useLocation()

  /** The tab is kept in the url via `viewTitle`, so a refresh or a shared link restores it. */
  const [activeTabIndex, activeTab] = useMemo(() => {
    const viewTitle = new URLSearchParams(queryString).get("viewTitle")
    const index = customerTabs.findIndex(
      (tab) => tab.formValues.viewTitle === viewTitle,
    )
    const resolvedIndex = index === -1 ? 0 : index
    return [resolvedIndex, customerTabs[resolvedIndex] as CustomerTab] as const
  }, [queryString])

  const {
    FilteredTable,
    FiltersBar,
    FiltersDrawer,
    adapters,
    hasActiveFilter,
  } = useResourceFilters({
    instructions,
  })

  const columns = useCustomersTableColumns()

  const { customers: customersWithPendingAnonymization } =
    useCustomerAnonymizedPendingList({})
  const hasPendingAnonymization =
    customersWithPendingAnonymization != null &&
    customersWithPendingAnonymization.length > 0

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
      type="customers"
      columns={columns}
      query={{
        fields: {
          customers: [
            "id",
            "email",
            "status",
            "has_password",
            "total_orders_count",
            "created_at",
            "updated_at",
            "customer_group",
          ],
        },
        // the Group column reads this relationship
        include: ["customer_group"],
        pageSize: 25,
      }}
      defaultSort="-created_at"
      hideTitle
      getRowHref={(customer) =>
        navigateTo({ app: "customers", resourceId: customer.id })?.href
      }
      onRowClick={(customer, event) => {
        navigateTo({ app: "customers", resourceId: customer.id })?.onClick(
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
      title={t("resources.customers.name_other")}
      fullWidth
      toolbar={{
        buttons: canUser("create", "customers")
          ? [
              {
                icon: "plus",
                label: `${t("common.new")} ${t("resources.customers.name").toLowerCase()}`,
                size: "small",
                onClick: () => {
                  setLocation(appRoutes.new.makePath())
                },
              },
            ]
          : undefined,
      }}
    >
      {hasPendingAnonymization && (
        <Spacer bottom="14">
          <Alert status="warning">
            <Text weight="semibold">Pending anonymization requests:</Text>
            <Spacer top="2">
              {customersWithPendingAnonymization.map((customer) => (
                <Spacer key={customer.id} bottom="1">
                  <Text color="black" size="small" weight="semibold">
                    <Link href={appRoutes.details.makePath(customer.id)}>
                      {customer.email}
                    </Link>
                  </Text>
                </Spacer>
              ))}
            </Spacer>
          </Alert>
        </Spacer>
      )}

      {/* Remounted per tab so `Tabs` (which owns its active index internally)
          picks up the tab restored from the url. */}
      <Tabs
        key={activeTabIndex}
        defaultTab={activeTabIndex}
        onTabSwitch={(index) => {
          const tab = customerTabs[index]
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
        {customerTabs.map((tab) => (
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

export default CustomerList
