import { useCoreApi } from '@commercelayer/app-elements'
import { useMemo } from 'react'

export const useSubscriptionModelsFrequencies = (): string[] => {
  const { data } = useCoreApi('subscription_models', 'list', [{ pageSize: 25 }])

  return useMemo(() => {
    if (data != null && data.meta.recordCount <= 25) {
      const frequencies: string[] = []
      data?.forEach((subModel) => {
        subModel.frequencies.forEach((freq) => frequencies.push(freq))
      })
      return [...new Set(frequencies)]
    }
    return []
  }, [data])
}
