import { useCustomerDetails } from '#hooks/useCustomerDetails'
import {
  Alert,
  Button,
  formatDate,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { Customer } from '@commercelayer/sdk'
import { useState } from 'react'

interface Props {
  customerId: Customer['id']
}

export const CustomerAnonymization = withSkeletonTemplate<Props>(
  ({ customerId }): React.JSX.Element => {
    const { user } = useTokenProvider()
    const { sdkClient } = useCoreSdkProvider()
    const { customer, mutateCustomer } = useCustomerDetails(customerId)
    const { t } = useTranslation()
    const [isCanceling, setIsCanceling] = useState<boolean>()
    const anonymizationInfoVisibleStatuses = [
      'requested',
      'in_progress',
      'completed'
    ]

    // @ts-expect-error sdk types are not up to date
    const anonymizationInfo = customer.anonymization_info
    const anonymizationInfoStatus = anonymizationInfo?.status as string
    const showAnonymizationInfo =
      anonymizationInfo != null &&
      'status' in anonymizationInfo &&
      anonymizationInfoVisibleStatuses.includes(anonymizationInfoStatus)

    if (!showAnonymizationInfo) return <></>

    const anonymizationRequestedBy = `${anonymizationInfo?.requester?.first_name} ${anonymizationInfo?.requester?.last_name}`
    const anonymizationRequestedAt = formatDate({
      isoDate: anonymizationInfo?.requested_at,
      format: 'full',
      timezone: user?.timezone,
      showCurrentYear: true
    })
    const anonymizationCompletedAt = formatDate({
      isoDate: anonymizationInfo?.completed_at,
      format: 'full',
      timezone: user?.timezone,
      showCurrentYear: true
    })
    let anonymizationAlertText = ''
    switch (anonymizationInfoStatus) {
      case 'requested':
        anonymizationAlertText = t(
          'apps.customers.anonymization_info.alert_requested',
          {
            requestedby: anonymizationRequestedBy,
            requestedat: anonymizationRequestedAt
          }
        )
        break
      case 'in_progress':
        anonymizationAlertText = t(
          'apps.customers.anonymization_info.alert_in_progress',
          {
            requestedby: anonymizationRequestedBy,
            requestedat: anonymizationRequestedAt
          }
        )
        break
      case 'completed':
        anonymizationAlertText = t(
          'apps.customers.anonymization_info.alert_completed',
          {
            requestedby: anonymizationRequestedBy,
            requestedat: anonymizationRequestedAt,
            completedat: anonymizationCompletedAt
          }
        )
        break
    }

    return (
      <Spacer top='14'>
        <Alert status='info'>
          {anonymizationAlertText}
          {anonymizationInfoStatus === 'requested' && (
            <Spacer top='4'>
              <Button
                size='small'
                disabled={isCanceling}
                onClick={(e) => {
                  setIsCanceling(true)
                  e.stopPropagation()
                  void sdkClient.customers
                    .update({
                      id: customer.id,
                      // @ts-expect-error sdk types are not up to date
                      _cancel_anonymization: true
                    })
                    .then(() => {
                      setIsCanceling(false)
                      void mutateCustomer()
                    })
                    .catch(() => {})
                }}
                fullWidth
              >
                {t('apps.customers.anonymization_info.cancel_button')}
              </Button>
            </Spacer>
          )}
        </Alert>
      </Spacer>
    )
  }
)
