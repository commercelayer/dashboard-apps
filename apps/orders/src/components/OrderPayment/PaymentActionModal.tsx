import {
  Button,
  type ButtonProps,
  Icon,
  type IconProps,
  Modal,
  type ModalProps,
  RadialProgress,
  Spacer,
  StatusIcon,
  type StatusIconProps,
  Text,
} from "@commercelayer/app-elements"
import type {
  PaymentActionOutcome,
  PaymentActionStep,
} from "#components/OrderPayment/hooks/usePaymentActionFlow"

export interface PaymentActionCopy {
  /** Shown while waiting, e.g. "Capturing payment…". */
  running: string
  /** Shown on a settled action, e.g. "Payment captured". */
  success: string
  /** Shown when the gateway has not settled in time, e.g. "Capture still processing". */
  pending: string
  /** Shown when the action was refused, e.g. "Capture failed". */
  error: string
}

/**
 * Joins the amount and the instrument for the result step, dropping whatever
 * is missing so the separator never dangles.
 */
export function joinPaymentDetail(
  ...parts: Array<string | undefined | null>
): string {
  return parts.filter((part) => part != null && part !== "").join(" · ")
}

/** One payment the action touches: what it takes, and where from. */
export interface PaymentBreakdownLine {
  key: string
  /** Formatted amount. Omitted where the context already states it. */
  amount?: string
  instrument: string
}

/**
 * The payments an action acts on, one line each. Used by both the confirm and
 * the result step.
 */
export function PaymentBreakdown({
  lines,
}: {
  lines: PaymentBreakdownLine[]
}): React.JSX.Element {
  return (
    <>
      {lines.map(({ key, amount, instrument }) => (
        <Text key={key} variant="info" size="small" tag="div">
          {joinPaymentDetail(amount, instrument)}
        </Text>
      ))}
    </>
  )
}

export const CAPTURE_COPY: PaymentActionCopy = {
  running: "Capturing payment…",
  success: "Payment captured",
  pending: "Capture still processing",
  error: "Capture failed",
}

export const VOID_COPY: PaymentActionCopy = {
  running: "Voiding authorization…",
  success: "Authorization voided",
  pending: "Void still processing",
  error: "Void failed",
}

export const REFUND_COPY: PaymentActionCopy = {
  running: "Refunding payment…",
  success: "Payment refunded",
  pending: "Refund still processing",
  error: "Refund failed",
}

export const LINK_COPY: PaymentActionCopy = {
  running: "Creating payment link…",
  success: "Payment link created",
  pending: "Payment link still processing",
  error: "Could not create the payment link",
}

interface Props {
  show: boolean
  step: PaymentActionStep
  copy: PaymentActionCopy
  /** Result line, e.g. `$64.00 · Mastercard ··4242`, or a `PaymentBreakdown`. */
  detail: React.ReactNode
  /** Reason from the API, when it gave one. Falls back to generic copy. */
  errorDetail?: string
  /** Width of the confirm step. The result steps are always narrow. */
  size?: Extract<ModalProps["size"], "small" | "x-small">
  onClose: () => void
  children: React.ReactNode
}

/**
 * Modal for a payment action: the caller's confirm step, then running, then
 * the outcome. Stays open until the gateway answers.
 */
export function PaymentActionModal({
  show,
  step,
  copy,
  detail,
  errorDetail,
  size = "x-small",
  onClose,
  children,
}: Props) {
  return (
    <Modal
      show={show}
      onClose={onClose}
      size={step === "confirm" ? size : "x-small"}
      // Not dismissible while the request is in flight: closing mid-way would
      // leave the outcome unreported.
      dismissible={step === "confirm"}
      ariaLabel={step === "confirm" ? undefined : copy[step]}
    >
      {step === "confirm" ? (
        children
      ) : (
        <Modal.Body>
          <Spacer top="4" bottom="6">
            {step === "running" ? (
              <RadialProgress
                percentage="indeterminate"
                align="center"
                size="large"
              />
            ) : (
              <StatusIcon
                name={OUTCOME_ICONS[step].name}
                background={OUTCOME_ICONS[step].background}
                gap="large"
                align="center"
              />
            )}
          </Spacer>
          <Text weight="semibold" align="center" tag="div">
            {copy[step]}
          </Text>
          <Spacer top="1">
            <Text align="center" variant="info" size="small" tag="div">
              {getDetail({ step, detail, errorDetail })}
            </Text>
          </Spacer>
        </Modal.Body>
      )}
      {step !== "confirm" && step !== "running" && (
        <Modal.Footer>
          <Button type="button" fullWidth variant="secondary" onClick={onClose}>
            Close
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  )
}

/**
 * The confirm step for capture and void, which are a question plus one
 * action. Refund passes its form instead.
 */
export function PaymentActionConfirm({
  icon,
  title,
  description,
  confirmLabel,
  confirmVariant = "primary",
  onConfirm,
  onCancel,
}: {
  icon: IconProps["name"]
  title: string
  /** A plain string is wrapped in muted small text; a node is rendered as is. */
  description: React.ReactNode
  confirmLabel: string
  confirmVariant?: Extract<ButtonProps["variant"], "primary" | "danger">
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <>
      <Modal.Body>
        <div className="flex flex-col items-center text-center">
          <Icon name={icon} size={32} className="mt-3.5 mb-4 text-gray-400" />
          <Text weight="medium" className="text-balance">
            {title}
          </Text>
          {/* Same gap as under the result step's title. */}
          <Spacer top="1">
            {typeof description === "string" ? (
              <Text variant="info" size="small">
                {description}
              </Text>
            ) : (
              description
            )}
          </Spacer>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          type="button"
          fullWidth
          variant={confirmVariant}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
        <Button type="button" fullWidth variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </Modal.Footer>
    </>
  )
}

function getDetail({
  step,
  detail,
  errorDetail,
}: Pick<Props, "step" | "detail" | "errorDetail">): React.ReactNode {
  switch (step) {
    case "running":
      return "This may take a few moments."
    case "pending":
      return "The payment is taking longer than expected. It may complete later."
    case "error":
      return errorDetail ?? "Please try again."
    default:
      return detail
  }
}

const OUTCOME_ICONS = {
  success: { name: "check", background: "green" },
  pending: { name: "hourglass", background: "orange" },
  error: { name: "x", background: "red" },
} as const satisfies Record<
  PaymentActionOutcome,
  { name: IconProps["name"]; background: StatusIconProps["background"] }
>
