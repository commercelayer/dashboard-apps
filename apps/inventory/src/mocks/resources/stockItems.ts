import type { Sku, StockItem } from '@commercelayer/sdk'
import { makeResource } from '../resource'

const sku = {
  ...makeResource('skus'),
  code: 'TSHIRTMSB0B0B2000000LXXX',
  name: 'Gray Men T-Shirt with Black Logo (L)'
} satisfies Sku

export const makeStockItem = (): StockItem => {
  return {
    ...makeResource('stock_items'),
    quantity: 15,
    sku
  }
}
