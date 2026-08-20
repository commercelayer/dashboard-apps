import {
  formatDateWithPredicate,
  Stack,
  StackCell,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Customer } from "@commercelayer/sdk"

interface Props {
  customer: Customer
}

/**
 * Summary of the customer, as the row of facts the other details pages open with:
 * label above value, side by side once there is room for them.
 *
 * The status is not repeated here: it is shown as a badge next to the page title.
 */
export const CustomerInfo = withSkeletonTemplate<Props>(
  ({ customer }): React.JSX.Element => {
    const { user } = useTokenProvider()
    const { t } = useTranslation()

    const newsletterSubscribedAt =
      customer.customer_subscriptions?.[0]?.created_at

    // two cells per row, as a small `Stack` is meant to be read: consecutive
    // stacks merge their borders, so the two rows still read as one block
    return (
      <>
        <Stack size="small">
          <StackCell label={t("resources.orders.name_other")}>
            {customer.total_orders_count ?? 0}
          </StackCell>
          <StackCell label={t("apps.customers.details.type")}>
            {customer?.has_password === true
              ? t("apps.customers.details.registered")
              : t("apps.customers.details.guest")}
          </StackCell>
        </Stack>
        <Stack size="small">
          <StackCell label={t("apps.customers.form.customer_group_label")}>
            {/* an empty cell renders as a dash on its own */}
            {customer?.customer_group?.name}
          </StackCell>
          <StackCell label={t("apps.customers.details.newsletter")}>
            {newsletterSubscribedAt != null
              ? formatDateWithPredicate({
                  predicate: t("apps.customers.details.subscribed"),
                  isoDate: newsletterSubscribedAt,
                  timezone: user?.timezone,
                  locale: user?.locale,
                })
              : "Not subscribed"}
          </StackCell>
        </Stack>
      </>
    )
  },
)
