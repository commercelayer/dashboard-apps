import {
  Button,
  HookedForm,
  HookedInputSelect,
  HookedValidationApiError,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useOverlay,
  useTranslation
} from '@commercelayer/app-elements'
import type { Order } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { SelectCustomerComponent } from '../SelectCustomerComponent'
import { groupedLanguageList, languageList } from '../languages'

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
      (value) => languageList.map((l) => l.value as string).includes(value),
      'Invalid language'
    )
})

const Form: React.FC<Props> = ({ order, onChange, close }) => {
  const { sdkClient } = useCoreSdkProvider()
  const [apiError, setApiError] = useState<string>()
  const { t } = useTranslation()

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
        title={t('common.edit_resource', {
          resource: t('resources.customers.name').toLowerCase()
        })}
        navigationButton={{
          onClick: () => {
            close()
          },
          label: t('common.cancel'),
          icon: 'x'
        }}
      >
        <SelectCustomerComponent />

        <Spacer top='6'>
          <HookedInputSelect
            name='language_code'
            label={`${t('apps.orders.form.language')} *`}
            initialValues={groupedLanguageList}
            hint={{ text: t('apps.orders.form.language_hint') }}
          />
        </Spacer>

        <Spacer top='14'>
          <Spacer top='8'>
            <Button type='submit' fullWidth disabled={isSubmitting}>
              {t('common.apply')}
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
