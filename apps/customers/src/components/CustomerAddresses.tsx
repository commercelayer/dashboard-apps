import { useCustomerDetails } from '#hooks/useCustomerDetails'
import {
  Button,
  Icon,
  ListItem,
  ResourceAddress,
  Section,
  useCoreSdkProvider,
  useResourceAddressOverlay,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Customer } from '@commercelayer/sdk'

interface Props {
  customer: Customer
}

export const CustomerAddresses = withSkeletonTemplate<Props>(
  ({ customer }): JSX.Element | null => {
    const { sdkClient } = useCoreSdkProvider()
    const { canUser } = useTokenProvider()
    const { mutateCustomer } = useCustomerDetails(customer.id)

    async function handleOnCreateAsync(formValues: any): Promise<void> {
      try {
        // Create new address
        await sdkClient.customer_addresses.create({
          customer_email: customer.email,
          customer,
          address: formValues
        })
        void mutateCustomer()
      } catch (error) {
        console.error('Error creating or updating address:', error)
      }
    }

    function handleOnCreate(formValues: any): void {
      handleOnCreateAsync(formValues).catch((error) => {
        console.error('Error in handleOnCreate:', error)
      })
    }

    const { ResourceAddressOverlay, openAddressOverlay } =
      useResourceAddressOverlay({ onCreate: handleOnCreate, showNotes: true })

    const addresses = customer.customer_addresses?.map(
      (customerAddress, idx) =>
        customerAddress?.address != null ? (
          <ListItem key={idx}>
            <ResourceAddress
              address={customerAddress?.address}
              editable={canUser('create', 'addresses')}
              showBillingInfo
              showNotes
            />
          </ListItem>
        ) : null
    )

    return (
      <>
        <ResourceAddressOverlay />

        <Section
          title='Addresses'
          actionButton={
            <Button
              alignItems='center'
              variant='secondary'
              size='mini'
              onClick={() => {
                openAddressOverlay()
              }}
            >
              <Icon name='plus' />
              Add New Address
            </Button>
          }
        >
          {addresses?.length === 0 ? 'No Address Yet' : addresses}
        </Section>
      </>
    )
  }
)
