import { getFrequencyLabelByValue } from '#data/frequencies'
import { useSubscriptionModelsFrequencies } from '#hooks/useSubscriptionModelsFrequencies'
import {
  Button,
  HookedForm,
  HookedInputDate,
  HookedInputSelect,
  HookedValidationApiError,
  Spacer
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { z } from 'zod'

const subscriptionFormSchema = z.object({
  id: z.string(),
  frequency: z.string().nullable(),
  nextRunAt: z.date()
})

export type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>

interface Props {
  defaultValues: SubscriptionFormValues
  isSubmitting: boolean
  onSubmit: (
    formValues: SubscriptionFormValues,
    setError: UseFormSetError<SubscriptionFormValues>
  ) => void
  apiError?: any
}

export function SubscriptionForm({
  defaultValues,
  onSubmit,
  apiError,
  isSubmitting
}: Props): JSX.Element {
  const methods = useForm({
    defaultValues,
    resolver: zodResolver(subscriptionFormSchema)
  })

  const frequencies = useSubscriptionModelsFrequencies()

  return (
    <HookedForm
      {...methods}
      onSubmit={(formValues) => {
        onSubmit(formValues, methods.setError)
      }}
    >
      <Spacer bottom='8'>
        <HookedInputSelect
          name='frequency'
          label='Frequency'
          initialValues={frequencies.map((f) => {
            return {
              label: getFrequencyLabelByValue(f),
              value: f
            }
          })}
          hint={{
            text: `The frequency at which the subscription should run.`
          }}
        />
      </Spacer>
      <Spacer bottom='8'>
        <HookedInputDate
          name='nextRunAt'
          label='Next run'
          showTimeSelect
          isClearable
          hint={{
            text: `The date and time of the subscription's next run.`
          }}
        />
      </Spacer>
      <Spacer top='14'>
        <Button type='submit' disabled={isSubmitting} className='w-full'>
          Update
        </Button>
        <Spacer top='2'>
          <HookedValidationApiError apiError={apiError} />
        </Spacer>
      </Spacer>
    </HookedForm>
  )
}
