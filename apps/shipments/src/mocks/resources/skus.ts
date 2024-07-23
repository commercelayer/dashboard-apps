import type { Sku } from '@commercelayer/sdk'

export const makeSku = (): Sku => {
  return {
    type: 'skus',
    id: 'fake-123',
    code: 'fake-123',
    created_at: '',
    updated_at: '',
    name: 'Unknown'
  }
}
