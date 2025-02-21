import { presets, type ListType } from '#data/lists'
import {
  makeDateYearsRange,
  useTokenProvider
} from '@commercelayer/app-elements'

import type { ParsedScopes } from '@commercelayer/app-elements/dist/providers/TokenProvider/getInfoFromJwt'
import type { FormFullValues } from '@commercelayer/app-elements/dist/ui/resources/useResourceFilters/types'
import castArray from 'lodash-es/castArray'
import useSWR, { type SWRResponse } from 'swr'
import { metricsApiFetcher } from './fetcher'

const fetchReturnStats = async ({
  slug,
  accessToken,
  filters,
  domain
}: {
  slug: string
  accessToken: string
  filters: object
  domain: string
}): Promise<VndApiResponse<MetricsApiReturnsStatsData>> =>
  await metricsApiFetcher<MetricsApiReturnsStatsData>({
    endpoint: '/returns/stats',
    slug,
    accessToken,
    body: {
      stats: {
        field: 'return.id',
        operator: 'value_count'
      },
      filter: filters
    },
    domain
  })

const fetchAllCounters = async ({
  slug,
  accessToken,
  domain,
  scopes
}: {
  slug: string
  accessToken: string
  domain: string
  scopes: ParsedScopes
}): Promise<{
  requested: number
  approved: number
  shipped: number
}> => {
  function fulfillResult(result?: PromiseSettledResult<number>): number {
    return result?.status === 'fulfilled' ? result.value : 0
  }

  // keep proper order since responses will be assigned for each list in the returned object
  const lists: ListType[] = ['requested', 'approved', 'shipped']

  const allStats = await Promise.allSettled(
    lists.map(async (listType) => {
      return await fetchReturnStats({
        slug,
        accessToken,
        filters: fromFormValuesToMetricsApi(presets[listType], scopes),
        domain
      }).then((r) => r.data.value)
    })
  )

  return {
    requested: fulfillResult(allStats[0]),
    approved: fulfillResult(allStats[1]),
    shipped: fulfillResult(allStats[2])
  }
}

export function useListCounters(): SWRResponse<{
  requested: number
  approved: number
  shipped: number
}> {
  const {
    settings: { accessToken, organizationSlug, domain, scopes }
  } = useTokenProvider()

  const swrResponse = useSWR(
    {
      slug: organizationSlug,
      domain,
      accessToken,
      scopes
    },
    fetchAllCounters,
    {
      revalidateOnFocus: false
    }
  )

  return swrResponse
}

/**
 * Covert FilterFormValues in Metrics API filter object.
 * Partial implementation: it only supports status, payment_status and fulfillment_status
 */
function fromFormValuesToMetricsApi(
  formValues: FormFullValues,
  scopes?: ParsedScopes
): object {
  const filterStatuses = {
    statuses:
      formValues.status_in != null && castArray(formValues.status_in).length > 0
        ? {
            in: formValues.status_in
          }
        : undefined
  }

  // if there are stock locations in the access token scopes we to restrict the results
  const filterStockLocations =
    scopes?.stock_location?.ids != null &&
    scopes?.stock_location?.ids.length > 0
      ? {
          stock_location: {
            ids: {
              in: scopes.stock_location.ids
            }
          }
        }
      : {}

  return {
    return: {
      ...makeDateYearsRange({
        now: new Date(),
        showMilliseconds: false,
        yearsAgo: 5
      }),
      date_field: 'updated_at',
      ...filterStatuses
    },
    ...filterStockLocations
  }
}
