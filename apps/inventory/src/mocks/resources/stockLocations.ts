import type { StockLocation } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeStockLocation = (): StockLocation => {
  return {
    ...makeResource('stock_locations'),
    name: 'Stock location'
  }
}
