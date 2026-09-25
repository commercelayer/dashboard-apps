import {
  Button,
  Icon,
  ListItem,
  ResourceAddress,
  Section,
  useConfirmDialog,
  useCoreSdkProvider,
  useResourceAddressOverlay,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements"
import type { Customer, CustomerAddress } from "@commercelayer/sdk"
import { useState } from "react"

interface Props {
  customer: Customer
  onRemovedAddress?: () => void
  onCreatedAddress?: () => void
}

export const CustomerAddresses = withSkeletonTemplate<Props>(
  ({
    customer,
    onRemovedAddress,
    onCreatedAddress,
  }): React.JSX.Element | null => {
    const { canUser } = useTokenProvider()
    const { sdkClient } = useCoreSdkProvider()
    const { t } = useTranslation()

    const { show, ConfirmDialog } = useConfirmDialog()
    const [addressSetForDeletion, setAddressSetForDeletion] =
      useState<CustomerAddress | null>(null)

    // an address on its own belongs to nobody: creating one here means creating
    // the `customer_address` that ties it to this customer
    const canCreate =
      canUser("create", "addresses") && canUser("create", "customer_addresses")

    const {
      ResourceAddressOverlay: NewAddressOverlay,
      openAddressOverlay: openNewAddressOverlay,
    } = useResourceAddressOverlay({
      address: null,
      showBillingInfo: true,
      onCreate: (address) => {
        void sdkClient.customer_addresses
          .create({
            customer_email: customer.email,
            customer: { type: "customers", id: customer.id },
            address: { type: "addresses", id: address.id },
          })
          .then(() => {
            onCreatedAddress?.()
          })
      },
    })

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

    // with nothing to list and nothing to add the section would be an empty
    // heading, so it stays out of the page entirely
    if (addresses?.length === 0 && !canCreate) return <></>

    return (
      <>
        <Section
          title={t("resources.addresses.name_other")}
          actionButton={
            canCreate && (
              <Button
                alignItems="center"
                variant="secondary"
                size="mini"
                onClick={() => {
                  openNewAddressOverlay()
                }}
              >
                <Icon name="plus" />
                {t("common.new")}
              </Button>
            )
          }
        >
          {addresses}
        </Section>
        {canCreate && <NewAddressOverlay />}
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
