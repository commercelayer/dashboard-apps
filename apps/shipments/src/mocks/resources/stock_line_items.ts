import type { StockLineItem } from '@commercelayer/sdk'

export const makeStockLineItem = (): StockLineItem => {
  return {
    type: 'stock_line_items',
    id: 'fake-123',
    created_at: '',
    updated_at: '',
    quantity: 1
  }
}
