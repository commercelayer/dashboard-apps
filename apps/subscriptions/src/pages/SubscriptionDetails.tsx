import { SubscriptionAddresses } from '#components/SubscriptionAddresses'
import { SubscriptionInfo } from '#components/SubscriptionInfo'
import { SubscriptionItems } from '#components/SubscriptionItems'
import { SubscriptionPayment } from '#components/SubscriptionPayment'
import { SubscriptionSteps } from '#components/SubscriptionSteps'
import { appRoutes } from '#data/routes'
import { useSubscriptionDetails } from '#hooks/useSubscriptionDetails'
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
  useTokenProvider
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

  const { subscription, isLoading, error, mutateSubscription } =
    useSubscriptionDetails(subscriptionId)
  const toolbar = undefined // TODO: Setup toolbar

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

  return (
    <PageLayout
      mode={mode}
      toolbar={toolbar}
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
          {/* <Spacer top='14'>
            <OrderPayment order={order} />
          </Spacer>
          <Spacer top='14'>
            <OrderAddresses order={order} />
          </Spacer> */}
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
