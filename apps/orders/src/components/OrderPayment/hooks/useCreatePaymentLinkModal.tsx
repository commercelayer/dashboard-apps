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
import type { PaymentActionStep } from "#components/OrderPayment/hooks/usePaymentActionFlow"
import {
  LINK_COPY,
  PaymentActionModal,
} from "#components/OrderPayment/PaymentActionModal"
import {
  getLinkablePaymentSettings,
  getOrderPaymentTotals,
  requiresPaymentSession,
} from "#components/OrderPayment/paymentSessionUtils"

/** Placeholder `return_url` for the session behind a link, until core defaults it. */
const TEMPORARY_SESSION_RETURN_URL = "https://commercelayer.io"

interface Props {
  order: Order
  /** What open links already ask for; the default amount leaves it out. */
  requestedCents?: number
  onChange: () => void
}

interface CreatePaymentLinkModalHook {
  modal: React.JSX.Element
  open: () => void
}

/** Creates a payment link, with its session first for gateways that need one. */
export function useCreatePaymentLinkModal({
  order,
  requestedCents = 0,
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

  const toCollectCents = getOrderPaymentTotals(order).toCollectCents

  const defaultValues = {
    paymentSettingId: settings[0]?.id,
    // What the order is still short of and no open link asks for yet.
    amountCents: Math.max(0, toCollectCents - requestedCents),
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
  }

  const createLink = async (values: PaymentLinkFormValues): Promise<void> => {
    const setting = settings.find(({ id }) => id === values.paymentSettingId)
    if (setting == null) {
      return
    }

    setStep("running")

    /** Relationships take the base `payment_settings` type, not the STI one. */
    const settingRel = { id: setting.id, type: "payment_settings" } as const

    try {
      const paymentSession = requiresPaymentSession(setting)
        ? await sdkClient.payment_sessions.create({
            order: { id: order.id, type: "orders" },
            payment_setting: settingRel,
            amount_cents: values.amountCents,
            // Checkout.com will require `success_url` and `failure_url` here.
            client_data: {
              return_url: TEMPORARY_SESSION_RETURN_URL,
            },
          })
        : undefined

      const created = await sdkClient.payment_links.create({
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
      })

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
          await createLink(values)
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
                  text: [
                    `${formatCentsToCurrency(toCollectCents, currencyCode)} left to collect`,
                    requestedCents > 0
                      ? `${formatCentsToCurrency(requestedCents, currencyCode)} already requested`
                      : undefined,
                  ]
                    .filter((part) => part != null)
                    .join(", "),
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
