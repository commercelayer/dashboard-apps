import {
  Icon,
  ResourcePaymentMethod,
  Section,
  Spacer,
  useConfirmDialog,
  useCoreSdkProvider,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Customer, CustomerPaymentSource } from "@commercelayer/sdk"
import type { SetNonNullable, SetRequired } from "type-fest"

interface Props {
  customer: Customer
  onRemovedPaymentSource?: () => void
}

export const CustomerWallet = withSkeletonTemplate<Props>(
  ({ customer, onRemovedPaymentSource }) => {
    const { t } = useTranslation()

    const customerPaymentSources = customer?.customer_payment_sources?.map(
      (customerPaymentSource) => {
        return hasPaymentSource(customerPaymentSource) ? (
          <CustomerWalletItem
            key={customerPaymentSource.id}
            customerPaymentSource={customerPaymentSource}
            onRemovedPaymentSource={onRemovedPaymentSource}
          />
        ) : null
      },
    )

    if (customerPaymentSources?.length === 0) return <></>

    return (
      <Section title={t("apps.customers.details.wallet")} border="none">
        {customerPaymentSources}
      </Section>
    )
  },
)

const CustomerWalletItem = withSkeletonTemplate<{
  customerPaymentSource: SetRequired<
    SetNonNullable<CustomerPaymentSource, "payment_source">,
    "payment_source"
  >
  onRemovedPaymentSource?: () => void
}>(({ customerPaymentSource, onRemovedPaymentSource }) => {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const { show: showDeleteDialog, ConfirmDialog } = useConfirmDialog()

  return (
    <Spacer bottom="4">
      <ResourcePaymentMethod
        resource={customerPaymentSource}
        actionButton={
          canUser("destroy", "customer_payment_sources") ? (
            <button
              type="button"
              onClick={() => {
                showDeleteDialog()
              }}
            >
              <Icon name="trash" size={18} />
            </button>
          ) : null
        }
      />
      {canUser("destroy", "customer_payment_sources") && (
        <ConfirmDialog
          icon="trash"
          title="Delete payment method"
          description="This action cannot be undone."
          confirm={{
            label: "Delete payment method",
            variant: "danger",
            onClick: async () => {
              await sdkClient.customer_payment_sources.delete(
                customerPaymentSource.id,
              )
              onRemovedPaymentSource?.()
            },
          }}
        />
      )}
    </Spacer>
  )
})

export function hasPaymentSource(
  customerPaymentSource: CustomerPaymentSource,
): customerPaymentSource is SetRequired<
  SetNonNullable<CustomerPaymentSource, "payment_source">,
  "payment_source"
> {
  return customerPaymentSource.payment_source != null
}
