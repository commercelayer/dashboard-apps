import type { Market } from '@commercelayer/sdk'

export const makeMarket = (): Market => {
  return {
    type: 'markets',
    shared_secret: '',
    id: '',
    created_at: '',
    updated_at: '',
    name: 'Unknown'
  }
}
