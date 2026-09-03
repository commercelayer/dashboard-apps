import {
  HookedValidationApiError,
  Spacer,
  t,
  useIsChanged,
} from "@commercelayer/app-elements"
import type { ReturnLineItem } from "@commercelayer/sdk"
import { zodResolver } from "@hookform/resolvers/zod"
import { forwardRef, useState } from "react"
import {
  FormProvider,
  type UseFormReturn,
  type UseFormSetError,
  useForm,
} from "react-hook-form"
import { z } from "zod"
import { FormFieldItems } from "./FormFieldItems"

const restockFormSchema = z.object({
  items: z
    .array(
      z.object({
        value: z.string().nonempty(),
        quantity: z.number(),
      }),
    )
    .superRefine((val, ctx) => {
      if (val.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 1,
          type: "array",
          inclusive: true,
          message: t("validation.select_one_item"),
        })
      }
    }),
})

export type RestockFormValues = z.infer<typeof restockFormSchema>
export type RestockFormDefaultValues = z.input<typeof restockFormSchema>

export function useRestockFormMethods(
  defaultValues: RestockFormDefaultValues,
): UseFormReturn<RestockFormValues> {
  return useForm({
    defaultValues,
    resolver: zodResolver(restockFormSchema),
  })
}

interface Props {
  methods: UseFormReturn<RestockFormValues>
  defaultValues: RestockFormDefaultValues
  onSubmit: (
    formValues: RestockFormValues,
    setError: UseFormSetError<RestockFormValues>,
  ) => void
  apiError?: any
  returnLineItems: ReturnLineItem[]
}

export const FormRestock = forwardRef<HTMLFormElement, Props>(
  ({ methods, onSubmit, defaultValues, apiError, returnLineItems }, ref) => {
    // when returnLineItems changes, we need to re-render the form
    // to update defaults values for FormFieldItems
    const [renderKey, setRenderKey] = useState(0)
    useIsChanged({
      value: returnLineItems,
      onChange: () => {
        setRenderKey(Date.now())
      },
    })

    useIsChanged({
      value: defaultValues,
      onChange: () => {
        if (apiError == null) {
          methods.reset(defaultValues)
        }
      },
    })

    const doSubmit = methods.handleSubmit((data) => {
      void onSubmit(data, methods.setError)
    })

    return (
      <FormProvider {...methods} key={renderKey}>
        <form
          onSubmit={(e) => {
            void doSubmit(e)
          }}
          ref={ref}
          id="return-restock-form"
        >
          <Spacer bottom="12">
            <FormFieldItems returnLineItems={returnLineItems} />
            <Spacer top="2">
              <HookedValidationApiError
                apiError={apiError}
                fieldMap={{
                  return_line_item: "items",
                }}
              />
            </Spacer>
          </Spacer>
        </form>
      </FormProvider>
    )
  },
)
