import {
  Button,
  HookedForm,
  HookedInput,
  HookedInputTextArea,
  HookedValidationApiError,
  Section,
  Spacer
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { type z } from 'zod'
import { skuListFormSchema } from './schema'

export type SkuListFormValues = z.infer<typeof skuListFormSchema>

export interface FormSkuListItem {
  id: string
  sku_code: string
  quantity: number
  position: number
  sku: { id: string; code: string; name: string; image_url?: string }
}

interface Props {
  defaultValues?: Partial<SkuListFormValues>
  isSubmitting: boolean
  onSubmit: (
    formValues: SkuListFormValues,
    setError: UseFormSetError<SkuListFormValues>
  ) => void
  apiError?: any
}

export function SkuListForm({
  defaultValues,
  onSubmit,
  apiError,
  isSubmitting
}: Props): JSX.Element {
  const skuListFormMethods = useForm<SkuListFormValues>({
    defaultValues,
    resolver: zodResolver(skuListFormSchema)
  })

  const watchedFormManual = skuListFormMethods.watch('manual')

  return (
    <>
      <HookedForm
        {...skuListFormMethods}
        onSubmit={(formValues) => {
          onSubmit(formValues, skuListFormMethods.setError)
        }}
      >
        <Section>
          <Spacer top='12' bottom='4'>
            <HookedInput
              name='name'
              label='Name'
              type='text'
              hint={{ text: 'Pick a name that helps you identify it.' }}
            />
          </Spacer>
          {!watchedFormManual && (
            <Spacer top='12' bottom='4'>
              <HookedInputTextArea
                name='sku_code_regex'
                hint={{
                  text: (
                    <span>
                      Use{' '}
                      <a
                        href='https://regex101.com/'
                        target='_blank'
                        rel='noreferrer'
                      >
                        regular expressions
                      </a>{' '}
                      for matching SKU codes, such as "AT | BE".
                    </span>
                  )
                }}
              />
            </Spacer>
          )}
        </Section>
        <Spacer top='14'>
          <Button type='submit' disabled={isSubmitting} fullWidth>
            {defaultValues?.id == null ? 'Create' : 'Update'}
          </Button>
          <Spacer top='2'>
            <HookedValidationApiError apiError={apiError} />
          </Spacer>
        </Spacer>
      </HookedForm>
    </>
  )
}
