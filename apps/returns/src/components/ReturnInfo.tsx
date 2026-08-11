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
 * Order and customer, as a `Stack` so it lines up with the block above it:
 * consecutive stacks pull themselves together into one grid (`not-first:-mt-px`).
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

    return (
      <Stack>
        <div>
          <Spacer bottom="2">
            <Text size="small" tag="div" variant="info" weight="semibold">
              {t("resources.orders.name")}
            </Text>
          </Spacer>
          <Text tag="div" weight="semibold">
            {canAccess("orders") ? (
              <Button variant="link" {...navigateToOrder}>
                {`${returnOrderMarket} ${returnOrderNumber}`}
              </Button>
            ) : (
              `${returnOrderMarket} ${returnOrderNumber}`
            )}
          </Text>
        </div>
        <div>
          <Spacer bottom="2">
            <Text size="small" tag="div" variant="info" weight="semibold">
              {t("resources.customers.name")}
            </Text>
          </Spacer>
          <Text tag="div" weight="semibold">
            {canAccess("customers") ? (
              <Button variant="link" {...navigateToCustomer}>
                {returnCustomerEmail}
              </Button>
            ) : (
              returnCustomerEmail
            )}
          </Text>
        </div>
      </Stack>
    )
  },
)
