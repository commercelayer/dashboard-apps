/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import {
  SubscriptionForm,
  type SubscriptionFormValues
} from '#components/SubscriptionForm'
import { appRoutes } from '#data/routes'
import { useSubscriptionDetails } from '#hooks/useSubscriptionDetails'
import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  useCoreSdkProvider,
  useTokenProvider
} from '@commercelayer/app-elements'
import {
  type OrderSubscription,
  type OrderSubscriptionUpdate
} from '@commercelayer/sdk'
import { useState } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export function SubscriptionEdit(): JSX.Element {
  const { canUser } = useTokenProvider()
  const { sdkClient } = useCoreSdkProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ subscriptionId: string }>(appRoutes.edit.path)
  const subscriptionId = params?.subscriptionId ?? ''

  const { subscription, isLoading, mutateSubscription } =
    useSubscriptionDetails(subscriptionId)
  const [apiError, setApiError] = useState<any>()
  const [isSaving, setIsSaving] = useState(false)

  const goBackUrl =
    subscriptionId != null
      ? appRoutes.details.makePath({ subscriptionId })
      : appRoutes.list.makePath({})

  if (!canUser('update', 'order_subscriptions')) {
    return (
      <PageLayout
        title='Edit subscription'
        navigationButton={{
          onClick: () => {
            setLocation(goBackUrl)
          },
          label: 'Cancel',
          icon: 'x'
        }}
        scrollToTop
        overlay
      >
        <EmptyState
          title='Not found'
          description='Subscription is invalid or you are not authorized to access this page.'
          action={
            <Link href={goBackUrl}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={
        <SkeletonTemplate isLoading={isLoading}>
          Edit subscription
        </SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          setLocation(goBackUrl)
        },
        label: 'Cancel',
        icon: 'x'
      }}
      scrollToTop
      overlay
    >
      <Spacer bottom='14'>
        {!isLoading && subscription != null ? (
          <SubscriptionForm
            defaultValues={adaptSubscriptionToFormValues(subscription)}
            apiError={apiError}
            isSubmitting={isSaving}
            onSubmit={(formValues) => {
              setIsSaving(true)
              void sdkClient.order_subscriptions
                .update(
                  adaptFormValuesToSubscription(formValues) as OrderSubscription
                )
                .then(() => {
                  void mutateSubscription().then(() => {
                    setLocation(goBackUrl)
                  })
                })
                .catch((error) => {
                  setApiError(error)
                  setIsSaving(false)
                })
            }}
          />
        ) : null}
      </Spacer>
    </PageLayout>
  )
}

function adaptSubscriptionToFormValues(
  subscription?: OrderSubscription
): SubscriptionFormValues {
  return {
    id: subscription?.id ?? '',
    frequency: subscription?.frequency ?? '',
    nextRunAt: new Date(subscription?.next_run_at ?? '')
  }
}

function adaptFormValuesToSubscription(
  formValues: SubscriptionFormValues
): OrderSubscriptionUpdate {
  return {
    id: formValues.id ?? '',
    frequency: formValues.frequency,
    next_run_at: formValues.nextRunAt.toJSON()
  }
}
