import { useStockTransferDetails } from '#hooks/useStockTransferDetails'
import {
  Legend,
  Spacer,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import type { StockTransfer } from '@commercelayer/sdk'
import { StockTransferTimeline } from './StockTransferTimeline'

interface Props {
  stockTransfer: StockTransfer
}

export const Timeline = withSkeletonTemplate<Props>(({ stockTransfer }) => {
  const { isValidating } = useStockTransferDetails(stockTransfer.id)

  return (
    <>
      <Legend title='Timeline' />
      <Spacer top='8'>
        <StockTransferTimeline
          stockTransferId={stockTransfer.id}
          refresh={isValidating}
          attachmentOption={{
            referenceOrigin: 'app-stock-transfers--note'
          }}
        />
      </Spacer>
    </>
  )
})
