import { useAddItemOverlay } from '#hooks/useAddItemOverlay'
import {
  Button,
  HookedForm,
  HookedInputCurrency,
  HookedValidationApiError,
  HookedValidationError,
  Section,
  Spacer,
  Text,
  type InputCurrencyProps
} from '@commercelayer/app-elements'
import type { Price, Sku } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { z } from 'zod'
import { ListItemSku } from './ListItemSku'

const priceFormSchema = z.object({
  id: z.string().optional(),
  item: z.string().min(1),
  currency_code: z.string().min(1),
  price: z.number(),
  original_price: z.number()
})

export type PriceFormValues = z.infer<typeof priceFormSchema>

interface Props {
  resource?: Price
  defaultValues?: Partial<PriceFormValues>
  isSubmitting: boolean
  onSubmit: (
    formValues: PriceFormValues,
    setError: UseFormSetError<PriceFormValues>
  ) => void
  apiError?: any
}

export function PriceForm({
  resource,
  defaultValues,
  onSubmit,
  apiError,
  isSubmitting
}: Props): JSX.Element {
  const priceFormMethods = useForm<PriceFormValues>({
    defaultValues,
    resolver: zodResolver(priceFormSchema)
  })

  const { show: showAddItemOverlay, Overlay: AddItemOverlay } =
    useAddItemOverlay()

  const [selectedItemResource, setSelectedItemResource] = useState<Sku>()
  const sku = resource?.sku != null ? resource?.sku : selectedItemResource
  const priceFormWatchedItem = priceFormMethods.watch('item')

  return (
    <>
      <HookedForm
        {...priceFormMethods}
        onSubmit={(formValues) => {
          onSubmit(formValues, priceFormMethods.setError)
        }}
      >
        <Section>
          <Spacer top='12' bottom='4'>
            <Text weight='semibold'>SKU</Text>
            <Spacer top='2'>
              {priceFormWatchedItem == null ? (
                <Button
                  type='button'
                  variant='relationship'
                  fullWidth
                  onClick={() => {
                    showAddItemOverlay({ type: 'skus' })
                  }}
                >
                  Add item
                </Button>
              ) : (
                <ListItemSku
                  resource={sku}
                  disabled={defaultValues?.id != null}
                  variant='boxed'
                  onSelect={() => {
                    if (defaultValues?.id == null) {
                      showAddItemOverlay({ type: 'skus', excludedId: sku?.id })
                    }
                  }}
                />
              )}
              <Spacer top='2'>
                <HookedValidationError name='item' />
              </Spacer>
              <AddItemOverlay
                onConfirm={(resource) => {
                  setSelectedItemResource(resource)
                  priceFormMethods.setValue('item', resource.id)
                }}
              />
            </Spacer>
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
          <Spacer top='6' bottom='4'>
            <HookedInputCurrency
              name='original_price'
              label='Original price'
              currencyCode={
                defaultValues?.currency_code as InputCurrencyProps['currencyCode']
              }
            />
          </Spacer>
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
