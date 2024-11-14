import { SubscriptionAddresses } from '#components/SubscriptionAddresses'
import { SubscriptionInfo } from '#components/SubscriptionInfo'
import { SubscriptionItems } from '#components/SubscriptionItems'
import { SubscriptionOrders } from '#components/SubscriptionOrders'
import { SubscriptionPayment } from '#components/SubscriptionPayment'
import { SubscriptionSteps } from '#components/SubscriptionSteps'
import {
  getOrderSubscriptionTriggerAction,
  getOrderSubscriptionTriggerActionName
} from '#data/dictionaries'
import { appRoutes } from '#data/routes'
import { useSubscriptionDetails } from '#hooks/useSubscriptionDetails'
import { useTriggerAttribute } from '#hooks/useTriggerAttribute'
import { isMockedId } from '#mocks'
import { getSubscriptionTitle } from '#utils/getSubscriptionTitle'
import {
  Button,
  EmptyState,
  PageLayout,
  ResourceDetails,
  ResourceMetadata,
  ResourceTags,
  SkeletonTemplate,
  Spacer,
  formatDateWithPredicate,
  goBack,
  useTokenProvider,
  type PageHeadingProps
} from '@commercelayer/app-elements'
import { useLocation, useRoute } from 'wouter'

function SubscriptionDetails(): JSX.Element {
  const {
    canUser,
    settings: { mode },
    user
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ subscriptionId: string }>(
    appRoutes.details.path
  )

  const subscriptionId = params?.subscriptionId ?? ''
  const { dispatch } = useTriggerAttribute(subscriptionId)

  const { subscription, isLoading, error, mutateSubscription } =
    useSubscriptionDetails(subscriptionId)

  if (
    subscriptionId === undefined ||
    !canUser('read', 'order_subscriptions') ||
    error != null
  ) {
    return (
      <PageLayout
        title='Subriptions'
        navigationButton={{
          onClick: () => {
            goBack({
              setLocation,
              defaultRelativePath: appRoutes.list.makePath({})
            })
          },
          label: 'Back',
          icon: 'arrowLeft'
        }}
        mode={mode}
        scrollToTop
      >
        <EmptyState
          title='Not authorized'
          action={
            <Button
              variant='primary'
              onClick={() => {
                goBack({
                  setLocation,
                  defaultRelativePath: appRoutes.list.makePath({})
                })
              }}
            >
              Go back
            </Button>
          }
        />
      </PageLayout>
    )
  }

  const pageTitle = getSubscriptionTitle(subscription)

  const pageToolbar: PageHeadingProps['toolbar'] = canUser(
    'update',
    'order_subscriptions'
  )
    ? {
        buttons: [],
        dropdownItems: []
      }
    : undefined

  if (
    canUser('update', 'order_subscriptions') &&
    subscription.status !== 'cancelled'
  ) {
    const triggerAction = getOrderSubscriptionTriggerAction(subscription)
    const showMainAction =
      subscription.status === 'active' || subscription.status === 'inactive'

    if (showMainAction) {
      pageToolbar?.buttons?.push({
        label:
          triggerAction?.triggerAttribute != null
            ? getOrderSubscriptionTriggerActionName(
                triggerAction?.triggerAttribute
              )
            : '',
        size: 'small',
        variant: 'primary',
        onClick: () => {
          if (triggerAction != null) {
            void dispatch(triggerAction.triggerAttribute)
          }
        }
      })
    }
    pageToolbar?.dropdownItems?.push([
      {
        label: 'Edit',
        onClick: () => {
          setLocation(appRoutes.edit.makePath({ subscriptionId }))
        }
      }
    ])
    pageToolbar?.dropdownItems?.push([
      {
        label: 'Cancel subscription',
        onClick: () => {
          void dispatch('_cancel')
        }
      }
    ])
  }

  return (
    <PageLayout
      mode={mode}
      toolbar={pageToolbar}
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      description={
        <SkeletonTemplate isLoading={isLoading}>
          <div>
            {formatDateWithPredicate({
              predicate: 'Updated',
              isoDate: subscription.updated_at ?? '',
              timezone: user?.timezone
            })}
          </div>
        </SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          goBack({
            setLocation,
            defaultRelativePath: appRoutes.list.makePath({})
          })
        },
        label: 'Subscriptions',
        icon: 'arrowLeft'
      }}
      gap='only-top'
      scrollToTop
    >
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer bottom='4'>
          <Spacer top='14'>
            <SubscriptionSteps subscription={subscription} />
          </Spacer>
          <Spacer top='14'>
            <SubscriptionInfo subscription={subscription} />
          </Spacer>
          <Spacer top='14'>
            <SubscriptionItems subscriptionId={subscription.id} />
          </Spacer>
          <Spacer top='14'>
            <SubscriptionAddresses subscription={subscription} />
          </Spacer>
          <Spacer top='14'>
            <SubscriptionPayment subscription={subscription} />
          </Spacer>
          <Spacer top='14'>
            <SubscriptionOrders subscription={subscription} />
          </Spacer>
          <Spacer top='14'>
            <ResourceDetails
              resource={subscription}
              onUpdated={async () => {
                void mutateSubscription()
              }}
            />
          </Spacer>
          {!isMockedId(subscription.id) && (
            <>
              <Spacer top='14'>
                <ResourceTags
                  resourceType='order_subscriptions'
                  resourceId={subscription.id}
                  overlay={{ title: pageTitle }}
                  onTagClick={(tagId) => {
                    setLocation(
                      appRoutes.list.makePath({}, `tags_id_in=${tagId}`)
                    )
                  }}
                />
              </Spacer>
              <Spacer top='14'>
                <ResourceMetadata
                  resourceType='order_subscriptions'
                  resourceId={subscription.id}
                  overlay={{
                    title: pageTitle
                  }}
                />
              </Spacer>
            </>
          )}
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default SubscriptionDetails
