import {
  type TokenProviderExtras,
  useTokenProvider,
} from "@commercelayer/app-elements"
import useSWR from "swr"
import type { CountryCodesFilterOptions } from "#data/filters"
import { metricsApiFetcher } from "./fetcher"

interface MetricsApiBreakdownByCountryResponse {
  "order.country_code"?: Array<{
    label: string // country code
    value: string // orders count
  }>
}

export function useCountryCodes(): {
  countryCodes: Array<{ label: string; value: string }>
  isLoading: boolean
} {
  const {
    settings: { accessToken, organizationSlug, domain, extras },
  } = useTokenProvider()

  // the countries filter is enterprise-only: without a key nothing is fetched,
  // and the empty list keeps the filter hidden
  const { data, isLoading } = useSWR(
    isEnterprise(extras)
      ? {
          domain,
          slug: organizationSlug,
          accessToken,
        }
      : null,
    fetchCountryForFilter,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      suspense: true,
    },
  )

  return {
    countryCodes: data ?? [],
    isLoading,
  }
}

/**
 * Whether the organization is on an enterprise subscription. Read from the
 * token provider extras, which the dashboard fills in: an app running outside
 * the dashboard has nothing there, and is treated as non-enterprise.
 */
function isEnterprise(extras: TokenProviderExtras | undefined): boolean {
  return extras?.organization?.isEnterprise === true
}

async function fetchCountryDictionary(): Promise<
  Array<{
    value: string
    label: string
  }>
> {
  const res = await fetch(
    "https://data.commercelayer.app/assets/lists/countries.json",
  )
  if (!res.ok) throw new Error("Failed to fetch countries")
  return await res.json()
}

async function fetchCountryForFilter({
  domain,
  slug,
  accessToken,
}: {
  domain: string
  slug: string
  accessToken: string
}): Promise<CountryCodesFilterOptions> {
  return await Promise.allSettled([
    metricsApiFetcher<MetricsApiBreakdownByCountryResponse>({
      endpoint: "/orders/breakdown",
      domain,
      slug,
      accessToken,
      body: {
        breakdown: {
          by: "order.country_code",
          field: "order.id",
          operator: "value_count",
          sort: "desc",
          limit: 100,
        },
      },
    }),
    fetchCountryDictionary(),
  ]).then(([responseMetrics, responseAllCountries]) => {
    if (responseMetrics.status !== "fulfilled") {
      return []
    }
    const allCountries =
      responseAllCountries.status === "fulfilled"
        ? responseAllCountries.value
        : []
    const normalizedOptions = responseMetrics.value.data[
      "order.country_code"
    ]?.map((metricsItem) => {
      const countryCode = metricsItem.label
      return {
        value: countryCode,
        label:
          allCountries.find((country) => country.value === countryCode)
            ?.label ?? countryCode.toUpperCase(),
      }
    })
    return normalizedOptions ?? []
  })
}
