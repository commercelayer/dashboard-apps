import {
  Button,
  Icon,
  type IconProps,
  Modal,
  RadialProgress,
  Spacer,
  StatusIcon,
  Text,
} from "@commercelayer/app-elements"
import type { PaymentActionOutcome } from "#components/OrderPayment/hooks/usePaymentActionFlow"

/**
 * `confirm` is the caller's own first step (a dialog body for capture and
 * void, the form for refund). Every step after it is shared, since the three
 * actions differ only in wording.
 */
export type PaymentActionStep = "confirm" | "running" | PaymentActionOutcome

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

interface Props {
  show: boolean
  step: PaymentActionStep
  copy: PaymentActionCopy
  /** Amount and instrument, e.g. "$64.00 · Mastercard ··4242". */
  detail: string
  /** Reason from the API, when it gave one. Falls back to generic copy. */
  errorDetail?: string
  /** Width of the confirm step. The result steps are always narrow. */
  size?: "small" | "x-small"
  onClose: () => void
  children: React.ReactNode
}

/**
 * Payment actions are asynchronous: the API accepts the request and a worker
 * talks to the gateway, so the modal stays open and reports what actually
 * happened instead of closing on a claim it cannot make yet.
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
              // Same pending/outcome pair the coupon generator uses, so the
              // two flows read identically.
              <RadialProgress align="center" />
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
          <Button fullWidth variant="secondary" onClick={onClose}>
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
  description: string
  confirmLabel: string
  confirmVariant?: "primary" | "danger"
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <>
      {/* Mirrors app-elements' own `useConfirmDialog` markup, which is what
          the design was drawn from. */}
      <Modal.Body>
        <div className="flex flex-col items-center text-center">
          <Icon name={icon} size={32} className="mt-3.5 mb-4 text-gray-400" />
          <Text weight="medium" className="text-balance">
            {title}
          </Text>
          <Text variant="info" size="small">
            {description}
          </Text>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button fullWidth variant={confirmVariant} onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button fullWidth variant="secondary" onClick={onCancel}>
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
}: Pick<Props, "step" | "detail" | "errorDetail">): string {
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
  { name: IconProps["name"]; background: "green" | "orange" | "red" }
>
