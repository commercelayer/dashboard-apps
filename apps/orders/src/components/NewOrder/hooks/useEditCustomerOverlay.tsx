import {
  Button,
  HookedForm,
  HookedValidationApiError,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useOverlay
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { SelectCustomerComponent } from '../SelectCustomerComponent'

interface Props {
  order: Order
  onChange?: () => void
  close: () => void
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useEditCustomerOverlay(
  order: Props['order'],
  onChange?: Props['onChange']
) {
  const { Overlay, open, close } = useOverlay()

  return {
    close,
    open,
    Overlay: () => (
      <Overlay>
        <Form order={order} onChange={onChange} close={close} />
      </Overlay>
    )
  }
}

const validationSchema = z.object({
  customer_email: z.string().email()
})

const Form: React.FC<Props> = ({ order, onChange, close }) => {
  const { sdkClient } = useCoreSdkProvider()
  const [apiError, setApiError] = useState<string>()

  const formMethods = useForm({
    defaultValues: {
      customer_email: order.customer_email
    },
    resolver: zodResolver(validationSchema)
  })

  const {
    formState: { isSubmitting }
  } = formMethods

  return (
    <HookedForm
      {...formMethods}
      onSubmit={async (values) => {
        await sdkClient.orders
          .update({
            id: order.id,
            customer_email: values.customer_email
          })
          .then(() => {
            onChange?.()
            formMethods.reset()
            close()
          })
          .catch((error) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            setApiError(error)
          })
      }}
    >
      <PageLayout
        title='Edit customer'
        navigationButton={{
          onClick: () => {
            close()
          },
          label: 'Cancel',
          icon: 'x'
        }}
      >
        <Spacer bottom='8'>
          <SelectCustomerComponent />
        </Spacer>
        <Button type='submit' fullWidth disabled={isSubmitting}>
          Apply
        </Button>

        <Spacer top='4'>
          <HookedValidationApiError apiError={apiError} />
        </Spacer>
      </PageLayout>
    </HookedForm>
  )
}
