import {
  Button,
  HookedCodeEditor,
  HookedForm,
  HookedInput,
  HookedInputRadioGroup,
  HookedInputSelect,
  HookedValidationApiError,
  Section,
  Spacer,
  Text,
  currencies,
  useTokenProvider
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { z } from 'zod'

const priceListFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  currency_code: z.string().min(1),
  tax_included: z.string().min(1),
  rules: z.any().refine((value) => {
    if (value == null || (typeof value === 'string' && value.trim() === '')) {
      return true
    }

    try {
      if (typeof value === 'string') {
        JSON.parse(value)
      }
      return true
    } catch (error) {
      return false
    }
  }, 'JSON is not valid')
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
  const { organization } = useTokenProvider()

  const priceListFormMethods = useForm<PriceListFormValues>({
    defaultValues,
    resolver: zodResolver(priceListFormSchema)
  })

  const hasRuleEngine = organization?.api_rules_engine === true

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
          {hasRuleEngine && (
            <Spacer top='6' bottom='4'>
              <HookedCodeEditor
                name='rules'
                label='Rules'
                language='json'
                jsonSchema='price-rules'
                height='600px'
              />
            </Spacer>
          )}
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
