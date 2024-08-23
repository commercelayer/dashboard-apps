import { StockTransferAddresses } from '#components/StockTransferAddresses'
import { StockTransferInfo } from '#components/StockTransferInfo'
import { StockTransferSteps } from '#components/StockTransferSteps'
import { StockTransferSummary } from '#components/StockTransferSummary'
import { Timeline } from '#components/Timeline'
import {
  getStockTransferTriggerActions,
  getStockTransferTriggerAttributeName
} from '#data/dictionaries'
import { appRoutes } from '#data/routes'
import { useCancelOverlay } from '#hooks/useCancelOverlay'
import { useStockTransferDetails } from '#hooks/useStockTransferDetails'
import { useTriggerAttribute } from '#hooks/useTriggerAttribute'
import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  formatDateWithPredicate,
  goBack,
  useTokenProvider,
  type DropdownItemProps,
  type PageHeadingProps
} from '@commercelayer/app-elements'
import { useMemo } from 'react'
import { Link, useLocation, useRoute } from 'wouter'

export function StockTransferDetails(): JSX.Element {
  const {
    canUser,
    settings: { mode },
    user
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [, params] = useRoute<{ stockTransferId: string }>(
    appRoutes.details.path
  )

  const stockTransferId = params?.stockTransferId ?? ''

  const { stockTransfer, isLoading } = useStockTransferDetails(stockTransferId)

  if (stockTransferId === '' || !canUser('read', 'stock_transfers')) {
    return (
      <PageLayout
        title='Stock transfers'
        navigationButton={{
          onClick: () => {
            setLocation(appRoutes.home.makePath({}))
          },
          label: 'Stock Transfers',
          icon: 'arrowLeft'
        }}
        mode={mode}
      >
        <EmptyState
          title='Not authorized'
          action={
            <Link href={appRoutes.home.makePath({})}>
              <Button variant='primary'>Go back</Button>
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const triggerMenuActions = useMemo(() => {
    return getStockTransferTriggerActions(stockTransfer)
  }, [stockTransfer])

  const { show: showCancelOverlay, Overlay: CancelOverlay } = useCancelOverlay()
  const { dispatch } = useTriggerAttribute(stockTransfer.id)

  const triggerDropDownItems: DropdownItemProps[][] = triggerMenuActions
    .toReversed()
    .reduce<DropdownItemProps[][]>((acc, triggerAction, idx) => {
      const dropdownItem = {
        label: getStockTransferTriggerAttributeName(
          triggerAction.triggerAttribute
        ),
        onClick: () => {
          // cancel action has its own modal
          if (triggerAction.triggerAttribute === '_cancel') {
            showCancelOverlay()
            return
          }
          void dispatch(triggerAction.triggerAttribute)
        }
      }

      const isLast = idx === triggerMenuActions.length - 1

      if (isLast) {
        acc.push([dropdownItem])
      } else {
        const [firstGroup] = acc
        if (firstGroup != null) {
          firstGroup.push(dropdownItem)
        } else {
          acc.push([dropdownItem])
        }
      }

      return acc
    }, [])

  const pageToolbar: PageHeadingProps['toolbar'] = {
    buttons: [],
    dropdownItems: triggerDropDownItems
  }

  const pageTitle = `Stock transfer #${stockTransfer.number}`

  return (
    <PageLayout
      mode={mode}
      toolbar={pageToolbar}
      title={
        <SkeletonTemplate isLoading={isLoading}>{pageTitle}</SkeletonTemplate>
      }
      description={
        <SkeletonTemplate isLoading={isLoading}>
          {stockTransfer.updated_at != null ? (
            <div>
              {formatDateWithPredicate({
                predicate: 'Updated',
                isoDate: stockTransfer.updated_at,
                timezone: user?.timezone
              })}
            </div>
          ) : stockTransfer.created_at != null ? (
            <div>
              {formatDateWithPredicate({
                predicate: 'Created',
                isoDate: stockTransfer.created_at,
                timezone: user?.timezone
              })}
            </div>
          ) : null}
          {stockTransfer.reference != null && (
            <div>Ref. {stockTransfer.reference}</div>
          )}
        </SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          goBack({
            setLocation,
            defaultRelativePath: appRoutes.home.makePath({})
          })
        },
        label: 'Stock Transfers',
        icon: 'arrowLeft'
      }}
      scrollToTop
    >
      <SkeletonTemplate isLoading={isLoading}>
        <CancelOverlay
          stockTransfer={stockTransfer}
          onConfirm={() => {
            void dispatch('_cancel')
          }}
        />
        <Spacer bottom='4'>
          <StockTransferSteps stockTransfer={stockTransfer} />
          <Spacer top='14'>
            <StockTransferInfo stockTransfer={stockTransfer} />
          </Spacer>
          <Spacer top='14'>
            <StockTransferSummary stockTransfer={stockTransfer} />
          </Spacer>
          <Spacer top='14'>
            <StockTransferAddresses stockTransfer={stockTransfer} />
          </Spacer>
          <Spacer top='14'>
            <Timeline stockTransfer={stockTransfer} />
          </Spacer>
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  )
}
