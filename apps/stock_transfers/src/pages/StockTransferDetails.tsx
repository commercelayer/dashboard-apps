import { DetailsContextMenu } from '#components/DetailsContextMenu'
import { StockTransferAddresses } from '#components/StockTransferAddresses'
import { StockTransferInfo } from '#components/StockTransferInfo'
import { StockTransferSteps } from '#components/StockTransferSteps'
import { StockTransferSummary } from '#components/StockTransferSummary'
import { Timeline } from '#components/Timeline'
import { appRoutes } from '#data/routes'
import { useStockTransferDetails } from '#hooks/useStockTransferDetails'
import {
  Button,
  EmptyState,
  PageLayout,
  SkeletonTemplate,
  Spacer,
  formatDateWithPredicate,
  goBack,
  useTokenProvider
} from '@commercelayer/app-elements'
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

  const pageTitle = `Stock transfer #${stockTransfer.number}`

  return (
    <PageLayout
      mode={mode}
      actionButton={<DetailsContextMenu stockTransfer={stockTransfer} />}
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
