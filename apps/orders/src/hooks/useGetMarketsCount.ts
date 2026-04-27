import { useCoreApi } from "@commercelayer/app-elements"

export function useGetMarketsCount() {
  const {
    data: markets,
    isLoading,
    error,
  } = useCoreApi(
    "markets",
    "list",
    [
      {
        fields: ["id"],
        filters: {
          disabled_at_null: true,
        },
        pageSize: 1,
      },
    ],
    {
      revalidateIfStale: false,
    },
  )

  return {
    count: markets?.meta?.recordCount,
    isLoading,
    error,
  }
}
