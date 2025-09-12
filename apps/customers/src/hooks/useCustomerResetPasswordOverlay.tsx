import { useCustomerDetails } from '#hooks/useCustomerDetails'
import {
  Button,
  CodeBlock,
  PageLayout,
  Spacer,
  toast,
  useCoreSdkProvider,
  useOverlay,
  useTokenProvider,
  useTranslation
} from '@commercelayer/app-elements'
import type { CustomerPasswordReset } from '@commercelayer/sdk'
import { isEmpty } from 'lodash-es'
import { useCallback, useState } from 'react'

interface OverlayHook {
  showResetPasswordOverlay: () => void
  ResetPasswordOverlay: React.FC
}

export function useCustomerResetPasswordOverlay(
  customerId: string
): OverlayHook {
  const { sdkClient } = useCoreSdkProvider()
  const {
    settings: { organizationSlug }
  } = useTokenProvider()
  const { t } = useTranslation()
  const [isCreating, setIsCreating] = useState(false)
  const [customerPasswordReset, setCustomerPasswordReset] =
    useState<CustomerPasswordReset | null>(null)

  const { Overlay, open, close } = useOverlay()
  const { customer, isLoading } = useCustomerDetails(customerId)

  const ResetPasswordOverlay = useCallback(() => {
    const resetLink =
      customerPasswordReset != null
        ? `https://${organizationSlug}.commercelayer.app/identity/reset-password?customerPasswordResetId=${customerPasswordReset.id}&resetPasswordToken=${customerPasswordReset.reset_password_token}`
        : null

    return (
      <Overlay backgroundColor='light'>
        <PageLayout
          title='Reset customer password'
          description="Generate a link to reset the customer's password."
          minHeight={false}
          navigationButton={{
            onClick: () => {
              close()
            },
            label: t('common.back'),
            icon: 'arrowLeft'
          }}
          isLoading={isLoading}
        >
          {resetLink != null && (
            <>
              <Spacer bottom='12'>
                <CodeBlock
                  showCopyAction
                  hint={{
                    text: 'Share this link with the customer to allow them to reset their password.'
                  }}
                >
                  {resetLink}
                </CodeBlock>
              </Spacer>
              <Button type='button' fullWidth onClick={close}>
                {t('common.close')}
              </Button>
            </>
          )}
          {customerPasswordReset == null && (
            <Button
              variant='primary'
              disabled={isCreating}
              type='button'
              onClick={() => {
                setIsCreating(true)
                void sdkClient.customer_password_resets
                  .create({
                    customer_email: customer.email,
                    reference_origin: 'dashboard'
                  })
                  .then((res) => {
                    if (isEmpty(res.reset_password_token)) {
                      throw new Error('Failed to create reset password link')
                    }
                    setCustomerPasswordReset(res)
                  })
                  .catch(() => {
                    toast('We could not generate a valid password reset link', {
                      type: 'error'
                    })
                  })
                  .finally(() => {
                    setIsCreating(false)
                  })
              }}
              fullWidth
            >
              Generate a password reset link
            </Button>
          )}
        </PageLayout>
      </Overlay>
    )
  }, [Overlay, customerPasswordReset, customer.email, isLoading, isCreating])

  return {
    showResetPasswordOverlay: open,
    ResetPasswordOverlay
  }
}
