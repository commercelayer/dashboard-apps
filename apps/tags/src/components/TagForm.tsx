import {
  Button,
  HookedForm,
  HookedInput,
  HookedValidationApiError,
  Spacer
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { z } from 'zod'

const tagFormSchema = z.object({
  name: z
    .string()
    .refine(
      (value) => /^[a-zA-Z0-9]+(?:(-|_)[a-zA-Z0-9]+)*$/.test(value),
      'Name is invalid'
    )
})

export type TagFormValues = z.infer<typeof tagFormSchema>

interface Props {
  defaultValues: TagFormValues
  isSubmitting: boolean
  onSubmit: (
    formValues: TagFormValues,
    setError: UseFormSetError<TagFormValues>
  ) => void
  apiError?: any
}

export function TagForm({
  defaultValues,
  onSubmit,
  apiError,
  isSubmitting
}: Props): JSX.Element {
  const methods = useForm({
    defaultValues,
    resolver: zodResolver(tagFormSchema)
  })

  return (
    <HookedForm
      {...methods}
      onSubmit={(formValues) => {
        onSubmit(formValues, methods.setError)
      }}
    >
      <Spacer bottom='8'>
        <HookedInput name='name' label='Name' autoComplete='off' />
      </Spacer>

      <Spacer top='14'>
        <Button type='submit' disabled={isSubmitting} className='w-full'>
          {defaultValues.name.length === 0 ? 'Create' : 'Update'}
        </Button>
        <Spacer top='2'>
          <HookedValidationApiError apiError={apiError} />
        </Spacer>
      </Spacer>
    </HookedForm>
  )
}
