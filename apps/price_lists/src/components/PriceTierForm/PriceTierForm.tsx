import { getFrequenciesForSelect } from '#utils/frequencies'
import {
  Button,
  Grid,
  HookedForm,
  HookedInput,
  HookedInputCurrency,
  HookedInputSelect,
  HookedValidationApiError,
  Label,
  Spacer,
  Text,
  type InputCurrencyProps
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { type z } from 'zod'
import { priceTierFormSchema } from './schema'

export type PriceTierFormValues = z.infer<typeof priceTierFormSchema>

interface Props {
  defaultValues?: Partial<PriceTierFormValues>
  isSubmitting: boolean
  onSubmit: (
    formValues: PriceTierFormValues,
    setError: UseFormSetError<PriceTierFormValues>
  ) => void
  apiError?: any
}

export function PriceTierForm({
  defaultValues,
  onSubmit,
  apiError,
  isSubmitting
}: Props): JSX.Element {
  const priceTierFormMethods = useForm<PriceTierFormValues>({
    defaultValues,
    resolver: zodResolver(priceTierFormSchema)
  })

  const watchedUpTo = priceTierFormMethods.watch('up_to')

  return (
    <>
      <HookedForm
        {...priceTierFormMethods}
        onSubmit={(formValues) => {
          onSubmit(formValues, priceTierFormMethods.setError)
        }}
      >
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
          {defaultValues?.type === 'volume' ? (
            <HookedInput
              type='number'
              name='up_to'
              label='Quantity up to'
              hint={{
                text: (
                  <Text variant='info'>
                    Tier upper limit. Leave blank for a limitless beyond tier.
                  </Text>
                )
              }}
            />
          ) : (
            <>
              <Label>Frequency up to</Label>
              <Spacer top='2'>
                <Grid columns='auto' alignItems='start'>
                  <HookedInputSelect
                    name='up_to'
                    initialValues={getFrequenciesForSelect().map(
                      ({ value, label }) => ({
                        value,
                        label
                      })
                    )}
                    pathToValue='value'
                  />
                  {watchedUpTo === 'custom' && (
                    <HookedInput
                      type='number'
                      name='up_to_days'
                      suffix='days'
                    />
                  )}
                </Grid>
              </Spacer>
              <Spacer top='2'>
                <Text variant='info' size='small'>
                  Tier upper limit. Select ‘Unlimited’ for a limitless beyond
                  tier.
                </Text>
              </Spacer>
            </>
          )}
        </Spacer>
        <Spacer top='6' bottom='4'>
          <HookedInputCurrency
            name='price'
            label='Price'
            currencyCode={
              defaultValues?.currency_code as InputCurrencyProps['currencyCode']
            }
          />
        </Spacer>

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
