import {
  Button,
  HookedForm,
  HookedInputSelect,
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
import { availableLanguages } from '../availableLanguages'

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
  customer_email: z.string().email(),
  language_code: z
    .string()
    .refine(
      (value) => availableLanguages.map((l) => l.value).includes(value),
      'Invalid language'
    )
})

const Form: React.FC<Props> = ({ order, onChange, close }) => {
  const { sdkClient } = useCoreSdkProvider()
  const [apiError, setApiError] = useState<string>()

  const formMethods = useForm({
    defaultValues: {
      customer_email: order.customer_email,
      language_code: order.language_code
    },
    resolver: zodResolver(validationSchema)
  })

  const {
    formState: { isSubmitting }
  } = formMethods

  return (
    <HookedForm
      {...formMethods}
      onSubmit={async (formValues) => {
        await sdkClient.orders
          .update({
            id: order.id,
            customer_email: formValues.customer_email,
            language_code: formValues.language_code
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
        <SelectCustomerComponent />

        <Spacer top='6'>
          <HookedInputSelect
            name='language_code'
            label='Language *'
            initialValues={availableLanguages}
            hint={{ text: 'The language used for checkout.' }}
          />
        </Spacer>

        <Spacer top='14'>
          <Spacer top='8'>
            <Button type='submit' fullWidth disabled={isSubmitting}>
              Apply
            </Button>
            <Spacer top='2'>
              <HookedValidationApiError apiError={apiError} />
            </Spacer>
          </Spacer>
        </Spacer>
      </PageLayout>
    </HookedForm>
  )
}
