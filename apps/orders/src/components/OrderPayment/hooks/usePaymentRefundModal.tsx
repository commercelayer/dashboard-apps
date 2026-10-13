import {
  Button,
  type CurrencyCode,
  formatDate,
  HookedForm,
  HookedInput,
  HookedInputCurrency,
  HookedInputSelect,
  Modal,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider,
} from "@commercelayer/app-elements"
import type { PaymentCapture } from "@commercelayer/sdk"
import { zodResolver } from "@hookform/resolvers/zod"
import { getPaymentSessionDisplay } from "dashboard-apps-common/src/helpers/paymentDisplay"
import isEmpty from "lodash-es/isEmpty"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { usePaymentActionFlow } from "#components/OrderPayment/hooks/usePaymentActionFlow"
import {
  joinPaymentDetail,
  PaymentActionModal,
  REFUND_COPY,
} from "#components/OrderPayment/PaymentActionModal"
import {
  getInstrumentLabel,
  type RefundTarget,
} from "#components/OrderPayment/paymentSessionUtils"
import { refundNoteReferenceOrigin } from "#data/attachments"

interface Props {
  /** The order the note is attached to. */
  orderId: string
  /**
   * Captures a refund can be issued against. A row passes its own session's
   * captures, the order-level action passes every session's.
   */
  targets: RefundTarget[]
  /** Amount to prefill, capped by the selected capture's refundable balance. */
  defaultAmountCents?: number
  onChange: () => void
}

interface PaymentRefundModalHook {
  modal: React.JSX.Element
  open: () => void
}

/**
 * A modal to refund one capture: pick the capture, the amount, and an optional
 * internal note.
 */
export function usePaymentRefundModal({
  orderId,
  targets,
  defaultAmountCents,
  onChange,
}: Props): PaymentRefundModalHook {
  const [show, setShow] = useState(false)
  const { sdkClient } = useCoreSdkProvider()
  const { user } = useTokenProvider()

  const captures = targets.map(({ capture }) => capture)

  /** Preselects the oldest capture, so the select is never empty. */
  const selectedCapture = targets[0]?.capture

  const defaultValues = {
    paymentCaptureId: selectedCapture?.id,
    amountCents:
      defaultAmountCents == null
        ? undefined
        : Math.min(
            defaultAmountCents,
            selectedCapture?.refund_balance_cents ?? 0,
          ),
  }

  const methods = useForm<RefundFormValues>({
    defaultValues,
    resolver: zodResolver(makeFormSchema(captures)),
  })

  const selectedTarget =
    targets.find(
      ({ capture }) => capture.id === methods.watch("paymentCaptureId"),
    ) ?? targets[0]
  const instrument =
    selectedTarget == null
      ? ""
      : getInstrumentLabel(getPaymentSessionDisplay(selectedTarget.session))
  const currencyCode = selectedTarget?.session.currency_code as
    | Uppercase<CurrencyCode>
    | undefined

  const flow = usePaymentActionFlow<RefundFormValues>({
    create: async (values) => {
      const target = targets.find(
        ({ capture }) => capture.id === values.paymentCaptureId,
      )
      const refund = await sdkClient.payment_refunds.create({
        payment_session: {
          id: target?.session.id ?? "",
          type: "payment_sessions",
        },
        payment_capture: {
          id: values.paymentCaptureId,
          type: "payment_captures",
        },
        amount_cents: values.amountCents,
      })
      await saveNote(values.note)
      return refund
    },
    retrieve: async (id) => await sdkClient.payment_refunds.retrieve(id),
    onSettled: onChange,
  })

  const close = (): void => {
    setShow(false)
    flow.reset()
    methods.reset(defaultValues)
  }

  /**
   * Saves the note on the order, where the timeline reads it. Fails silently:
   * the refund has already gone through by then.
   */
  const saveNote = async (text?: string): Promise<void> => {
    const displayName = user?.displayName
    if (displayName == null || isEmpty(displayName) || isEmpty(text?.trim())) {
      return
    }

    try {
      await sdkClient.attachments.create({
        reference_origin: refundNoteReferenceOrigin,
        name: displayName,
        description: text,
        attachable: { id: orderId, type: "orders" },
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
      detail={joinPaymentDetail(flow.amount, instrument)}
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
              initialValues={targets.map((target) => ({
                value: target.capture.id,
                label: getCaptureLabel(target, user?.timezone),
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
              methods.watch("paymentCaptureId") == null ||
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
      // Reseed before showing: `useForm` keeps the defaults of its first render.
      methods.reset(defaultValues)
      setShow(true)
    },
  }
}

/**
 * Instrument, date and refundable balance. The date tells apart two captures
 * of the same session.
 */
function getCaptureLabel(
  { session, capture }: RefundTarget,
  timezone: string | undefined,
): string {
  const instrument = getInstrumentLabel(getPaymentSessionDisplay(session))
  const date = formatDate({
    isoDate: capture.created_at,
    timezone,
    format: "date",
  })

  return `${instrument} · ${date} (up to ${capture.formatted_refund_balance ?? "0"})`
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
