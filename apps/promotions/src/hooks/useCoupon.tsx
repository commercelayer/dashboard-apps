import { isMockedId } from '#mocks'
import { useCoreApi } from '@commercelayer/app-elements'
import type { Coupon } from '@commercelayer/sdk'
import { makeCoupon } from 'src/mocks/resources/coupons'
import type { KeyedMutator } from 'swr'

export const includeAttribute = []

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useCoupon<Id extends string | undefined>(id: Id) {
  const { data, isLoading, mutate, isValidating, error } = useCoreApi(
    'coupons',
    'retrieve',
    id == null
      ? null
      : [
          id,
          {
            include: includeAttribute
          }
        ],
    {
      isPaused: () => id != null && isMockedId(id),
      fallbackData: id != null ? (makeCoupon() as any) : undefined
    }
  )

  return {
    coupon: data as unknown as undefined extends Id
      ? Coupon | undefined
      : Coupon,
    isLoading,
    mutateCoupon: mutate as unknown as KeyedMutator<Coupon>,
    isValidating,
    error
  }
}
