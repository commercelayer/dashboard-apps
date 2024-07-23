import { hasPaymentMethod, PaymentMethod } from '#components/PaymentMethod'
import { appRoutes } from '#data/routes'
import { getOrderTitle } from '#utils/getOrderTitle'
import {
  Button,
  formatCentsToCurrency,
  HookedForm,
  HookedInput,
  HookedInputCurrency,
  HookedValidationApiError,
  ListDetails,
  ListDetailsItem,
  PageLayout,
  Spacer,
  type CurrencyCode
} from '@commercelayer/app-elements'
import type { Capture, Order } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation } from 'wouter'
import { z } from 'zod'

interface Props {
  defaultValues: Partial<RefundFormValues>
  order: Order
  capture: Capture
  isSubmitting?: boolean
  onSubmit: (formValues: RefundFormValues) => void
  apiError?: any
}

export function RefundForm({
  defaultValues,
  order,
  capture,
  onSubmit,
  apiError,
  isSubmitting
}: Props): JSX.Element {
  const [, setLocation] = useLocation()
  const methods = useForm<RefundFormValues>({
    defaultValues,
    resolver: zodResolver(
      makeFormSchema(
        capture.refund_balance_cents ?? 0,
        capture.formatted_refund_balance ?? '0'
      )
    )
  })
  const [step, setStep] = useState<'fields' | 'confirm'>('fields')

  useEffect(
    function showFieldsOnApiError() {
      if (apiError != null) {
        setStep('fields')
      }
    },
    [apiError]
  )

  return (
    <PageLayout
      overlay
      title='Make refund'
      navigationButton={{
        onClick: () => {
          if (step === 'confirm') {
            setStep('fields')
          } else {
            setLocation(appRoutes.details.makePath({ orderId: order.id }))
          }
        },
        label: step === 'confirm' ? 'Back' : getOrderTitle(order),
        icon: 'arrowLeft'
      }}
    >
      <HookedForm {...methods} onSubmit={onSubmit}>
        {step === 'fields' ? (
          <>
            <Spacer bottom='8'>
              {order.currency_code != null ? (
                <HookedInputCurrency
                  currencyCode={order.currency_code as Uppercase<CurrencyCode>}
                  name='amountCents'
                  label='Amount'
                  hint={{
                    text: `You can refund up to ${
                      capture.formatted_refund_balance ?? '0'
                    }`
                  }}
                />
              ) : (
                <div>missing currency code</div>
              )}
            </Spacer>
            <Spacer bottom='8'>
              <HookedInput
                name='note'
                label='Note'
                placeholder='Leave a note'
              />
            </Spacer>

            <Spacer top='14'>
              <Button
                type='button'
                disabled={
                  methods.watch('amountCents') == null ||
                  methods.watch('amountCents') === 0
                }
                onClick={() => {
                  // triggering form validation before proceeding to step `confirm`
                  void methods.trigger().then((isValid) => {
                    if (isValid) {
                      setStep('confirm')
                    }
                  })
                }}
              >
                Proceed with refund
              </Button>
              <Spacer top='2'>
                <HookedValidationApiError
                  apiError={apiError}
                  fieldMap={{
                    _refund_amount_cents: 'amountCents'
                  }}
                />
              </Spacer>
            </Spacer>
          </>
        ) : step === 'confirm' ? (
          <>
            <ListDetails>
              <ListDetailsItem label='Amount'>
                {order.currency_code != null &&
                  formatCentsToCurrency(
                    methods.getValues('amountCents'),
                    order.currency_code as Uppercase<CurrencyCode>
                  )}
              </ListDetailsItem>
              <ListDetailsItem label='Note'>
                {methods.getValues('note')}
              </ListDetailsItem>
              <ListDetailsItem label='Refund to'>
                {hasPaymentMethod(order) ? (
                  <PaymentMethod order={order} />
                ) : (
                  '-'
                )}
              </ListDetailsItem>
              <ListDetailsItem label='Order'>#{order.number}</ListDetailsItem>
            </ListDetails>
            <Spacer top='14'>
              {/* Real form submit */}
              <Button type='submit' disabled={isSubmitting}>
                Refund{' '}
                {order.currency_code != null &&
                  formatCentsToCurrency(
                    methods.getValues('amountCents'),
                    order.currency_code as Uppercase<CurrencyCode>
                  )}
              </Button>
            </Spacer>
          </>
        ) : null}
      </HookedForm>
    </PageLayout>
  )
}

const makeFormSchema = (
  maxRefundableAmount: number,
  formattedMaxRefundableAmount: string
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) =>
  z.object({
    amountCents: z
      .number({
        required_error: 'Required field',
        invalid_type_error: 'Please enter a valid amount'
      })
      .positive()
      .max(maxRefundableAmount, {
        message: `You can refund up to ${formattedMaxRefundableAmount}`
      }),
    note: z.string().optional()
  })

export type RefundFormValues = z.infer<ReturnType<typeof makeFormSchema>>
