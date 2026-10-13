import {
  Button,
  type CurrencyCode,
  formatCentsToCurrency,
  HookedForm,
  HookedInputCurrency,
  Modal,
  Spacer,
  Text,
  useCoreSdkProvider,
} from "@commercelayer/app-elements"
import type { Order, PaymentSession } from "@commercelayer/sdk"
import { zodResolver } from "@hookform/resolvers/zod"
import { getPaymentSessionDisplay } from "dashboard-apps-common/src/helpers/paymentDisplay"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { usePaymentActionFlow } from "#components/OrderPayment/hooks/usePaymentActionFlow"
import {
  CAPTURE_COPY,
  PaymentActionConfirm,
  PaymentActionModal,
  PaymentBreakdown,
  type PaymentBreakdownLine,
} from "#components/OrderPayment/PaymentActionModal"
import {
  getCapturableAmountCents,
  getCapturableSessions,
  getCaptureDistribution,
  getInstrumentLabel,
} from "#components/OrderPayment/paymentSessionUtils"

interface Props {
  order: Order
  onChange: () => void
}

interface OrderCaptureModalHook {
  modal: React.JSX.Element
  open: () => void
}

/** Order-level capture: how much to take from each capturable session, prefilled with the automatic split. */
export function useOrderCaptureModal({
  order,
  onChange,
}: Props): OrderCaptureModalHook {
  const [show, setShow] = useState(false)
  const { sdkClient } = useCoreSdkProvider()

  const defaultAmountsBySession = new Map(
    getCaptureDistribution(order).map(({ session, amountCents }) => [
      session.id,
      amountCents,
    ]),
  )
  const outstandingCents = getCapturableAmountCents(order)
  const currencyCode = order.currency_code as
    | Uppercase<CurrencyCode>
    | undefined

  const format = (cents: number): string =>
    currencyCode == null ? "" : formatCentsToCurrency(cents, currencyCode)

  /** Every capturable session, including those the default split leaves at zero. */
  const capturableSessions = getCapturableSessions(order).map((session) => ({
    session,
    instrument: getInstrumentLabel(getPaymentSessionDisplay(session)),
    heldCents: session.payment_authorization?.capture_balance_cents ?? 0,
    defaultAmountCents: defaultAmountsBySession.get(session.id) ?? 0,
  }))

  const totalHeldCents = capturableSessions.reduce(
    (total, { heldCents }) => total + heldCents,
    0,
  )

  /** True when several sessions hold more than is outstanding, so the operator picks how much each one gives. */
  const hasSplitChoice =
    capturableSessions.length > 1 && totalHeldCents > outstandingCents

  const defaultValues = {
    amounts: Object.fromEntries(
      capturableSessions.map(({ session, defaultAmountCents }) => [
        session.id,
        defaultAmountCents,
      ]),
    ),
  }

  const methods = useForm<CaptureFormValues>({
    defaultValues,
    resolver: zodResolver(makeFormSchema(capturableSessions)),
  })

  const defaultTotalCents = capturableSessions.reduce(
    (total, { defaultAmountCents }) => total + defaultAmountCents,
    0,
  )

  const enteredTotalCents = Object.values(
    methods.watch("amounts") ?? {},
  ).reduce((total, amount) => total + (amount ?? 0), 0)
  /** Negative once the inputs go over the outstanding amount. */
  const unallocatedCents = outstandingCents - enteredTotalCents
  const flow = usePaymentActionFlow<CaptureFormValues>({
    create: async (values) =>
      await Promise.all(
        capturableSessions.flatMap(({ session }) => {
          const authorization = session.payment_authorization
          const amountCents = values.amounts[session.id] ?? 0
          if (authorization == null || amountCents <= 0) return []
          return [
            sdkClient.payment_captures.create({
              payment_session: { id: session.id, type: "payment_sessions" },
              payment_authorization: {
                id: authorization.id,
                type: "payment_authorizations",
              },
              amount_cents: amountCents,
            }),
          ]
        }),
      ),
    retrieve: async (id) => await sdkClient.payment_captures.retrieve(id),
    onSettled: onChange,
  })

  /** The lines being captured, kept for the result step: captured sessions drop out of `capturableSessions`. */
  const [capturedLines, setCapturedLines] = useState<PaymentBreakdownLine[]>([])

  const capture = async (values: CaptureFormValues): Promise<void> => {
    setCapturedLines(
      capturableSessions.map(({ session, instrument }) => ({
        key: session.id,
        // The result step has no button carrying the total, so every line shows its amount.
        amount: format(values.amounts[session.id] ?? 0),
        instrument,
      })),
    )
    await flow.run(values)
  }

  const close = (): void => {
    setShow(false)
    flow.reset()
    setCapturedLines([])
  }

  const modal = (
    <PaymentActionModal
      show={show}
      step={flow.step}
      copy={CAPTURE_COPY}
      detail={<PaymentBreakdown lines={capturedLines} />}
      errorDetail={flow.errorDetail}
      size={hasSplitChoice ? "small" : "x-small"}
      onClose={close}
    >
      {hasSplitChoice ? (
        <>
          <Modal.Header>Capture payment</Modal.Header>
          <HookedForm
            {...methods}
            onSubmit={async (values) => {
              await capture(values)
            }}
          >
            <Modal.Body>
              {capturableSessions.map(({ session, instrument, heldCents }) => (
                <Spacer key={session.id} bottom="4">
                  <HookedInputCurrency
                    name={`amounts.${session.id}`}
                    currencyCode={currencyCode ?? "USD"}
                    label={instrument}
                    hint={{ text: `Authorized ${format(heldCents)}` }}
                  />
                </Spacer>
              ))}

              <Text
                tag="div"
                size="small"
                weight="semibold"
                variant={
                  unallocatedCents === 0
                    ? "success"
                    : unallocatedCents < 0
                      ? "danger"
                      : "warning"
                }
              >
                {unallocatedCents === 0
                  ? `${format(outstandingCents)} fully allocated`
                  : unallocatedCents > 0
                    ? `${format(unallocatedCents)} left to allocate`
                    : `${format(-unallocatedCents)} over the outstanding amount`}
              </Text>
              <Text tag="div" size="small" variant="info">
                Capturing {format(enteredTotalCents)} of{" "}
                {format(outstandingCents)} outstanding
              </Text>
            </Modal.Body>
            <Modal.Footer>
              <Button
                fullWidth
                type="submit"
                disabled={
                  enteredTotalCents <= 0 ||
                  enteredTotalCents > outstandingCents ||
                  methods.formState.isSubmitting
                }
              >
                Capture {format(enteredTotalCents)}
              </Button>
              <Button
                // Without this it defaults to `submit` inside the form and
                // captures instead of resetting.
                type="button"
                fullWidth
                variant="secondary"
                onClick={() => {
                  methods.reset(defaultValues)
                }}
              >
                Reset amounts
              </Button>
            </Modal.Footer>
          </HookedForm>
        </>
      ) : (
        <PaymentActionConfirm
          icon="bank"
          title="Capture payment?"
          description={
            <PaymentBreakdown
              lines={capturableSessions.map(
                ({ session, instrument, defaultAmountCents }) => ({
                  key: session.id,
                  // With one payment the button already carries the amount.
                  amount:
                    capturableSessions.length === 1
                      ? undefined
                      : format(defaultAmountCents),
                  instrument,
                }),
              )}
            />
          }
          // The confirm has no inputs, so the label comes from the defaults.
          confirmLabel={`Capture ${format(defaultTotalCents)}`}
          onConfirm={() => {
            void capture(defaultValues)
          }}
          onCancel={close}
        />
      )}
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

const makeFormSchema = (
  capturableSessions: Array<{
    session: Pick<PaymentSession, "id">
    heldCents: number
  }>,
) =>
  z
    .object({
      amounts: z.record(z.string(), z.number().min(0, "Cannot be negative")),
    })
    .superRefine((values, ctx) => {
      capturableSessions.forEach(({ session, heldCents }) => {
        if ((values.amounts[session.id] ?? 0) > heldCents) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["amounts", session.id],
            message: "Above the authorized amount",
          })
        }
      })
    })

type CaptureFormValues = z.infer<ReturnType<typeof makeFormSchema>>
