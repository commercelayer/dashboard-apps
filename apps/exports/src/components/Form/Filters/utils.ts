import { type QueryParamsList } from '@commercelayer/sdk'
import { type AllFilters, type FilterValue } from 'AppForm'
import { endOfDay, startOfDay } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

export function adaptFormFiltersToSdk(
  filters?: AllFilters,
  timezone?: string
): QueryParamsList['filters'] {
  if (filters == null) {
    return
  }

  const allFiltersKeys = Object.keys(filters) as Array<keyof AllFilters>
  const cleanSdkFilters = allFiltersKeys.reduce((skdFilters, filterKey) => {
    let value = filters[filterKey]

    // remove undefined
    if (value == null) {
      return skdFilters
    }

    // remove empty array
    if (Array.isArray(value) && value.length === 0) {
      return skdFilters
    }

    // dates `grater than` should always have 00:00:00 time
    if (filterKey.includes('at_gteq') && typeof value === 'string') {
      value = isoDateToDayEdge({
        isoString: value,
        edge: 'startOfTheDay',
        timezone
      })
    }

    // dates `lower than` should always have 23:59:59 time
    if (filterKey.includes('at_lteq') && typeof value === 'string') {
      value = isoDateToDayEdge({
        isoString: value,
        edge: 'endOfTheDay',
        timezone
      })
    }

    // parsing string as boolean
    if (value === 'true') {
      value = true
    }
    if (value === 'false') {
      value = false
    }

    return {
      ...skdFilters,
      [filterKey]: value
    }
  }, {})

  return cleanSdkFilters
}

type IsoDate = string
export function isoDateToDayEdge({
  isoString,
  edge,
  timezone = 'UTC'
}: {
  isoString: IsoDate
  edge: 'startOfTheDay' | 'endOfTheDay'
  timezone?: string
}): string | undefined {
  try {
    const date = new Date(isoString)
    if (date == null || isoString == null) {
      return undefined
    }

    const zonedDate = toZonedTime(date, timezone)

    if (edge === 'startOfTheDay') {
      return fromZonedTime(startOfDay(zonedDate), timezone).toISOString()
    }

    if (edge === 'endOfTheDay') {
      return fromZonedTime(endOfDay(zonedDate), timezone).toISOString()
    }

    return undefined
  } catch {
    return undefined
  }
}

export function parseFilterToDate(filterValue?: FilterValue): Date | null {
  return filterValue != null && typeof filterValue === 'string'
    ? new Date(filterValue)
    : null
}
