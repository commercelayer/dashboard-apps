import {
  Button,
  HookedForm,
  HookedInput,
  HookedInputRadioGroup,
  HookedInputSelect,
  HookedValidationApiError,
  Section,
  Spacer,
  Text,
  currencies
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { z } from 'zod'

const priceListFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  currency_code: z.string().min(1),
  tax_included: z.string().min(1)
})

export type PriceListFormValues = z.infer<typeof priceListFormSchema>

interface Props {
  defaultValues?: Partial<PriceListFormValues>
  isSubmitting: boolean
  onSubmit: (
    formValues: PriceListFormValues,
    setError: UseFormSetError<PriceListFormValues>
  ) => void
  apiError?: any
}

export function PriceListForm({
  defaultValues,
  onSubmit,
  apiError,
  isSubmitting
}: Props): JSX.Element {
  const priceListFormMethods = useForm<PriceListFormValues>({
    defaultValues,
    resolver: zodResolver(priceListFormSchema)
  })

  return (
    <>
      <HookedForm
        {...priceListFormMethods}
        onSubmit={(formValues) => {
          onSubmit(formValues, priceListFormMethods.setError)
        }}
      >
        <Section title='Basic info'>
          <Spacer top='6' bottom='4'>
            <HookedInput
              name='name'
              label='Name'
              hint={{
                text: (
                  <Text variant='info'>
                    Pick a name that helps you identify it.
                  </Text>
                )
              }}
            />
          </Spacer>
          <Spacer top='6' bottom='4'>
            <HookedInputSelect
              name='currency_code'
              label='Currency'
              placeholder=''
              initialValues={Object.entries(currencies).map(([code]) => ({
                label: code.toUpperCase(),
                value: code.toUpperCase()
              }))}
            />
          </Spacer>
        </Section>

        <Section title='Taxes'>
          <Spacer top='6' bottom='12'>
            <HookedInputRadioGroup
              name='tax_included'
              viewMode='simple'
              options={[
                {
                  content: (
                    <div className='flex items-center gap-1'>
                      <Text weight='bold'>Prices include taxes</Text>
                      <Text variant='info'>(e.g. B2C VAT)</Text>
                    </div>
                  ),
                  value: 'true'
                },
                {
                  content: (
                    <div className='flex items-center gap-1'>
                      <Text weight='bold'>Prices do not include taxes</Text>
                      <Text variant='info'>(e.g. B2B VAT, sales taxes)</Text>
                    </div>
                  ),
                  value: 'false'
                }
              ]}
            />
          </Spacer>
        </Section>

        <Spacer top='14'>
          <Button type='submit' disabled={isSubmitting} className='w-full'>
            {defaultValues?.name == null ? 'Create' : 'Update'}
          </Button>
          <Spacer top='2'>
            <HookedValidationApiError apiError={apiError} />
          </Spacer>
        </Spacer>
      </HookedForm>
    </>
  )
}
