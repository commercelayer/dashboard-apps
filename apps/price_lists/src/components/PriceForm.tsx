import { useAddItemOverlay } from '#hooks/useAddItemOverlay'
import { usePriceListDetails } from '#hooks/usePriceListDetails'
import {
  Button,
  HookedForm,
  HookedInputCurrency,
  HookedInputSelect,
  HookedValidationApiError,
  Section,
  Spacer,
  Text,
  type InputCurrencyProps
} from '@commercelayer/app-elements'
import type { Price, Sku } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { z } from 'zod'
import { ListItemSku } from './ListItemSku'
import { PriceListSelector } from './PriceListSelector'

const priceFormSchema = z.object({
  id: z.string().optional(),
  item: z.string().min(1),
  price_list: z.string().min(1),
  currency_code: z.string().min(1),
  price: z.number({
    required_error: 'Required',
    invalid_type_error: 'Expected number'
  }),
  original_price: z.number({
    required_error: 'Required',
    invalid_type_error: 'Expected number'
  })
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
}: Props): React.JSX.Element {
  const priceFormMethods = useForm<PriceFormValues>({
    defaultValues,
    resolver: zodResolver(priceFormSchema)
  })

  const { show: showAddItemOverlay, Overlay: AddItemOverlay } =
    useAddItemOverlay()

  const [selectedItemResource, setSelectedItemResource] = useState<Sku>()
  const sku = resource?.sku != null ? resource?.sku : selectedItemResource
  const priceFormWatchedItem = priceFormMethods.watch('item')

  const priceFormWatchedPriceList = priceFormMethods.watch('price_list')
  const { priceList } = usePriceListDetails(priceFormWatchedPriceList ?? '')
  useEffect(() => {
    if (priceList != null) {
      priceFormMethods.setValue('currency_code', priceList.currency_code)
    }
  }, [priceList])

  return (
    <>
      <HookedForm
        {...priceFormMethods}
        onSubmit={(formValues) => {
          onSubmit(formValues, priceFormMethods.setError)
        }}
      >
        <Section>
          {defaultValues?.price_list == null && (
            <Spacer top='12' bottom='4'>
              <PriceListSelector />
            </Spacer>
          )}
          <Spacer
            top={defaultValues?.price_list != null ? '12' : '6'}
            bottom='4'
          >
            <Text weight='semibold'>SKU</Text>
            <Spacer top='2'>
              {priceFormWatchedItem == null ? (
                <div
                  onClick={() => {
                    showAddItemOverlay({ type: 'skus' })
                  }}
                >
                  <HookedInputSelect
                    name='item'
                    initialValues={[]}
                    placeholder='Select an SKU'
                    onSelect={() => {}}
                  />
                </div>
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
              <AddItemOverlay
                onConfirm={(resource) => {
                  setSelectedItemResource(resource)
                  priceFormMethods.setValue('item', resource.id)
                }}
              />
            </Spacer>
          </Spacer>
          {priceList != null && (
            <>
              <Spacer top='6' bottom='4'>
                <HookedInputCurrency
                  name='price'
                  label='Price'
                  currencyCode={
                    (priceList?.currency_code ??
                      'USD') as InputCurrencyProps['currencyCode']
                  }
                />
              </Spacer>
              <Spacer top='6' bottom='4'>
                <HookedInputCurrency
                  name='original_price'
                  label='Original price'
                  currencyCode={
                    (priceList?.currency_code ??
                      'USD') as InputCurrencyProps['currencyCode']
                  }
                />
              </Spacer>
            </>
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
