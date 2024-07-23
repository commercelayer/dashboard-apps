import { useCoreApi } from '@commercelayer/app-elements'
import type { StockTransfer } from '@commercelayer/sdk'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useHomeCounter(status: StockTransfer['status']) {
  const { data, isLoading } = useCoreApi('stock_transfers', 'list', [
    {
      filters: { status_eq: status },
      fields: ['id', 'status'],
      pageSize: 1
    }
  ])

  return { data, isLoading }
}
