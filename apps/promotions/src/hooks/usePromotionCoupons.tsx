import { isMockedId } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
import type { Coupon, ListResponse } from '@commercelayer/sdk'
import type { KeyedMutator } from 'swr'

export const promotionCouponsIncludeAttribute = ['promotion_rule']

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function usePromotionCoupons<Id extends string | undefined>(
  promotionId: Id
) {
  const { data, isLoading, mutate, isValidating, error } = useCoreApi(
    'promotions',
    'coupons',
    promotionId == null || isMockedId(promotionId)
      ? null
      : [
          promotionId,
          {
            include: promotionCouponsIncludeAttribute,
            sort: ['-updated_at'],
            pageNumber: 1,
            pageSize: 5
          }
        ]
  )

  return {
    coupons: data,
    isLoading,
    mutatePromotionCoupons: mutate as unknown as KeyedMutator<
      ListResponse<Coupon>
    >,
    isValidating,
    error
  }
}
