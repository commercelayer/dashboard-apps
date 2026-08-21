import {
  Button,
  Stack,
  StackCell,
  useAppLinking,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Return } from "@commercelayer/sdk"

interface Props {
  returnObj: Return
}

/**
 * Where the return travels and what it belongs to: the customer's city and the
 * warehouse it goes back to, then the order and customer, both linked.
 *
 * Two stacks rather than one of four cells: consecutive stacks pull themselves
 * together into a single grid (`not-first:-mt-px`), so this reads as two rows of
 * two instead of four narrow columns.
 */
export const ReturnInfo = withSkeletonTemplate<Props>(
  ({ returnObj }): React.JSX.Element => {
    const { canAccess } = useTokenProvider()
    const { navigateTo } = useAppLinking()
    const { t } = useTranslation()

    const returnOrderMarket = returnObj.order?.market?.name
    const returnOrderNumber = `#${returnObj.order?.number}`
    const navigateToOrder = canAccess("orders")
      ? navigateTo({
          app: "orders",
          resourceId: returnObj?.order?.id,
        })
      : {}

    const returnCustomerEmail = returnObj?.customer?.email
    const navigateToCustomer = canAccess("customers")
      ? navigateTo({
          app: "customers",
          resourceId: returnObj?.customer?.id,
        })
      : {}

    const originAddress = returnObj.origin_address

    return (
      <>
        <Stack size="small">
          <StackCell label={t("apps.returns.details.origin")}>
            {originAddress?.city == null
              ? undefined
              : `${originAddress.city}${
                  originAddress.country_code != null
                    ? ` (${originAddress.country_code})`
                    : ""
                }`}
          </StackCell>
          <StackCell label={t("apps.returns.details.destination")}>
            {returnObj.stock_location?.name}
          </StackCell>
        </Stack>
        <Stack size="small">
          <StackCell label={t("resources.orders.name")}>
            {canAccess("orders") ? (
              <Button variant="link" {...navigateToOrder}>
                {`${returnOrderMarket} ${returnOrderNumber}`}
              </Button>
            ) : (
              `${returnOrderMarket} ${returnOrderNumber}`
            )}
          </StackCell>
          <StackCell label={t("resources.customers.name")}>
            {canAccess("customers") ? (
              <Button variant="link" {...navigateToCustomer}>
                {returnCustomerEmail}
              </Button>
            ) : (
              returnCustomerEmail
            )}
          </StackCell>
        </Stack>
      </>
    )
  },
)
