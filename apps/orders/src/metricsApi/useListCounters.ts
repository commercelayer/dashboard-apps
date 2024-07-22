import { makeInstructions } from '#data/filters'
import { presets } from '#data/lists'
import {
  useResourceFilters,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { MetricsFilters } from '@commercelayer/app-elements/dist/ui/resources/useResourceFilters/adaptSdkToMetrics'
import type { UiFilterValue } from '@commercelayer/app-elements/dist/ui/resources/useResourceFilters/types'
import type { QueryFilter } from '@commercelayer/sdk'
import useSWR, { type SWRResponse } from 'swr'
import { metricsApiFetcher } from './fetcher'

const listPresetsForCounters = [
  'awaitingApproval',
  'paymentToCapture',
  'fulfillmentInProgress',
  'editing'
] as const
type ListPreset = (typeof listPresetsForCounters)[number]

const fetchAllCounters = async ({
  domain,
  slug,
  accessToken,
  metricsFilters
}: {
  domain: string
  slug: string
  accessToken: string
  metricsFilters: Record<ListPreset, MetricsFilters>
}): Promise<Record<ListPreset, number>> => {
  function fulfillResult(result?: PromiseSettledResult<number>): number {
    return result?.status === 'fulfilled' ? result.value : 0
  }

  const lists = Object.keys(metricsFilters) as ListPreset[]

  const allStats = await Promise.allSettled(
    lists.map(async (listType) => {
      return await metricsApiFetcher<MetricsApiOrdersStatsData>({
        endpoint: '/orders/stats',
        domain,
        slug,
        accessToken,
        body: {
          stats: {
            field: 'order.id',
            operator: 'value_count'
          },
          filter: metricsFilters[listType]
        }
      }).then((r) => r.data.value)
    })
  )

  const defaultValues = Object.fromEntries(
    lists.map((listType) => [listType, 0])
  ) as Record<ListPreset, number>

  return lists.reduce((acc, listType, index) => {
    return {
      ...acc,
      [listType]: fulfillResult(allStats[index])
    }
  }, defaultValues)
}

export function useListCounters(): SWRResponse<{
  awaitingApproval: number
  editing: number
  paymentToCapture: number
  fulfillmentInProgress: number
}> {
  const {
    settings: { accessToken, organizationSlug, domain }
  } = useTokenProvider()

  const {
    adapters: { adaptFormValuesToSdk, adaptSdkToMetrics }
  } = useResourceFilters({
    instructions: makeInstructions({})
  })

  const sdkFilters = listPresetsForCounters.reduce((acc, listType) => {
    return {
      ...acc,
      [listType]: adaptFormValuesToSdk({
        formValues: presets[listType] as Record<ListPreset, UiFilterValue>
      })
    }
  }, {}) as Record<ListPreset, QueryFilter>

  const metricsFilters = listPresetsForCounters.reduce((acc, listType) => {
    return {
      ...acc,
      [listType]: adaptSdkToMetrics({
        resourceType: 'orders',
        sdkFilters: sdkFilters[listType]
      })
    }
  }, {})

  const swrResponse = useSWR(
    {
      slug: organizationSlug,
      domain,
      accessToken,
      metricsFilters
    },
    fetchAllCounters,
    {
      revalidateOnFocus: false
    }
  )

  return swrResponse
}
