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
import { getPaymentDisplay } from "dashboard-apps-common/src/helpers/paymentDisplay"
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
import { paymentRefundNoteReferenceOrigin } from "#data/attachments"

interface Props {
  /**
   * Captures a refund can be issued against. A row passes its own session's
   * captures, the order-level action passes every session's.
   */
  targets: RefundTarget[]
  /**
   * Amount to start from, when the caller knows one: the order-level action
   * refunds what the order holds beyond its total. Capped per capture, since
   * the selected one may not be able to cover all of it on its own.
   */
  defaultAmountCents?: number
  onChange: () => void
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
  targets,
  defaultAmountCents,
  onChange,
}: Props): PaymentSessionRefundModalHook {
  const [show, setShow] = useState(false)
  const { sdkClient } = useCoreSdkProvider()
  const { user } = useTokenProvider()

  const captures = targets.map(({ capture }) => capture)

  // The first capture, so the select is never empty: `targets` is sorted
  // oldest first, which is the one a refund would normally come out of.
  const selectedCapture = targets[0]?.capture

  const defaultValues = {
    paymentCaptureId: selectedCapture?.id,
    amountCents:
      defaultAmountCents == null
        ? undefined
        : // Capped by the capture it will be issued against, which may not
          // cover the whole amount on its own.
          Math.min(
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
      : getInstrumentLabel(getPaymentDisplay(selectedTarget.session))
  const currencyCode = selectedTarget?.session.currency_code as
    | Uppercase<CurrencyCode>
    | undefined

  const flow = usePaymentActionFlow<RefundFormValues>({
    create: async (values) => {
      const target = targets.find(
        ({ capture }) => capture.id === values.paymentCaptureId,
      )
      const refund = await sdkClient.payment_refunds.create({
        // The session of the chosen capture, which at order level is not
        // necessarily the first one.
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
      await saveNote(refund.id, values.note)
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
      /*
        Reset before showing, not just on close. The order-level callers mount
        this hook with the page, while the order is still the skeleton
        placeholder and `targets` is empty, and `useForm` keeps whatever
        defaults it saw first. Resetting here binds the form to the targets
        that exist at the moment the operator opens it.
      */
      methods.reset(defaultValues)
      setShow(true)
    },
  }
}

/**
 * Two captures on the same session share the card brand and last4, since both
 * come from the session's single authorization, so the date is what actually
 * tells them apart. Across sessions the instrument already differs.
 */
function getCaptureLabel(
  { session, capture }: RefundTarget,
  timezone: string | undefined,
): string {
  const instrument = getInstrumentLabel(getPaymentDisplay(session))
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
