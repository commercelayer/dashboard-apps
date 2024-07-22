import {
  makeCustomPromotionRule,
  makeMarket,
  makePercentageDiscountPromotion,
  makePriceList
} from '#mocks'
import * as appElements from '@commercelayer/app-elements'
import { currencies } from '@commercelayer/app-elements'
import { act, renderHook } from '@testing-library/react'
import { vi } from 'vitest'
import { useCurrencyCodes } from './currency'

vi.mock('@commercelayer/app-elements', async (importOriginal) => {
  return {
    ...((await importOriginal()) satisfies Record<string, unknown>)
  }
})

describe('useCurrencyCodes', () => {
  it('should return empty array when there are no currency codes associated to the promotion', async () => {
    vi.spyOn(appElements, 'useCoreApi').mockReturnValue({
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
      // @ts-expect-error Type is wrong
      data: []
    })

    const { result } = await act(() =>
      renderHook(useCurrencyCodes, {
        initialProps: makePercentageDiscountPromotion({ id: 'ABCD' })
      })
    )

    expect(result.current).toStrictEqual([])
  })

  it('should return the currency code from a promotion', async () => {
    vi.spyOn(appElements, 'useCoreApi').mockReturnValue({
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
      // @ts-expect-error Type is wrong
      data: []
    })

    const { result } = await act(() =>
      renderHook(useCurrencyCodes, {
        initialProps: makePercentageDiscountPromotion({
          id: 'ABCD',
          currency_code: 'USD'
        })
      })
    )

    expect(result.current).toStrictEqual(['USD'])
  })

  it('should return the currency code from the market linked to the promotion', async () => {
    vi.spyOn(appElements, 'useCoreApi').mockReturnValue({
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
      // @ts-expect-error Type is wrong
      data: []
    })

    const { result } = await act(() =>
      renderHook(useCurrencyCodes, {
        initialProps: makePercentageDiscountPromotion({
          id: 'ABCD',
          market: makeMarket({
            price_list: makePriceList({ currency_code: 'EUR' })
          })
        })
      })
    )

    expect(result.current).toStrictEqual(['EUR'])
  })

  it('should return the currency code from the custom rules (currency_code_in)', async () => {
    vi.spyOn(appElements, 'useCoreApi').mockReturnValue({
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
      // @ts-expect-error Type is wrong
      data: []
    })

    const { result } = await act(() =>
      renderHook(useCurrencyCodes, {
        initialProps: makePercentageDiscountPromotion({
          id: 'ABCD',
          promotion_rules: [
            makeCustomPromotionRule({
              filters: { currency_code_in: 'AED,EUR' }
            })
          ]
        })
      })
    )

    expect(result.current).toStrictEqual(['AED', 'EUR'])
  })

  it('should return the currency code from the custom rules (currency_code_not_in)', async () => {
    vi.spyOn(appElements, 'useCoreApi').mockReturnValue({
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
      // @ts-expect-error Type is wrong
      data: []
    })

    const { result } = await act(() =>
      renderHook(useCurrencyCodes, {
        initialProps: makePercentageDiscountPromotion({
          id: 'ABCD',
          promotion_rules: [
            makeCustomPromotionRule({
              filters: { currency_code_not_in: 'AED,EUR' }
            })
          ]
        })
      })
    )

    expect(result.current).toStrictEqual(
      Object.values(currencies)
        .map((obj) => obj.iso_code)
        .filter((code) => !['AED', 'EUR'].includes(code))
    )
  })

  it('should return the currency code from the custom rules (market_id_in)', async () => {
    const useCoreApi = vi.spyOn(appElements, 'useCoreApi').mockReturnValue({
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
      // @ts-expect-error Type is wrong
      data: [
        makeMarket({
          price_list: makePriceList({ currency_code: 'USD' })
        }),
        makeMarket({
          price_list: makePriceList({ currency_code: 'EUR' })
        })
      ]
    })

    const { result } = await act(() =>
      renderHook(useCurrencyCodes, {
        initialProps: makePercentageDiscountPromotion({
          id: 'ABCD',
          promotion_rules: [
            makeCustomPromotionRule({
              filters: { market_id_in: 'mabcd1' }
            })
          ]
        })
      })
    )

    expect(result.current).toStrictEqual(['USD', 'EUR'])

    expect(useCoreApi).toHaveBeenCalledWith('markets', 'list', [
      {
        filters: {
          id_in: 'mabcd1'
        },
        include: ['price_list'],
        fields: {
          markets: ['id', 'price_list'],
          price_lists: ['currency_code']
        }
      }
    ])
  })

  it('should return the currency code from the custom rules (market_id_not_in)', async () => {
    const useCoreApi = vi.spyOn(appElements, 'useCoreApi').mockReturnValue({
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
      // @ts-expect-error Type is wrong
      data: [
        makeMarket({
          price_list: makePriceList({ currency_code: 'USD' })
        }),
        makeMarket({
          price_list: makePriceList({ currency_code: 'EUR' })
        })
      ]
    })

    const { result } = await act(() =>
      renderHook(useCurrencyCodes, {
        initialProps: makePercentageDiscountPromotion({
          id: 'ABCD',
          promotion_rules: [
            makeCustomPromotionRule({
              filters: { market_id_not_in: 'mabcd1' }
            })
          ]
        })
      })
    )

    expect(result.current).toStrictEqual(['USD', 'EUR'])

    expect(useCoreApi).toHaveBeenCalledWith('markets', 'list', [
      {
        filters: {
          id_not_in: 'mabcd1'
        },
        include: ['price_list'],
        fields: {
          markets: ['id', 'price_list'],
          price_lists: ['currency_code']
        }
      }
    ])
  })
})
