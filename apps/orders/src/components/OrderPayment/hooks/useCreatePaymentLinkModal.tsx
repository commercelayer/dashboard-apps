import {
  Button,
  CopyToClipboard,
  type CurrencyCode,
  formatCentsToCurrency,
  HookedForm,
  HookedInput,
  HookedInputCurrency,
  HookedInputSelect,
  Modal,
  parseApiError,
  Spacer,
  useCoreSdkProvider,
} from "@commercelayer/app-elements"
import type { Order, PaymentLink } from "@commercelayer/sdk"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  type PaymentActionCopy,
  PaymentActionModal,
  type PaymentActionStep,
} from "#components/OrderPayment/PaymentActionModal"
import {
  getLinkablePaymentSettings,
  getOrderPaymentTotals,
  requiresPaymentSession,
} from "#components/OrderPayment/paymentSessionUtils"

/**
 * Required by core today, and about to stop being: the team confirmed the
 * mandatory `return_url` is a bug (2026-09-22). It is where the gateway sends
 * the customer once they have paid, so the placeholder is harmless in the
 * meantime. Remove the constant, and the attribute, once core makes it
 * optional.
 */
const TEMPORARY_RETURN_URL = "https://example.com"

const LINK_COPY: PaymentActionCopy = {
  running: "Creating payment link…",
  success: "Payment link created",
  pending: "Payment link still processing",
  error: "Could not create the payment link",
}

interface Props {
  order: Order
  onChange: () => void
}

interface CreatePaymentLinkModalHook {
  modal: React.JSX.Element
  open: () => void
}

/**
 * "Request a payment" as a link the customer can open and pay.
 *
 * Two gateway shapes hide behind one form. Adyen and Checkout.com build their
 * link request from a session token, so the session is created first and the
 * link points at it; Stripe creates its own session from the completed
 * checkout session, so the link goes out alone and the session appears only
 * once the customer has paid. Either way what the operator gets back is a URL.
 */
export function useCreatePaymentLinkModal({
  order,
  onChange,
}: Props): CreatePaymentLinkModalHook {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState<PaymentActionStep>("confirm")
  const [link, setLink] = useState<PaymentLink>()
  const [errorDetail, setErrorDetail] = useState<string>()
  const { sdkClient } = useCoreSdkProvider()

  const settings = getLinkablePaymentSettings(order)
  const currencyCode = order.currency_code as
    | Uppercase<CurrencyCode>
    | undefined

  const defaultValues = {
    paymentSettingId: settings[0]?.id,
    // What the order is still short of, which is what a link is for.
    amountCents: getOrderPaymentTotals(order).toCollectCents,
  }

  const methods = useForm<PaymentLinkFormValues>({
    defaultValues,
    resolver: zodResolver(formSchema),
  })

  const close = (): void => {
    setShow(false)
    setStep("confirm")
    setLink(undefined)
    setErrorDetail(undefined)
    methods.reset(defaultValues)
  }

  const create = async (values: PaymentLinkFormValues): Promise<void> => {
    const setting = settings.find(({ id }) => id === values.paymentSettingId)
    if (setting == null) {
      return
    }

    setStep("running")

    // The base type, not the setting's own `payment_setting_stripes` and
    // friends: core refuses an STI type in a relationship ("not a valid type
    // for this operation").
    const settingRel = { id: setting.id, type: "payment_settings" } as const

    try {
      const paymentSession = requiresPaymentSession(setting)
        ? await sdkClient.payment_sessions.create({
            order: { id: order.id, type: "orders" },
            payment_setting: settingRel,
            amount_cents: values.amountCents,
            // The gateways that need a session up front also need to know
            // where to send the customer back from it, and they read it here
            // rather than from the link: Adyen as `returnUrl`
            // (`payload/adyen/session/base.rb`), Checkout.com as
            // `success_url`. Same placeholder, same reason, same removal.
            client_data: {
              return_url: TEMPORARY_RETURN_URL,
              success_url: TEMPORARY_RETURN_URL,
            },
          })
        : undefined

      const created = await sdkClient.payment_links.create({
        return_url: TEMPORARY_RETURN_URL,
        order: { id: order.id, type: "orders" },
        payment_setting: settingRel,
        amount_cents: values.amountCents,
        name: values.name,
        ...(paymentSession == null
          ? {}
          : {
              payment_session: {
                id: paymentSession.id,
                type: "payment_sessions",
              },
            }),
        // `url` is typed as required and `amount_cents`, `name` and
        // `payment_session` are missing entirely: the pinned SDK build predates
        // both core changes. Sending `url` would be wrong anyway, since core
        // keeps whatever it is given (`self.url ||= url`) and would discard the
        // gateway's own hosted page. Drop the cast when the pin is bumped.
      } as unknown as Parameters<typeof sdkClient.payment_links.create>[0])

      setLink(created)
      setStep("success")
    } catch (error) {
      setErrorDetail(parseApiError(error)[0]?.detail)
      setStep("error")
    } finally {
      onChange()
    }
  }

  const modal = (
    <PaymentActionModal
      show={show}
      step={step}
      copy={LINK_COPY}
      detail={
        link == null ? null : (
          <Spacer top="2">
            <CopyToClipboard value={link.url} />
          </Spacer>
        )
      }
      errorDetail={errorDetail}
      size="small"
      onClose={close}
    >
      <Modal.Header>New payment link</Modal.Header>
      <HookedForm
        {...methods}
        onSubmit={async (values) => {
          await create(values)
        }}
      >
        <Modal.Body>
          <Spacer bottom="8">
            <HookedInputSelect
              name="paymentSettingId"
              label="Payment method"
              initialValues={settings.map((setting) => ({
                value: setting.id,
                label: setting.name ?? setting.type,
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
                hint={{
                  text: `${formatCentsToCurrency(
                    getOrderPaymentTotals(order).toCollectCents,
                    currencyCode,
                  )} left to collect`,
                }}
              />
            </Spacer>
          )}

          <HookedInput
            name="name"
            label="Description (optional)"
            hint={{ text: "Shown to the customer on the payment page." }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            fullWidth
            type="submit"
            disabled={
              methods.watch("paymentSettingId") == null ||
              (methods.watch("amountCents") ?? 0) <= 0 ||
              methods.formState.isSubmitting
            }
          >
            Create link
          </Button>
        </Modal.Footer>
      </HookedForm>
    </PaymentActionModal>
  )

  return {
    modal,
    open: () => {
      methods.reset(defaultValues)
      setShow(true)
    },
  }
}

const formSchema = z.object({
  paymentSettingId: z.string({ required_error: "Required field" }),
  amountCents: z
    .number({
      required_error: "Required field",
      invalid_type_error: "Please enter a valid amount",
    })
    .positive("Please enter an amount greater than zero"),
  name: z.string().optional(),
})

type PaymentLinkFormValues = z.infer<typeof formSchema>
