import type { Link } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeLink = (): Link => {
  return {
    ...makeResource('links'),
    name: 'T-shirt',
    client_id: '',
    scope: '',
    starts_at: '',
    expires_at: ''
  }
}
