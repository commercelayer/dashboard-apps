import { useCustomerOrdersList } from '#hooks/useCustomerOrdersList'
import { getCustomerStatus } from '#utils/getCustomerStatus'
import {
  SkeletonTemplate,
  Spacer,
  Stack,
  Text,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Customer } from '@commercelayer/sdk'

interface Props {
  customer: Customer
}

export const CustomerStatus = withSkeletonTemplate<Props>(
  ({ customer }): JSX.Element => {
    const customerStatus = getCustomerStatus(customer)
    const { orders, isLoading } = useCustomerOrdersList({
      id: customer.id,
      settings: { pageSize: 5 }
    })

    return (
      <SkeletonTemplate isLoading={isLoading}>
        <Stack>
          <div>
            <Spacer bottom='2'>
              <Text size='regular' tag='div' variant='info'>
                Orders
              </Text>
            </Spacer>
            <Text weight='semibold' className='text-lg'>
              {orders?.meta.recordCount}
            </Text>
          </div>
          <div>
            <Spacer bottom='2'>
              <Text size='regular' tag='div' variant='info'>
                Type
              </Text>
            </Spacer>
            <Text weight='semibold' className='text-lg capitalize'>
              {customerStatus}
            </Text>
          </div>
        </Stack>
      </SkeletonTemplate>
    )
  }
)
