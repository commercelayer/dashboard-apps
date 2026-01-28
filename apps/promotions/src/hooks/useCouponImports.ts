import { useCoreApi } from '@commercelayer/app-elements'
import type { Import, ListResponse } from '@commercelayer/sdk'

export function useCouponImports(
  promotionId: string,
  status: 'completed' | 'pending'
): {
  importedCoupons: ListResponse<Import> | undefined
  isLoading: boolean
} {
  const { data, isLoading } = useCoreApi('imports', 'list', [
    {
      filters: {
        resource_type_eq: 'coupons',
        reference_eq: `promotion_id:${promotionId}`,
        status_in:
          status === 'completed' ? ['completed'] : ['pending', 'in_progress']
      },
      pageSize: 25
      // fields: ['id', 'status', 'created_at', 'completed_at', 'inputs']
    }
  ])

  return {
    importedCoupons: data,
    isLoading
  }
}
