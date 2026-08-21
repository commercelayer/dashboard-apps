import {
  ListItem,
  ResourceAddress,
  Section,
  useConfirmDialog,
  useCoreSdkProvider,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Customer, CustomerAddress } from "@commercelayer/sdk"
import { useState } from "react"

interface Props {
  customer: Customer
  onRemovedAddress?: () => void
}

export const CustomerAddresses = withSkeletonTemplate<Props>(
  ({ customer, onRemovedAddress }): React.JSX.Element | null => {
    const { canUser } = useTokenProvider()
    const { sdkClient } = useCoreSdkProvider()
    const { t } = useTranslation()

    const { show, ConfirmDialog } = useConfirmDialog()
    const [addressSetForDeletion, setAddressSetForDeletion] =
      useState<CustomerAddress | null>(null)

    const addresses = customer.customer_addresses?.map((customerAddress) =>
      customerAddress?.address != null ? (
        <ListItem key={customerAddress?.address?.id}>
          <ResourceAddress
            address={customerAddress?.address}
            editable={canUser("update", "addresses")}
            // both actions sit in the address's own `…` menu, rather than a
            // trash icon pinned over the corner of the row
            onDelete={
              canUser("destroy", "addresses")
                ? () => {
                    setAddressSetForDeletion(customerAddress)
                    show()
                  }
                : undefined
            }
            showBillingInfo
          />
        </ListItem>
      ) : null,
    )

    if (addresses?.length === 0) return <></>

    return (
      <>
        <Section title={t("resources.addresses.name_other")}>
          {addresses}
        </Section>
        {canUser("destroy", "addresses") && (
          // the dialog reports a failed delete itself, as an error toast
          <ConfirmDialog
            icon="trash"
            title={`Delete address for ${addressSetForDeletion?.address?.full_name}`}
            description="This action cannot be undone."
            confirm={{
              label: "Delete address",
              variant: "danger",
              onClick: async () => {
                await sdkClient.customer_addresses.delete(
                  addressSetForDeletion?.id ?? "",
                )
                onRemovedAddress?.()
              },
            }}
          />
        )}
      </>
    )
  },
)
