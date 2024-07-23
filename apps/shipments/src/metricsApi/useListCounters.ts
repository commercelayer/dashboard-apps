import { presets, type ListType } from '#data/lists'
import {
  makeDateYearsRange,
  useTokenProvider
} from '@commercelayer/app-elements'
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
            yearsAgo: 1,
            showMilliseconds: false
          }),
          date_field: 'updated_at'
        },
        ...filters
      }
    },
    domain
  })

const fetchAllCounters = async ({
  slug,
  accessToken,
  domain
}: {
  slug: string
  accessToken: string
  domain: string
}): Promise<{
  picking: number
  packing: number
  readyToShip: number
  onHold: number
}> => {
  const lists: ListType[] = ['picking', 'packing', 'readyToShip', 'onHold']
  const listsStatuses = lists.map((listType) => presets[listType].status_eq)

  const allStats = await fetchShipmentStats({
    domain,
    slug,
    accessToken,
    filters: {
      shipments: {
        statuses: {
          in: listsStatuses
        }
      }
    }
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
    settings: { accessToken, organizationSlug, domain }
  } = useTokenProvider()

  const swrResponse = useSWR(
    {
      slug: organizationSlug,
      domain,
      accessToken
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
