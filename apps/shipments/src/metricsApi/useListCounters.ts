import { presets, type ListType } from '#data/lists'
import {
  makeDateYearsRange,
  useTokenProvider
} from '@commercelayer/app-elements'
import type { ParsedScopes } from '@commercelayer/app-elements/dist/providers/TokenProvider/getInfoFromJwt'
import useSWR, { type SWRResponse } from 'swr'
import { metricsApiFetcher } from './fetcher'

const fetchShipmentStats = async ({
  slug,
  accessToken,
  filters,
  domain
}: {
  slug: string
  accessToken: string
  filters: object
  domain: string
}): Promise<VndApiResponse<MetricsApiShipmentsBreakdownData>> =>
  await metricsApiFetcher<MetricsApiShipmentsBreakdownData>({
    endpoint: '/orders/breakdown',
    slug,
    accessToken,
    body: {
      breakdown: {
        by: 'shipments.status',
        field: 'shipments.id',
        operator: 'value_count'
      },
      filter: {
        order: {
          ...makeDateYearsRange({
            now: new Date(),
            yearsAgo: 5,
            showMilliseconds: false
          }),
          date_field: 'updated_at'
        },
        ...filters
      }
    },
    domain
  })

interface FetchAllCountersArgs {
  slug: string
  accessToken: string
  domain: string
  filters: Record<string, unknown>
}

const fetchAllCounters = async ({
  slug,
  accessToken,
  domain,
  filters
}: FetchAllCountersArgs): Promise<{
  picking: number
  packing: number
  readyToShip: number
  onHold: number
}> => {
  const allStats = await fetchShipmentStats({
    domain,
    slug,
    accessToken,
    filters
  })

  const stats = allStats.data

  return {
    picking: getShipmentsBreakdownCounterByStatus(stats, 'picking'),
    packing: getShipmentsBreakdownCounterByStatus(stats, 'packing'),
    readyToShip: getShipmentsBreakdownCounterByStatus(stats, 'ready_to_ship'),
    onHold: getShipmentsBreakdownCounterByStatus(stats, 'on_hold')
  }
}

export function useListCounters(): SWRResponse<{
  picking: number
  packing: number
  readyToShip: number
  onHold: number
}> {
  const {
    settings: { accessToken, organizationSlug, domain, scopes }
  } = useTokenProvider()

  const swrResponse = useSWR(
    {
      slug: organizationSlug,
      domain,
      accessToken,
      filters: prepareFiltersForCounters({ scopes })
    },
    fetchAllCounters,
    {
      revalidateOnFocus: false
    }
  )

  return swrResponse
}

function getShipmentsBreakdownCounterByStatus(
  allStats: MetricsApiShipmentsBreakdownData,
  status: 'picking' | 'packing' | 'on_hold' | 'ready_to_ship'
): number {
  const stats = allStats['shipments.status']
  return stats?.filter((stat) => stat.label === status)[0]?.value ?? 0
}

function prepareFiltersForCounters({
  scopes
}: {
  scopes?: ParsedScopes
}): FetchAllCountersArgs['filters'] {
  const lists: ListType[] = ['picking', 'packing', 'readyToShip', 'onHold'] // sorted list of views with counters
  const filterStatuses = {
    statuses: {
      in: lists.map((listType) => presets[listType].status_eq) // status of the single view
    }
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
    shipments: {
      ...filterStatuses,
      ...filterStockLocations
    }
  }
}
