import { act, renderHook } from '@testing-library/react'
import { describe, it } from 'vitest'
import { usePromotionPermission } from './usePromotionPermission'

vi.mock('@commercelayer/app-elements', async (importOriginal) => {
  return {
    ...((await importOriginal()) satisfies Record<string, unknown>),
    useTokenProvider: () => ({
      canUser: vi.fn().mockImplementation((_action, resource) => {
        if (resource === 'external_promotions') {
          return false
        }

        return true
      })
    })
  }
})

describe('usePromotionPermission().canCreate', () => {
  it('should check if user is able to create at least one promotion', async () => {
    const { result } = await act(() => renderHook(usePromotionPermission, {}))

    expect(result.current.canUserManagePromotions('create', 'atLeastOne')).toBe(
      true
    )

    expect(
      result.current.canUserManagePromotions('create', 'atLeastOne', [
        'free_gift_promotions',
        'buy_x_pay_y_promotions'
      ])
    ).toBe(true)

    expect(
      result.current.canUserManagePromotions('create', 'atLeastOne', [
        'free_gift_promotions',
        'external_promotions'
      ])
    ).toBe(true)

    expect(
      result.current.canUserManagePromotions('create', 'atLeastOne', [
        'external_promotions'
      ])
    ).toBe(false)
  })

  it('should check if user is able to create all promotions', async () => {
    const { result } = await act(() => renderHook(usePromotionPermission, {}))

    expect(result.current.canUserManagePromotions('create', 'all')).toBe(false)

    expect(
      result.current.canUserManagePromotions('create', 'all', [
        'free_gift_promotions',
        'buy_x_pay_y_promotions'
      ])
    ).toBe(true)

    expect(
      result.current.canUserManagePromotions('create', 'all', [
        'free_gift_promotions',
        'external_promotions'
      ])
    ).toBe(false)

    expect(
      result.current.canUserManagePromotions('create', 'all', [
        'external_promotions'
      ])
    ).toBe(false)
  })
})
