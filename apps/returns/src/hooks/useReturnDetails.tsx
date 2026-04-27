import { isMockedId, useCoreApi } from "@commercelayer/app-elements"
import { makeReturn } from "#mocks"

export const returnIncludeAttribute = [
  "stock_location",
  "order",
  "order.market",
  "order.captures",
  "customer",
  "return_line_items",
  "origin_address",
  "destination_address",
]

export function useReturnDetails(id: string) {
  const {
    data: returnObj,
    isLoading,
    mutate: mutateReturn,
    isValidating,
  } = useCoreApi(
    "returns",
    "retrieve",
    isMockedId(id)
      ? null
      : [
          id,
          {
            include: returnIncludeAttribute,
          },
        ],
    {
      fallbackData: makeReturn(),
    },
  )

  return { returnObj, isLoading, mutateReturn, isValidating }
}
