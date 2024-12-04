import { OrderAddresses } from '#components/OrderAddresses'
import { OrderCustomer } from '#components/OrderCustomer'
import { OrderPayment } from '#components/OrderPayment'
import { OrderReturns } from '#components/OrderReturns'
import { OrderShipments } from '#components/OrderShipments'
import { OrderSteps } from '#components/OrderSteps'
import { OrderSummary } from '#components/OrderSummary'
import { useOrderStatus } from '#components/OrderSummary/hooks/useOrderStatus'
import { Timeline } from '#components/Timeline'
import { appRoutes } from '#data/routes'
import { useOrderDetails } from '#hooks/useOrderDetails'
import { useOrderReturns } from '#hooks/useOrderReturns'
import { useOrderToolbar } from '#hooks/useOrderToolbar'
import { isMockedId } from '#mocks'
import { getOrderTitle } from '#utils/getOrderTitle'
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
  useAppLinking,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { ToolbarItem } from '@commercelayer/app-elements/dist/ui/composite/Toolbar'
import { useLocation, useRoute } from 'wouter'

function OrderDetails(): JSX.Element {
  const {
    canUser,
    settings: { mode, extras },
    user
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ orderId: string }>(appRoutes.details.path)

  const orderId = params?.orderId ?? ''

  const { order, isLoading, error, mutateOrder } = useOrderDetails(orderId)
  const { isPendingWithTransactions } = useOrderStatus(order)
  const { returns, isLoadingReturns } = useOrderReturns(orderId)
  const toolbar = useOrderToolbar({ order })

  const { goBack } = useAppLinking()

  if (canUser('update', 'orders')) {
    if (
      order.status === 'pending' &&
      !isPendingWithTransactions &&
      extras?.salesChannels != null &&
      extras?.salesChannels.length > 0
    ) {
      const checkoutLinkButton: ToolbarItem = {
        label: 'Checkout',
        icon: 'lightning',
        size: 'small',
        variant: 'secondary',
        onClick: () => {
          setLocation(appRoutes.linkDetails.makePath({ orderId }))
        }
      }

      if (toolbar.buttons != null) {
        toolbar.buttons.push(checkoutLinkButton)
      } else {
        toolbar.buttons = [checkoutLinkButton]
      }
    }
  }

  if (orderId === undefined || !canUser('read', 'orders') || error != null) {
    return (
      <PageLayout
        title='Orders'
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.home.makePath({}))
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
                setLocation(appRoutes.home.makePath({}))
              }}
            >
              Go back
            </Button>
          }
        />
      </PageLayout>
    )
  }

  const pageTitle = getOrderTitle(order)

  return (
    <PageLayout
      mode={mode}
      toolbar={toolbar}
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      description={
        <SkeletonTemplate isLoading={isLoading}>
          {order.placed_at != null ? (
            <div>
              {formatDateWithPredicate({
                predicate: 'Placed',
                isoDate: order.placed_at ?? '',
                timezone: user?.timezone
              })}
            </div>
          ) : order.updated_at != null ? (
            <div>
              {formatDateWithPredicate({
                predicate: 'Updated',
                isoDate: order.updated_at ?? '',
                timezone: user?.timezone
              })}
            </div>
          ) : null}
          {order.reference != null && <div>Ref. {order.reference}</div>}
        </SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          goBack({
            defaultRelativePath: appRoutes.list.makePath({}),
            currentResourceId: orderId
          })
        },
        label: 'Back',
        icon: 'arrowLeft'
      }}
      gap='only-top'
      scrollToTop
    >
      <SkeletonTemplate isLoading={isLoading}>
        <Spacer bottom='4'>
          <Spacer top='14'>
            <OrderSteps order={order} />
          </Spacer>
          <Spacer top='14'>
            <OrderSummary order={order} />
          </Spacer>
          <Spacer top='14'>
            <OrderCustomer order={order} />
          </Spacer>
          <Spacer top='14'>
            <OrderPayment order={order} />
          </Spacer>
          <Spacer top='14'>
            <OrderAddresses order={order} />
          </Spacer>
          <Spacer top='14'>
            <OrderShipments order={order} />
          </Spacer>
          {!isLoadingReturns && (
            <Spacer top='14'>
              <OrderReturns returns={returns} />
            </Spacer>
          )}
          <Spacer top='14'>
            <ResourceDetails
              resource={order}
              onUpdated={async () => {
                void mutateOrder()
              }}
            />
          </Spacer>
          {!isMockedId(order.id) && (
            <>
              <Spacer top='14'>
                <ResourceTags
                  resourceType='orders'
                  resourceId={order.id}
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
                  resourceType='orders'
                  resourceId={order.id}
                  overlay={{
                    title: pageTitle
                  }}
                />
              </Spacer>
            </>
          )}
          {!['draft'].includes(order.status) && (
            <Spacer top='14'>
              <Timeline order={order} />
            </Spacer>
          )}
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default OrderDetails
