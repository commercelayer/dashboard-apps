import type { PriceTierType } from '#types'
import type { PriceFrequencyTier, PriceVolumeTier } from '@commercelayer/sdk'

export const makePriceTier = (
  type: PriceTierType
): PriceVolumeTier | PriceFrequencyTier => {
  return {
    type: type === 'volume' ? 'price_volume_tiers' : 'price_frequency_tiers',
    id: '',
    created_at: '',
    updated_at: '',
    name: 'UpTo100',
    price_amount_cents: 0,
    up_to: 100
  }
}
