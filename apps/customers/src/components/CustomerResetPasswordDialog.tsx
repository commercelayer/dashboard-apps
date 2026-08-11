import {
  Alert,
  Button,
  CodeBlock,
  Modal,
  Spacer,
  Text,
  toast,
  useCoreSdkProvider,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements"
import type { CustomerPasswordReset } from "@commercelayer/sdk"
import { isEmpty } from "lodash-es"
import { useState } from "react"

interface Props {
  customerEmail: string
  show: boolean
  onClose: () => void
}

/**
 * Two-step dialog: it generates a password reset link, then shows it for
 * copying. Not a `useConfirmDialog`, which closes as soon as its action
 * resolves and so has nowhere to put the resulting link.
 */
export function CustomerResetPasswordDialog({
  customerEmail,
  show,
  onClose,
}: Props): React.JSX.Element {
  const { sdkClient } = useCoreSdkProvider()
  const { settings } = useTokenProvider()
  const { t } = useTranslation()

  const organizationSlug = settings.organizationSlug
  const clientId = settings.extras?.salesChannels?.at(0)?.client_id

  const [isCreating, setIsCreating] = useState(false)
  const [customerPasswordReset, setCustomerPasswordReset] =
    useState<CustomerPasswordReset | null>(null)

  const resetLink =
    customerPasswordReset != null
      ? [
          `https://${organizationSlug}.commercelayer.app/identity/reset-password?clientId=${clientId}`,
          `customerPasswordResetId=${customerPasswordReset.id}`,
          `resetPasswordToken=${customerPasswordReset.reset_password_token}`,
          "scope=market:all",
          "returnUrl=none",
        ].join("&")
      : null

  const generateLink = async (): Promise<void> => {
    setIsCreating(true)
    try {
      const created = await sdkClient.customer_password_resets.create({
        customer_email: customerEmail,
        reference_origin: "dashboard",
      })
      if (isEmpty(created.reset_password_token)) {
        throw new Error("Failed to create reset password link")
      }
      setCustomerPasswordReset(created)
    } catch {
      toast("We could not generate a valid password reset link", {
        type: "error",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Modal show={show} onClose={onClose} size="small">
      <Modal.Header>Reset customer password</Modal.Header>
      <Modal.Body>
        {resetLink != null ? (
          <CodeBlock
            showCopyAction
            hint={{
              text: "Share this link with the customer to allow them to reset their password.",
            }}
          >
            {resetLink}
          </CodeBlock>
        ) : (
          <>
            <Text variant="info" size="small">
              Generate a link to reset the customer's password.
            </Text>
            {clientId == null && (
              <Spacer top="4">
                <Alert status="warning">
                  To generate a reset password link, check that this
                  organization has at least one valid sales channel configured
                  (API credentials).
                </Alert>
              </Spacer>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {resetLink != null ? (
          <Button variant="primary" onClick={onClose} fullWidth>
            {t("common.close")}
          </Button>
        ) : (
          <>
            <Button
              variant="primary"
              disabled={isCreating || clientId == null}
              onClick={() => {
                void generateLink()
              }}
              fullWidth
            >
              Generate
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isCreating}
              fullWidth
            >
              {t("common.cancel")}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  )
}
