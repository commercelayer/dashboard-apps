import {
  Button,
  HookedForm,
  HookedInputCurrency,
  HookedInputSelect,
  PageLayout,
  Spacer,
  Text,
  useCoreSdkProvider,
  useOverlay,
  type CurrencyCode
} from '@commercelayer/app-elements'
import type { CommerceLayerClient, Order } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { getManualAdjustment, manualAdjustmentReferenceOrigin } from '../utils'

interface Props {
  order: Order
  onChange?: () => void
  close: () => void
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAdjustTotalOverlay(
  order: Props['order'],
  onChange?: Props['onChange']
) {
  const { Overlay, open, close } = useOverlay()

  return {
    close,
    open,
    Overlay: () => (
      <Overlay>
        <Form order={order} onChange={onChange} close={close} />
      </Overlay>
    )
  }
}

const Form: React.FC<Props> = ({ order, onChange, close }) => {
  const currencyCode = order.currency_code as Uppercase<CurrencyCode>
  const manualAdjustment = getManualAdjustment(order)
  const { sdkClient } = useCoreSdkProvider()

  const validationSchema = useMemo(
    () =>
      z.object({
        type: z.literal('-').or(z.literal('+')),
        adjustTotal: z.number({
          required_error: 'Please enter an amount.',
          invalid_type_error: 'Please enter an amount.'
        })
      }),
    []
  )
  const formMethods = useForm({
    defaultValues: {
      type: (manualAdjustment?.total_amount_cents ?? -1) > 0 ? '+' : '-',
      adjustTotal:
        manualAdjustment?.total_amount_cents != null
          ? Math.abs(manualAdjustment?.total_amount_cents)
          : null
    },
    resolver: zodResolver(validationSchema)
  })
  const {
    formState: { isSubmitting }
  } = formMethods

  return (
    <HookedForm
      {...formMethods}
      onSubmit={async (values) => {
        if (manualAdjustment == null) {
          await createManualAdjustmentLineItem({
            sdkClient,
            order,
            amount: (values.adjustTotal ?? 0) * parseInt(`${values.type}1`)
          }).then(() => {
            onChange?.()
            close()
          })
        } else {
          await updateManualAdjustmentLineItem({
            sdkClient,
            order,
            lineItemId: manualAdjustment.id,
            amount: (values.adjustTotal ?? 0) * parseInt(`${values.type}1`)
          }).then(() => {
            onChange?.()
            close()
          })
        }
      }}
    >
      <PageLayout
        title='Adjust total'
        navigationButton={{
          onClick: () => {
            close()
          },
          label: 'Cancel',
          icon: 'x'
        }}
      >
        <div style={{ display: 'flex', width: '100%', gap: '1rem' }}>
          <div style={{ flexBasis: '6rem' }}>
            <HookedInputSelect
              name='type'
              label='Type'
              initialValues={[
                {
                  label: '-',
                  value: '-'
                },
                {
                  label: '+',
                  value: '+'
                }
              ]}
              isClearable={false}
              isSearchable={false}
            />
          </div>
          <div style={{ flexGrow: '1' }}>
            <HookedInputCurrency
              isClearable
              sign='+'
              disabled={isSubmitting}
              currencyCode={currencyCode}
              label='Amount'
              name='adjustTotal'
            />
          </div>
        </div>
        <Spacer top='2'>
          <Text variant='info'>
            Select a positive amount type to increase the order total.
          </Text>
        </Spacer>
        <Spacer top='14'>
          <Button type='submit' fullWidth disabled={isSubmitting}>
            Apply
          </Button>
        </Spacer>
      </PageLayout>
    </HookedForm>
  )
}

async function createManualAdjustmentLineItem({
  sdkClient,
  amount,
  order
}: {
  sdkClient: CommerceLayerClient
  amount: number
  order: Order
}): Promise<void> {
  const currencyCode = order.currency_code as Uppercase<CurrencyCode>

  const adjustment = await sdkClient.adjustments.create({
    currency_code: currencyCode,
    amount_cents: amount,
    name: 'Manual adjustment',
    reference_origin: manualAdjustmentReferenceOrigin
  })

  await sdkClient.line_items.create({
    order: sdkClient.orders.relationship(order.id),
    quantity: 1,
    item: adjustment,
    reference_origin: manualAdjustmentReferenceOrigin
  })
}

async function updateManualAdjustmentLineItem({
  sdkClient,
  amount,
  lineItemId,
  order
}: {
  sdkClient: CommerceLayerClient
  amount: number
  lineItemId: string
  order: Order
}): Promise<void> {
  const lineItem = await sdkClient.line_items.retrieve(lineItemId, {
    include: ['item']
  })

  if (lineItem.item != null) {
    if (amount === 0) {
      await sdkClient.adjustments.delete(lineItem.item.id)
      await sdkClient.line_items.delete(lineItemId)
    } else {
      const adjustment = await sdkClient.adjustments.update({
        id: lineItem.item.id,
        amount_cents: amount
      })

      await sdkClient.line_items.delete(lineItemId)
      await sdkClient.line_items.create({
        order: sdkClient.orders.relationship(order.id),
        quantity: 1,
        item: adjustment,
        reference_origin: manualAdjustmentReferenceOrigin
      })
    }
  }
}
