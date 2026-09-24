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
import type { Order } from "@commercelayer/sdk"
import { zodResolver } from "@hookform/resolvers/zod"
import { getPaymentDisplay } from "dashboard-apps-common/src/helpers/paymentDisplay"
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

/**
 * Order-level capture: how much to take from each funding session.
 *
 * Prefilled with the automatic split (oldest session first, capped at what the
 * order is worth) and editable, because with several sessions there is no
 * single right answer to which instrument absorbs a reduction. That decision
 * belongs to whoever is looking at the order, which is also why core-api
 * deliberately does not cap this itself.
 */
export function useOrderCaptureModal({
  order,
  onChange,
}: Props): OrderCaptureModalHook {
  const [show, setShow] = useState(false)
  const { sdkClient } = useCoreSdkProvider()

  // Keyed by session, since the distribution only lists what it funds.
  const distribution = new Map(
    getCaptureDistribution(order).map(({ session, amountCents }) => [
      session.id,
      amountCents,
    ]),
  )
  const targetCents = getCapturableAmountCents(order)
  const currencyCode = order.currency_code as
    | Uppercase<CurrencyCode>
    | undefined

  /**
   * Every session that could fund this capture, not just the ones the default
   * split happens to use. A session the split leaves at zero still holds money
   * and still belongs on screen: it is one of the options the operator is
   * choosing between, and what it holds counts towards what will expire.
   */
  const rows = getCapturableSessions(order).map((session) => ({
    session,
    instrument: getInstrumentLabel(getPaymentDisplay(session)),
    authorizedCents: session.payment_authorization?.capture_balance_cents ?? 0,
    defaultAmountCents: distribution.get(session.id) ?? 0,
  }))

  const defaultValues = {
    amounts: Object.fromEntries(
      rows.map(({ session, defaultAmountCents }) => [
        session.id,
        defaultAmountCents,
      ]),
    ),
  }

  const methods = useForm<CaptureFormValues>({
    defaultValues,
    resolver: zodResolver(makeFormSchema(rows, targetCents)),
  })

  const heldCents = rows.reduce(
    (total, { authorizedCents }) => total + authorizedCents,
    0,
  )

  /**
   * The split is a decision only when several sessions have to share an amount
   * smaller than what they hold: someone has to say which instrument absorbs
   * the reduction. One session, or holds that fit inside the outstanding
   * amount, leave exactly one correct answer, so the modal states it and asks
   * for a confirmation instead of a form with no alternatives.
   */
  const needsAllocation = rows.length > 1 && heldCents > targetCents

  const amounts = methods.watch("amounts")
  const totalCents = Object.values(amounts ?? {}).reduce(
    (total, amount) => total + (amount ?? 0),
    0,
  )
  // What is still needed to cover the order, the figure you are chasing while
  // moving amounts between sessions. Negative once the inputs go over.
  const remainingCents = targetCents - totalCents
  const flow = usePaymentActionFlow<CaptureFormValues>({
    create: async (values) =>
      await Promise.all(
        rows.flatMap(({ session }) => {
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
    currencyCode: order.currency_code,
  })

  /**
   * The breakdown as it was when the capture was fired. `rows` is derived from
   * the order, and a captured session stops being capturable, so by the time
   * the result shows there is nothing left to describe.
   */
  const [capturedLines, setCapturedLines] = useState<PaymentBreakdownLine[]>([])

  const run = async (values: CaptureFormValues): Promise<void> => {
    setCapturedLines(
      rows.map(({ session, instrument }) => ({
        key: session.id,
        // Always priced here, unlike the confirm: no button carries the total
        // on the result step.
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
    methods.reset(defaultValues)
  }

  const format = (cents: number): string =>
    currencyCode == null ? "" : formatCentsToCurrency(cents, currencyCode)

  const modal = (
    <PaymentActionModal
      show={show}
      step={flow.step}
      copy={CAPTURE_COPY}
      detail={<PaymentBreakdown lines={capturedLines} />}
      errorDetail={flow.errorDetail}
      // Only the allocation form needs the extra width: the confirm is the
      // same question the row menu asks, so it gets the same narrow modal.
      size={needsAllocation ? "small" : "x-small"}
      onClose={close}
    >
      {!needsAllocation ? (
        <PaymentActionConfirm
          icon="bank"
          title="Capture payment?"
          description={
            <>
              <PaymentBreakdown
                lines={rows.map(
                  ({ session, instrument, defaultAmountCents }) => ({
                    key: session.id,
                    // The amount is only worth repeating when it is split:
                    // with one payment the button already carries it.
                    amount:
                      rows.length === 1
                        ? undefined
                        : format(defaultAmountCents),
                    instrument,
                  }),
                )}
              />
            </>
          }
          confirmLabel={`Capture ${format(totalCents)}`}
          onConfirm={() => {
            void run(defaultValues)
          }}
          onCancel={close}
        />
      ) : (
        <>
          <Modal.Header>Capture payment</Modal.Header>
          <HookedForm
            {...methods}
            onSubmit={async (values) => {
              await run(values)
            }}
          >
            <Modal.Body>
              {rows.map(({ session, instrument, authorizedCents }) => (
                <Spacer key={session.id} bottom="4">
                  <HookedInputCurrency
                    name={`amounts.${session.id}`}
                    currencyCode={currencyCode ?? "USD"}
                    label={instrument}
                    hint={{ text: `Authorized ${format(authorizedCents)}` }}
                  />
                </Spacer>
              ))}

              <Text
                tag="div"
                size="small"
                weight="semibold"
                variant={
                  remainingCents === 0
                    ? "success"
                    : remainingCents < 0
                      ? "danger"
                      : "warning"
                }
              >
                {remainingCents === 0
                  ? `${format(targetCents)} fully allocated`
                  : remainingCents > 0
                    ? `${format(remainingCents)} left to allocate`
                    : `${format(-remainingCents)} over the outstanding amount`}
              </Text>
              <Text tag="div" size="small" variant="info">
                Capturing {format(totalCents)} of {format(targetCents)}{" "}
                outstanding
              </Text>
            </Modal.Body>
            <Modal.Footer>
              <Button
                fullWidth
                type="submit"
                disabled={
                  totalCents <= 0 ||
                  totalCents > targetCents ||
                  methods.formState.isSubmitting
                }
              >
                Capture {format(totalCents)}
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
      )}
    </PaymentActionModal>
  )

  return {
    modal,
    open: () => {
      setShow(true)
    },
  }
}

const makeFormSchema = (
  rows: Array<{ session: { id: string }; authorizedCents: number }>,
  targetCents: number,
) =>
  z
    .object({
      amounts: z.record(z.string(), z.number()),
    })
    .superRefine((values, ctx) => {
      rows.forEach(({ session, authorizedCents }) => {
        const amount = values.amounts[session.id] ?? 0
        if (amount < 0 || amount > authorizedCents) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["amounts", session.id],
            message: "Above the authorized amount",
          })
        }
      })

      const total = Object.values(values.amounts).reduce(
        (sum, amount) => sum + (amount ?? 0),
        0,
      )
      if (total > targetCents) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amounts"],
          message: "More than the order is worth",
        })
      }
    })

type CaptureFormValues = z.infer<ReturnType<typeof makeFormSchema>>
