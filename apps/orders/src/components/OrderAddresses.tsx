import {
  Button,
  Icon,
  ResourceAddress,
  Section,
  Spacer,
  Stack,
  Text,
  useCoreSdkProvider,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Order } from "@commercelayer/sdk"
import { useOrderDetails } from "#hooks/useOrderDetails"
import { useCustomerAddressOverlay } from "./NewOrder/hooks/useCustomerAddressOverlay"
import { useOrderStatus } from "./OrderSummary/hooks/useOrderStatus"

interface Props {
  order: Order
}

export const OrderAddresses = withSkeletonTemplate<Props>(
  ({ order }): React.JSX.Element | null => {
    const { sdkClient } = useCoreSdkProvider()
    const { t } = useTranslation()
    const { isEditing } = useOrderStatus(order)
    const { mutateOrder } = useOrderDetails(order.id)
    // An agreement order points at the agreement's own address records, not at
    // copies: an edit here would change the agreement, and every order placed
    // under it from then on. The seller changes them on the agreement instead.
    const {
      settings: { extras },
    } = useTokenProvider()
    const isFromAgreement =
      extras?.organization?.isAgreementsEnabled === true &&
      order.agreement != null
    const isEditable =
      (isEditing || order.status !== "draft") && !isFromAgreement
    const { Overlay: AssignAddressOverlay, open: openAssignAddressOverlay } =
      useCustomerAddressOverlay(order, () => {
        void mutateOrder()
      })

    if (order.customer == null) {
      return null
    }

    return (
      <>
        <AssignAddressOverlay />
        <Section
          className="print:break-inside-avoid"
          border="none"
          title={t("resources.addresses.name_other")}
          actionButton={
            isEditable &&
            (order.customer?.customer_addresses ?? []).length > 0 && (
              <div className="print:hidden">
                <Button
                  alignItems="center"
                  variant="secondary"
                  size="mini"
                  onClick={() => {
                    openAssignAddressOverlay()
                  }}
                >
                  <Icon name="plus" />
                  {t("common.select_resource", {
                    resource: t("resources.addresses.name").toLowerCase(),
                  })}
                </Button>
              </div>
            )
          }
        >
          {isFromAgreement && (
            <Spacer bottom="4">
              <Text tag="div" size="small" variant="info">
                {order.agreement?.name != null
                  ? `These are the addresses of the agreement ${order.agreement.name}.`
                  : "These are the agreement's addresses."}{" "}
                Change them on the agreement.
              </Text>
            </Spacer>
          )}
          <Stack>
            <ResourceAddress
              title={t("resources.orders.attributes.billing_address")}
              address={order.billing_address}
              editable={isEditable}
              onCreate={(address) => {
                void sdkClient.orders.update({
                  id: order.id,
                  billing_address: {
                    type: "addresses",
                    id: address.id,
                  },
                })
              }}
              showBillingInfo
              requiresBillingInfo={order.requires_billing_info ?? undefined}
            />
            <ResourceAddress
              title={t("resources.orders.attributes.shipping_address")}
              address={order.shipping_address}
              editable={isEditable}
              onCreate={(address) => {
                void sdkClient.orders.update({
                  id: order.id,
                  shipping_address: {
                    type: "addresses",
                    id: address.id,
                  },
                })
              }}
            />
          </Stack>
        </Section>
      </>
    )
  },
)
