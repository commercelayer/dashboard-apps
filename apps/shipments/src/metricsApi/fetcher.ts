interface MetricsApiFetcherParams {
  endpoint: string
  slug: string
  accessToken: string
  body: Record<string, any>
  domain: string
}

export const metricsApiFetcher = async <Data>({
  endpoint,
  slug,
  accessToken,
  body,
  domain
}: MetricsApiFetcherParams): Promise<VndApiResponse<Data>> => {
  const url = `https://${slug}.${domain}/metrics${endpoint}`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      accept: 'application/vnd.api.v1+json',
      'content-type': 'application/vnd.api+json',
      authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(body)
  })
  return await response.json()
}
