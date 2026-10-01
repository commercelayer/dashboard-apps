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
import type {
  Customer,
  CustomerPaymentSource,
  PaymentWallet,
} from "@commercelayer/sdk"
import { PaymentWalletCard } from "dashboard-apps-common/src/components/PaymentWalletCard"
import type { SetNonNullable, SetRequired } from "type-fest"
import { useCustomerPaymentWallets } from "#hooks/useCustomerPaymentWallets"

interface Props {
  customer: Customer
  onRemovedPaymentSource?: () => void
}

export const CustomerWallet = withSkeletonTemplate<Props>(
  ({ customer, onRemovedPaymentSource }) => {
    const { t } = useTranslation()
    const { paymentWallets, mutatePaymentWallets } = useCustomerPaymentWallets(
      customer.id,
    )

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

    if (customerPaymentSources?.length === 0 && paymentWallets.length === 0) {
      return <></>
    }

    return (
      <Section title={t("apps.customers.details.wallet")} border="none">
        {customerPaymentSources}
        {paymentWallets.map((paymentWallet) => (
          <CustomerPaymentWalletItem
            key={paymentWallet.id}
            paymentWallet={paymentWallet}
            onCanceledPaymentWallet={mutatePaymentWallets}
          />
        ))}
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

interface CustomerPaymentWalletItemProps {
  paymentWallet: PaymentWallet
  onCanceledPaymentWallet: () => void
}

/** A stored payment method; removing it cancels the wallet, so the gateway stops charging it. */
function CustomerPaymentWalletItem({
  paymentWallet,
  onCanceledPaymentWallet,
}: CustomerPaymentWalletItemProps): React.JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const { show: showCancelDialog, ConfirmDialog } = useConfirmDialog()
  const canCancel = canUser("update", "payment_wallets")

  return (
    <Spacer bottom="4">
      <PaymentWalletCard
        wallet={paymentWallet}
        actionButton={
          canCancel ? (
            <button type="button" onClick={showCancelDialog}>
              <Icon name="trash" size={18} />
            </button>
          ) : null
        }
      />
      {canCancel && (
        <ConfirmDialog
          icon="trash"
          title="Remove payment method"
          description="The customer can no longer pay with this card."
          confirm={{
            label: "Remove payment method",
            variant: "danger",
            onClick: async () => {
              await sdkClient.payment_wallets.update({
                id: paymentWallet.id,
                _cancel: true,
              })
              onCanceledPaymentWallet()
            },
          }}
        />
      )}
    </Spacer>
  )
}

export function hasPaymentSource(
  customerPaymentSource: CustomerPaymentSource,
): customerPaymentSource is SetRequired<
  SetNonNullable<CustomerPaymentSource, "payment_source">,
  "payment_source"
> {
  return customerPaymentSource.payment_source != null
}
