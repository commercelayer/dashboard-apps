import { appRoutes } from '#data/routes'
import { getOrderTitle } from '#utils/getOrderTitle'
import {
  Button,
  formatCentsToCurrency,
  HookedForm,
  HookedInput,
  HookedInputCurrency,
  HookedValidationApiError,
  PageLayout,
  Spacer,
  type CurrencyCode
} from '@commercelayer/app-elements'
import type { Capture, Order } from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useLocation } from 'wouter'
import { z } from 'zod'
import { RefundEstimator } from './RefundEstimator'

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

  return (
    <PageLayout
      overlay
      title='Make refund'
      navigationButton={{
        onClick: () => {
          setLocation(appRoutes.details.makePath({ orderId: order.id }))
        },
        label: getOrderTitle(order),
        icon: 'arrowLeft'
      }}
    >
      <RefundEstimator order={order} capture={capture} />
      <HookedForm {...methods} onSubmit={onSubmit}>
        <>
          <Spacer bottom='8'>
            {order.currency_code != null ? (
              <HookedInputCurrency
                currencyCode={order.currency_code as Uppercase<CurrencyCode>}
                name='amountCents'
                label='Amount to refund'
                hint={{
                  text: `You can refund up to ${
                    capture.formatted_refund_balance ?? '0'
                  }. A full refund will cancel the order.`
                }}
              />
            ) : (
              <div>missing currency code</div>
            )}
          </Spacer>

          <Spacer bottom='8'>
            <HookedInput
              name='note'
              label='Reason'
              hint={{
                text: `Only you and other staff can see this reason.`
              }}
            />
          </Spacer>

          <Spacer top='14'>
            <Button
              fullWidth
              type='submit'
              disabled={
                methods.watch('amountCents') == null ||
                methods.watch('amountCents') === 0 ||
                isSubmitting
              }
            >
              Refund{' '}
              {order.currency_code != null &&
                !isNaN(methods.getValues('amountCents')) &&
                formatCentsToCurrency(
                  methods.getValues('amountCents'),
                  order.currency_code as Uppercase<CurrencyCode>
                )}
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
