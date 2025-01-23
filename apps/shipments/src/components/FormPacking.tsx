import type {
  PackingFormDefaultValues,
  PackingFormValues
} from '#data/packingFormSchema'
import { packingFormSchema } from '#data/packingFormSchema'
import {
  Button,
  HookedForm,
  HookedValidationApiError,
  Spacer,
  useIsChanged,
  useTranslation
} from '@commercelayer/app-elements'
import { type Shipment, type StockLineItem } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, type UseFormSetError } from 'react-hook-form'
import { FormPackingFieldItems } from './FormPackingFieldItems'
import { FormPackingFieldPackages } from './FormPackingFieldPackages'
import { FormPackingFieldWeight } from './FormPackingFieldWeight'
import { FormPackingMoreOptions } from './FormPackingMoreOptions'

interface Props {
  defaultValues: PackingFormDefaultValues
  isSubmitting?: boolean
  onSubmit: (
    formValues: PackingFormValues,
    setError: UseFormSetError<PackingFormValues>
  ) => void
  apiError?: any
  stockLineItems: StockLineItem[]
  stockLocationId: string
  shipment: Shipment
}

export function FormPacking({
  onSubmit,
  shipment,
  defaultValues,
  apiError,
  isSubmitting,
  stockLocationId,
  stockLineItems
}: Props): JSX.Element {
  const methods = useForm({
    defaultValues,
    resolver: zodResolver(packingFormSchema)
  })
  const { t } = useTranslation()

  // when stockLineItems changes, we need to re-render the form
  // to update defaults values for FormPackingFieldItems and FormPackingFieldPackages
  const [renderKey, setRenderKey] = useState(0)
  useIsChanged({
    value: stockLineItems,
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

  return (
    <HookedForm
      {...methods}
      onSubmit={(values) => {
        // `zodResolver` does not recognize the z.output but is wrongly inferring types from `defaultValues`
        onSubmit(values as PackingFormValues, methods.setError)
      }}
      key={renderKey}
    >
      <Spacer bottom='8'>
        <FormPackingFieldPackages stockLocationId={stockLocationId} />
      </Spacer>
      <Spacer bottom='8'>
        <FormPackingFieldItems stockLineItems={stockLineItems} />
      </Spacer>
      <Spacer bottom='8'>
        <FormPackingFieldWeight shipment={shipment} />
      </Spacer>
      <Spacer bottom='8'>
        <FormPackingMoreOptions shipment={shipment} />
      </Spacer>
      <Button type='submit' fullWidth disabled={isSubmitting}>
        {isSubmitting === true
          ? t('common.saving')
          : t('apps.shipments.form.pack_items', {
              items:
                methods
                  .watch('items')
                  .reduce((acc, i) => acc + i.quantity, 0) ?? 0
            })}
      </Button>
      <Spacer top='2'>
        <HookedValidationApiError
          apiError={apiError}
          fieldMap={{
            package: 'packageId',
            stock_line_item: 'items',
            unit_of_weight: 'unitOfWeight'
          }}
        />
      </Spacer>
    </HookedForm>
  )
}
