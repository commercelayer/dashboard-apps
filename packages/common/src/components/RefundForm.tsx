import {
  Button,
  formatCentsToCurrency,
  HookedForm,
  HookedInput,
  HookedInputCurrency,
  HookedValidationApiError,
  PageLayout,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider,
  type CurrencyCode
} from '@commercelayer/app-elements'
import type {
  AttachmentCreate,
  Capture,
  LineItem,
  Order,
  Return,
  ReturnLineItem
} from '@commercelayer/sdk'
import { zodResolver } from '@hookform/resolvers/zod'
import isEmpty from 'lodash-es/isEmpty'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation } from 'wouter'
import { z } from 'zod'
import { RefundEstimator } from './RefundEstimator'

interface Props {
  defaultValues: Partial<RefundFormValues>
  order: Order
  capture: Capture
  lineItems: LineItem[] | ReturnLineItem[]
  refundable: Capture | Return
  note: {
    referenceOrigin: string
    attachable: AttachmentCreate['attachable']
  }
  goBackUrl: string
}

export function RefundForm({
  defaultValues,
  order,
  capture,
  note,
  refundable,
  goBackUrl,
  lineItems
}: Props): React.JSX.Element {
  const [, setLocation] = useLocation()
  const { user } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()

  const [apiError, setApiError] = useState<any>()

  const methods = useForm<RefundFormValues>({
    defaultValues,
    resolver: zodResolver(
      makeFormSchema(
        capture.refund_balance_cents ?? 0,
        capture.formatted_refund_balance ?? '0'
      )
    )
  })

  const processRefund = async (amountCent: number): Promise<void> => {
    try {
      await sdkClient[refundable.type].update({
        id: refundable.id,
        _refund: true,
        _refund_amount_cents: amountCent
      })
    } catch (error) {
      setApiError(error)
      throw error
    }
  }

  const saveReason = async (text?: string): Promise<void> => {
    if (
      user?.displayName != null &&
      !isEmpty(user.displayName) &&
      !isEmpty(text?.trim())
    ) {
      try {
        await sdkClient.attachments.create({
          reference_origin: note.referenceOrigin,
          name: user.displayName,
          description: text,
          attachable: note.attachable
        })
      } catch (error) {
        // do nothing, silently fail
        // when the attachments is not created, the process continues since the refund is already done
      }
    }
  }

  return (
    <PageLayout
      overlay
      title='Make refund'
      navigationButton={{
        onClick: () => {
          setLocation(goBackUrl)
        },
        label: 'Back',
        icon: 'arrowLeft'
      }}
    >
      <RefundEstimator
        capture={capture}
        currencyCode={order.currency_code}
        lineItems={lineItems}
        order={order}
      />
      <HookedForm
        {...methods}
        onSubmit={async () => {
          await processRefund(methods.getValues('amountCents'))
          await saveReason(methods.getValues('note'))
          setLocation(goBackUrl)
        }}
      >
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
                methods.formState.isSubmitting
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
