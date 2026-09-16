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
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { usePaymentActionFlow } from "#components/OrderPayment/hooks/usePaymentActionFlow"
import {
  CAPTURE_COPY,
  joinPaymentDetail,
  PaymentActionModal,
} from "#components/OrderPayment/PaymentActionModal"
import { getPaymentDisplay } from "#components/OrderPayment/paymentDisplay"
import {
  getCapturableAmountCents,
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

  const distribution = getCaptureDistribution(order)
  const targetCents = getCapturableAmountCents(order)
  const currencyCode = order.currency_code as
    | Uppercase<CurrencyCode>
    | undefined

  const rows = distribution.map(({ session, amountCents }) => ({
    session,
    instrument: getInstrumentLabel(getPaymentDisplay(session)),
    authorizedCents: session.payment_authorization?.capture_balance_cents ?? 0,
    defaultAmountCents: amountCents,
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

  const amounts = methods.watch("amounts")
  const totalCents = Object.values(amounts ?? {}).reduce(
    (total, amount) => total + (amount ?? 0),
    0,
  )
  // What is still needed to cover the order, the figure you are chasing while
  // moving amounts between sessions. Negative once the inputs go over.
  const remainingCents = targetCents - totalCents
  const uncapturedCents = rows.reduce(
    (total, { session, authorizedCents }) =>
      total + (authorizedCents - (amounts?.[session.id] ?? 0)),
    0,
  )

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

  const close = (): void => {
    setShow(false)
    flow.reset()
    methods.reset(defaultValues)
  }

  const format = (cents: number): string =>
    currencyCode == null ? "" : formatCentsToCurrency(cents, currencyCode)

  const modal = (
    <PaymentActionModal
      show={show}
      step={flow.step}
      copy={CAPTURE_COPY}
      detail={joinPaymentDetail(
        flow.amount ?? format(totalCents),
        rows.length === 1 ? rows[0]?.instrument : `${rows.length} payments`,
      )}
      errorDetail={flow.errorDetail}
      size="small"
      onClose={close}
    >
      <Modal.Header>Capture payment</Modal.Header>
      <HookedForm
        {...methods}
        onSubmit={async (values) => {
          await flow.run(values)
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
            Capturing {format(totalCents)} of {format(targetCents)} outstanding
          </Text>
          {uncapturedCents > 0 && (
            <Text tag="div" size="small" variant="info">
              {/*
                Nothing can release it: a partial capture moves the session to
                `partially_paid`, and voiding is only legal from `authorized`.
              */}
              {format(uncapturedCents)} will stay authorized until it expires
            </Text>
          )}
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
