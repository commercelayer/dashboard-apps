import type { Package } from '@commercelayer/sdk'

export const makePackage = (): Package => {
  return {
    type: 'packages',
    id: 'fake-123',
    created_at: '',
    updated_at: '',
    name: 'Unknown',
    height: 20,
    length: 20,
    width: 20,
    unit_of_length: 'cm'
  }
}
