import { isMockedId, makePriceTier } from '#mocks'
import type { PriceTierType } from '#types'
import { getPriceTierSdkResource } from '#utils/priceTiers'
import { useCoreApi } from '@commercelayer/app-elements'
import type { PriceFrequencyTier, PriceVolumeTier } from '@commercelayer/sdk'
import type { KeyedMutator } from 'swr'

export function usePriceTierDetails(
  id: string,
  type: PriceTierType
): {
  tier: PriceFrequencyTier | PriceVolumeTier
  isLoading: boolean
  error: any
  mutateTier: KeyedMutator<PriceFrequencyTier | PriceVolumeTier>
} {
  const sdkResource = getPriceTierSdkResource(type)

  const {
    data: tier,
    isLoading,
    error,
    mutate: mutateTier
  } = useCoreApi(sdkResource, 'retrieve', !isMockedId(id) ? [id] : null, {
    fallbackData: makePriceTier(type)
  })

  return { tier, error, isLoading, mutateTier }
}
