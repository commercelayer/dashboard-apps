import {
  Button,
  type CurrencyCode,
  HookedForm,
  HookedInput,
  HookedInputCurrency,
  HookedInputSelect,
  Modal,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { PaymentCapture, PaymentSession } from "@commercelayer/sdk"
import { zodResolver } from "@hookform/resolvers/zod"
import isEmpty from "lodash-es/isEmpty"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { usePaymentActionFlow } from "#components/OrderPayment/hooks/usePaymentActionFlow"
import {
  type PaymentActionCopy,
  PaymentActionModal,
} from "#components/OrderPayment/PaymentActionModal"
import type { PaymentDisplay } from "#components/OrderPayment/paymentDisplay"
import {
  getInstrumentLabel,
  getRefundableCaptures,
} from "#components/OrderPayment/paymentSessionUtils"
import { paymentRefundNoteReferenceOrigin } from "#data/attachments"

interface Props {
  session: PaymentSession
  display: PaymentDisplay
  onChange: () => void
}

const REFUND_COPY: PaymentActionCopy = {
  running: "Refunding payment…",
  success: "Payment refunded",
  pending: "Refund still processing",
  error: "Refund failed",
}

interface PaymentSessionRefundModalHook {
  modal: React.JSX.Element
  open: () => void
}

/**
 * "Issue a refund" form, shown in a modal.
 *
 * Scoped to the captures of a single session on purpose: refunding across
 * sessions from a row that displays one payment instrument would misrepresent
 * what is being refunded. In practice a session usually has a single capture,
 * so the select is often a one-option confirmation of the target.
 */
export function usePaymentSessionRefundModal({
  session,
  display,
  onChange,
}: Props): PaymentSessionRefundModalHook {
  const [show, setShow] = useState(false)
  const { sdkClient } = useCoreSdkProvider()
  const { user } = useTokenProvider()

  const captures = getRefundableCaptures(session)
  const instrument = getInstrumentLabel(display)
  const currencyCode = session.currency_code as
    | Uppercase<CurrencyCode>
    | undefined

  const methods = useForm<RefundFormValues>({
    defaultValues: { paymentCaptureId: captures[0]?.id },
    resolver: zodResolver(makeFormSchema(captures)),
  })

  const flow = usePaymentActionFlow<RefundFormValues>({
    create: async (values) => {
      const refund = await sdkClient.payment_refunds.create({
        payment_session: { id: session.id, type: "payment_sessions" },
        payment_capture: {
          id: values.paymentCaptureId,
          type: "payment_captures",
        },
        amount_cents: values.amountCents,
      })
      await saveNote(refund.id, values.note)
      return refund
    },
    retrieve: async (id) => await sdkClient.payment_refunds.retrieve(id),
    onSettled: onChange,
  })

  const close = (): void => {
    setShow(false)
    flow.reset()
    methods.reset()
  }

  /**
   * The note is an attachment on the refund itself, so it stays next to the
   * transaction it explains. Failing silently is deliberate: the refund has
   * already gone through by then, and reporting it as failed would be a lie.
   */
  const saveNote = async (
    paymentRefundId: string,
    text?: string,
  ): Promise<void> => {
    const displayName = user?.displayName
    if (displayName == null || isEmpty(displayName) || isEmpty(text?.trim())) {
      return
    }

    try {
      await sdkClient.attachments.create({
        reference_origin: paymentRefundNoteReferenceOrigin,
        name: displayName,
        description: text,
        attachable: { id: paymentRefundId, type: "payment_refunds" },
      })
    } catch {
      // do nothing
    }
  }

  const modal = (
    <PaymentActionModal
      show={show}
      step={flow.step}
      copy={REFUND_COPY}
      detail={`${flow.amount ?? ""} · ${instrument}`}
      errorDetail={flow.errorDetail}
      size="small"
      onClose={close}
    >
      <Modal.Header>Issue a refund</Modal.Header>
      <HookedForm
        {...methods}
        onSubmit={async (values) => {
          await flow.run(values)
        }}
      >
        <Modal.Body>
          <Spacer bottom="8">
            <HookedInputSelect
              name="paymentCaptureId"
              initialValues={captures.map((capture) => ({
                value: capture.id,
                label: getCaptureLabel(capture, instrument),
              }))}
              isSearchable={false}
            />
          </Spacer>

          {currencyCode != null && (
            <Spacer bottom="8">
              <HookedInputCurrency
                name="amountCents"
                currencyCode={currencyCode}
                label="Amount"
              />
            </Spacer>
          )}

          <HookedInput
            name="note"
            label="Internal note (optional)"
            hint={{ text: "Only you and other staff can see it." }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            fullWidth
            type="submit"
            disabled={
              methods.watch("amountCents") == null ||
              methods.watch("amountCents") === 0 ||
              methods.formState.isSubmitting
            }
          >
            Refund
          </Button>
        </Modal.Footer>
      </HookedForm>
    </PaymentActionModal>
  )

  return {
    modal,
    open: () => {
      setShow(true)
    },
  }
}

/**
 * Two captures on the same session share the card brand and last4, since both
 * come from the session's single authorization, so the remaining balance is
 * what actually tells them apart.
 */
function getCaptureLabel(capture: PaymentCapture, instrument: string): string {
  return `${instrument} (up to ${capture.formatted_refund_balance ?? "0"})`
}

const makeFormSchema = (captures: PaymentCapture[]) =>
  z
    .object({
      paymentCaptureId: z.string({ required_error: "Required field" }),
      amountCents: z.number({
        required_error: "Required field",
        invalid_type_error: "Please enter a valid amount",
      }),
      note: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      const capture = captures.find(({ id }) => id === values.paymentCaptureId)
      const maxRefundableAmount = capture?.refund_balance_cents ?? 0

      if (values.amountCents <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amountCents"],
          message: "Please enter a valid amount",
        })
        return
      }

      if (values.amountCents > maxRefundableAmount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amountCents"],
          message: `You can refund up to ${
            capture?.formatted_refund_balance ?? "0"
          }`,
        })
      }
    })

type RefundFormValues = z.infer<ReturnType<typeof makeFormSchema>>
