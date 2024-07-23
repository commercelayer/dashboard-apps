import {
  HookedValidationApiError,
  Spacer,
  useIsChanged
} from '@commercelayer/app-elements'
import { type LineItem } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { forwardRef, useState } from 'react'
import { FormProvider, useForm, type UseFormSetError } from 'react-hook-form'
import { z } from 'zod'
import { FormFieldItems } from './FormFieldItems'

const returnFormSchema = z.object({
  items: z
    .array(
      z.object({
        value: z.string().nonempty(),
        quantity: z.number()
      })
    )
    .superRefine((val, ctx) => {
      if (val.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 1,
          type: 'array',
          inclusive: true,
          message: 'Please select at least one item'
        })
      }
    })
})

export type ReturnFormValues = z.infer<typeof returnFormSchema>
export type ReturnFormDefaultValues = z.input<typeof returnFormSchema>

interface Props {
  defaultValues: ReturnFormDefaultValues
  onSubmit: (
    formValues: ReturnFormValues,
    setError: UseFormSetError<ReturnFormValues>
  ) => void
  apiError?: any
  lineItems: LineItem[]
}

export const FormReturn = forwardRef<HTMLFormElement, Props>(
  ({ onSubmit, defaultValues, apiError, lineItems }, ref) => {
    const methods = useForm({
      defaultValues,
      resolver: zodResolver(returnFormSchema)
    })

    // when lineItems changes, we need to re-render the form
    // to update defaults values for FormFieldItems
    const [renderKey, setRenderKey] = useState(0)
    useIsChanged({
      value: lineItems,
      onChange: () => {
        setRenderKey(new Date().getTime())
      }
    })

    useIsChanged({
      value: defaultValues,
      onChange: () => {
        if (apiError == null) {
          methods.reset(defaultValues)
        }
      }
    })

    const doSubmit = methods.handleSubmit(async (data) => {
      onSubmit(data, methods.setError)
    })

    return (
      <FormProvider {...methods} key={renderKey}>
        <form
          onSubmit={(e) => {
            void doSubmit(e)
          }}
          ref={ref}
          id='return-creation-form'
        >
          <Spacer bottom='12'>
            <FormFieldItems lineItems={lineItems} />
          </Spacer>
          <HookedValidationApiError
            apiError={apiError}
            fieldMap={{
              return_line_item: 'items'
            }}
          />
        </form>
      </FormProvider>
    )
  }
)
