import { hasPaymentMethod } from '#utils/order'
import {
  Button,
  ListDetails,
  ListDetailsItem,
  PageHeading,
  ResourcePaymentMethod,
  Spacer,
  useOverlay
} from '@commercelayer/app-elements'
import { type Order } from '@commercelayer/sdk'

interface OverlayHook {
  show: () => void
  Overlay: React.FC<{ order: Order; onConfirm: () => void }>
}

export function useCaptureOverlay(): OverlayHook {
  const { Overlay, open, close } = useOverlay()

  return {
    show: open,
    Overlay: ({ order, onConfirm }) => (
      <Overlay backgroundColor='light'>
        <PageHeading
          title='Confirm capture'
          navigationButton={{
            onClick: () => {
              close()
            },
            label: 'Cancel',
            icon: 'x'
          }}
          description='This action cannot be undone, proceed with caution.'
        />

        <Spacer bottom='14'>
          <ListDetails>
            <ListDetailsItem label='Order'>#{order.number}</ListDetailsItem>
            <ListDetailsItem label='Customer'>
              {order.customer_email}
            </ListDetailsItem>
            <ListDetailsItem label='Payment method'>
              {hasPaymentMethod(order) ? (
                <ResourcePaymentMethod
                  resource={order}
                  variant='plain'
                  showPaymentResponse
                />
              ) : (
                '-'
              )}
            </ListDetailsItem>
            <ListDetailsItem label='Amount'>
              {order.formatted_total_amount}
            </ListDetailsItem>
          </ListDetails>
        </Spacer>
        <Button
          fullWidth
          onClick={() => {
            onConfirm()
            close()
          }}
        >
          Capture {order.formatted_total_amount}
        </Button>
      </Overlay>
    )
  }
}
