import { OrderAddresses } from '#components/OrderAddresses'
import { OrderCustomer } from '#components/OrderCustomer'
import { OrderPayment } from '#components/OrderPayment'
import { OrderReturns } from '#components/OrderReturns'
import { OrderShipments } from '#components/OrderShipments'
import { OrderSteps } from '#components/OrderSteps'
import { OrderSummary } from '#components/OrderSummary'
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
  ResourceMetadata,
  ResourceTags,
  SkeletonTemplate,
  Spacer,
  formatDateWithPredicate,
  goBack,
  useEditMetadataOverlay,
  useTokenProvider,
  type DropdownItemProps
} from '@commercelayer/app-elements'
import { useLocation, useRoute } from 'wouter'

function OrderDetails(): JSX.Element {
  const {
    canUser,
    settings: { mode },
    user
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ orderId: string }>(appRoutes.details.path)

  const orderId = params?.orderId ?? ''

  const { order, isLoading, error } = useOrderDetails(orderId)
  const { returns, isLoadingReturns } = useOrderReturns(orderId)
  const toolbar = useOrderToolbar({ order })
  const { Overlay: EditMetadataOverlay, show: showEditMetadataOverlay } =
    useEditMetadataOverlay()
  if (canUser('update', 'orders')) {
    const setMetadataDropDownItem: DropdownItemProps = {
      label: 'Set metadata',
      onClick: () => {
        showEditMetadataOverlay()
      }
    }
    if (toolbar.dropdownItems != null) {
      toolbar.dropdownItems[toolbar.dropdownItems.length - 1]?.push(
        setMetadataDropDownItem
      )
    } else {
      toolbar.dropdownItems = [[setMetadataDropDownItem]]
    }
  }

  if (orderId === undefined || !canUser('read', 'orders') || error != null) {
    return (
      <PageLayout
        title='Orders'
        navigationButton={{
          onClick: () => {
            goBack({
              setLocation,
              defaultRelativePath: appRoutes.home.makePath({})
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
                  defaultRelativePath: appRoutes.home.makePath({})
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
                isoDate: order.placed_at ?? '',
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
            setLocation,
            defaultRelativePath: appRoutes.home.makePath({})
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
          {!isMockedId(order.id) && (
            <Spacer top='6'>
              <ResourceTags
                resourceType='orders'
                resourceId={order.id}
                overlay={{ title: 'Edit tags', description: pageTitle }}
                onTagClick={(tagId) => {
                  setLocation(
                    appRoutes.list.makePath({}, `tags_id_in=${tagId}`)
                  )
                }}
              />
            </Spacer>
          )}
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
          {!isMockedId(order.id) && (
            <Spacer top='14'>
              <ResourceMetadata
                resourceType='orders'
                resourceId={order.id}
                overlay={{
                  title: pageTitle
                }}
                mode='simple'
              />
            </Spacer>
          )}
          {!['pending', 'draft'].includes(order.status) && (
            <Spacer top='14'>
              <Timeline order={order} />
            </Spacer>
          )}
          {!isMockedId(order.id) && (
            <EditMetadataOverlay
              resourceType={order.type}
              resourceId={order.id}
              title={pageTitle}
            />
          )}
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}

export default OrderDetails
