import { useCoreApi } from '@commercelayer/app-elements'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useGetMarketsCount() {
  const {
    data: markets,
    isLoading,
    error
  } = useCoreApi(
    'markets',
    'list',
    [
      {
        fields: ['id'],
        filters: {
          disabled_at_null: true
        },
        pageSize: 1
      }
    ],
    {
      revalidateIfStale: false
    }
  )

  return {
    count: markets?.meta?.recordCount,
    isLoading,
    error
  }
}
