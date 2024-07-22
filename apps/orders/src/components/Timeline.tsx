import { useOrderDetails } from '#hooks/useOrderDetails'
import {
  ResourceOrderTimeline,
  Section,
  Spacer,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'

interface Props {
  order: Order
}

export const Timeline = withSkeletonTemplate<Props>(({ order }) => {
  const { isValidating } = useOrderDetails(order.id)

  return (
    <Section title='Timeline'>
      <Spacer top='8'>
        <ResourceOrderTimeline
          orderId={order.id}
          refresh={isValidating}
          attachmentOption={{
            referenceOrigin: 'app-orders--note'
          }}
        />
      </Spacer>
    </Section>
  )
})
