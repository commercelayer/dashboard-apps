import {
  Button,
  HookedForm,
  HookedInputDate,
  HookedInputSelect,
  HookedValidationApiError,
  Spacer,
  Text,
  useTokenProvider
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { z } from 'zod'

const linkFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  clientId: z.string().min(1),
  market: z.string().min(1),
  startsAt: z.date(),
  expiresAt: z.date()
})

export type LinkFormValues = z.infer<typeof linkFormSchema>

interface Props {
  defaultValues?: Partial<LinkFormValues>
  isSubmitting: boolean
  onSubmit: (
    formValues: LinkFormValues,
    setError: UseFormSetError<LinkFormValues>
  ) => void
  apiError?: any
}

export function LinkForm({
  defaultValues,
  onSubmit,
  apiError,
  isSubmitting
}: Props): JSX.Element {
  const linkFormMethods = useForm<LinkFormValues>({
    defaultValues,
    resolver: zodResolver(linkFormSchema)
  })
  const { settings } = useTokenProvider()
  const salesChannels = settings.extras?.salesChannels

  return (
    <>
      <HookedForm
        {...linkFormMethods}
        onSubmit={(formValues) => {
          onSubmit(formValues, linkFormMethods.setError)
        }}
      >
        {salesChannels != null && (
          <Spacer bottom='4'>
            <HookedInputSelect
              name='clientId'
              label='Sales channel *'
              initialValues={
                // eslint-disable-next-line @typescript-eslint/naming-convention
                salesChannels?.map(({ client_id, name }) => ({
                  value: client_id,
                  label: name
                })) ?? undefined
              }
              pathToValue='value'
              hint={{
                text: (
                  <Text variant='info'>
                    The sales channel used to generate the link.
                  </Text>
                )
              }}
            />
          </Spacer>
        )}
        <Spacer top='6' bottom='12'>
          <HookedInputDate
            name='expiresAt'
            label='Expiration date *'
            hint={{
              text: (
                <Text variant='info'>The date the link will stop working.</Text>
              )
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
    </>
  )
}
