import {
  Button,
  Spacer,
  Stack,
  Text,
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
        <Stack>
          <InfoCell label={t("apps.returns.details.origin")}>
            {originAddress?.city == null ? (
              <EmptyValue />
            ) : (
              `${originAddress.city}${
                originAddress.country_code != null
                  ? ` (${originAddress.country_code})`
                  : ""
              }`
            )}
          </InfoCell>
          <InfoCell label={t("apps.returns.details.destination")}>
            {returnObj.stock_location?.name ?? <EmptyValue />}
          </InfoCell>
        </Stack>
        <Stack>
          <InfoCell label={t("resources.orders.name")}>
            {canAccess("orders") ? (
              <Button variant="link" {...navigateToOrder}>
                {`${returnOrderMarket} ${returnOrderNumber}`}
              </Button>
            ) : (
              `${returnOrderMarket} ${returnOrderNumber}`
            )}
          </InfoCell>
          <InfoCell label={t("resources.customers.name")}>
            {canAccess("customers") ? (
              <Button variant="link" {...navigateToCustomer}>
                {returnCustomerEmail}
              </Button>
            ) : (
              returnCustomerEmail
            )}
          </InfoCell>
        </Stack>
      </>
    )
  },
)

/** One cell of the stack: a muted label above the value. */
function InfoCell({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div>
      <Spacer bottom="2">
        <Text size="small" tag="div" variant="info" weight="semibold">
          {label}
        </Text>
      </Spacer>
      <Text tag="div" weight="semibold">
        {children}
      </Text>
    </div>
  )
}

function EmptyValue(): React.JSX.Element {
  return <Text className="text-gray-300">&#8212;</Text>
}
