import {
  Button,
  HookedForm,
  HookedInput,
  HookedInputRadioGroup,
  HookedInputTextArea,
  HookedValidationApiError,
  Section,
  Spacer,
  Text
} from '@commercelayer/app-elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { type z } from 'zod'
import { skuListFormSchema } from './schema'

export type SkuListFormValues = z.infer<typeof skuListFormSchema>

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
}: Props): React.JSX.Element {
  const skuListFormMethods = useForm<SkuListFormValues>({
    defaultValues,
    resolver: zodResolver(skuListFormSchema)
  })

  const watchedFormManual = skuListFormMethods.watch('manualString')
  useEffect(() => {
    if (watchedFormManual === 'manual') {
      skuListFormMethods.setValue('manual', true)
    } else {
      skuListFormMethods.setValue('manual', false)
    }
  }, [watchedFormManual])

  return (
    <>
      <HookedForm
        {...skuListFormMethods}
        onSubmit={(formValues) => {
          onSubmit(formValues, skuListFormMethods.setError)
        }}
      >
        <Section>
          {defaultValues?.id == null && (
            <Spacer top='12' bottom='4'>
              <HookedInputRadioGroup
                name='manualString'
                viewMode='grid'
                showInput={false}
                options={[
                  {
                    value: 'manual',
                    content: (
                      <>
                        <Spacer bottom='2'>
                          <Text weight='bold' tag='div'>
                            Manual
                          </Text>
                        </Spacer>
                        <Text variant='info'>Add items after creation.</Text>
                      </>
                    )
                  },
                  {
                    value: 'auto',
                    content: (
                      <>
                        <Spacer bottom='2'>
                          <Text weight='bold' tag='div'>
                            Automatic
                          </Text>
                        </Spacer>
                        <Text variant='info'>Select items using regex.</Text>
                      </>
                    )
                  }
                ]}
              />
            </Spacer>
          )}
          <Spacer top='12' bottom='4'>
            <HookedInput
              name='name'
              label='Name'
              type='text'
              hint={{ text: 'Pick a name that helps you identify it.' }}
            />
          </Spacer>
          {watchedFormManual === 'auto' && (
            <Spacer top='12' bottom='4'>
              <HookedInputTextArea
                name='sku_code_regex'
                label='Items'
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
