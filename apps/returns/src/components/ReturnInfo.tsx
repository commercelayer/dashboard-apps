import {
  Button,
  ListDetailsItem,
  Section,
  Text,
  navigateTo,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Return } from '@commercelayer/sdk'

interface Props {
  returnObj: Return
}

export const ReturnInfo = withSkeletonTemplate<Props>(
  ({ returnObj }): JSX.Element => {
    const {
      canAccess,
      settings: { mode }
    } = useTokenProvider()

    const returnOrderMarket = returnObj.order?.market?.name
    const returnOrderNumber = `#${returnObj.order?.number}`
    const navigateToOrder = canAccess('orders')
      ? navigateTo({
          destination: {
            app: 'orders',
            resourceId: returnObj?.order?.id,
            mode
          }
        })
      : {}

    const returnCustomerEmail = returnObj?.customer?.email
    const navigateToCustomer = canAccess('customers')
      ? navigateTo({
          destination: {
            app: 'customers',
            resourceId: returnObj?.customer?.id,
            mode
          }
        })
      : {}

    return (
      <Section title='Info'>
        <ListDetailsItem label='Order' gutter='none'>
          <Text tag='div' weight='semibold'>
            {canAccess('orders') ? (
              <Button variant='link' {...navigateToOrder}>
                {`${returnOrderMarket} ${returnOrderNumber}`}
              </Button>
            ) : (
              `${returnOrderMarket} ${returnOrderNumber}`
            )}
          </Text>
        </ListDetailsItem>
        <ListDetailsItem label='Customer' gutter='none'>
          <Text tag='div' weight='semibold'>
            {canAccess('customers') ? (
              <Button variant='link' {...navigateToCustomer}>
                {returnCustomerEmail}
              </Button>
            ) : (
              returnCustomerEmail
            )}
          </Text>
        </ListDetailsItem>
      </Section>
    )
  }
)
