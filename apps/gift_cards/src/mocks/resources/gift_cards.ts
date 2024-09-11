import type { GiftCard } from '@commercelayer/sdk'
import { makeResource } from '../resource'

export const makeGiftCard = (): GiftCard => {
  return {
    ...makeResource('gift_cards'),
    status: 'draft',
    balance_cents: 0,
    balance_float: 0,
    initial_balance_cents: 0,
    initial_balance_float: 0,
    formatted_initial_balance: '$0.00',
    formatted_balance: '$0.00',
    balance_log: [],
    usage_log: []
  }
}
