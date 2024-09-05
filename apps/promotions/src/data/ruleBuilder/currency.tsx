import { isDefined } from '#data/isValid'
import { isMockedId } from '#mocks'
import type { Promotion } from '#types'
import type { CurrencyCode } from '@commercelayer/app-elements'
import { currencies, useCoreApi } from '@commercelayer/app-elements'
import type { CustomPromotionRule, FlexPromotion } from '@commercelayer/sdk'
import { useEffect, useMemo, useState } from 'react'

export function useCurrencyCodes(promotion: Promotion): CurrencyCode[] {
  const [currencyCodes, setCurrencyCodes] = useState<CurrencyCode[]>([])

  const { ruleFilters, filterKey } = useMemo(() => {
    const ruleFilters = getCustomPromotionRuleFilters(promotion)
    return {
      ruleFilters,
      filterKey: findOneOf(Object.keys(ruleFilters ?? {}), [
        'market_id_in',
        'market_id_not_in'
      ])
    }
  }, [promotion])

  const { data: markets, isLoading } = useCoreApi(
    'markets',
    'list',
    ruleFilters != null && filterKey != null
      ? [
          {
            filters: {
              [filterKey.replace('market_', '')]: ruleFilters[filterKey]
            },
            include: ['price_list'],
            fields: {
              markets: ['id', 'price_list'],
              price_lists: ['currency_code']
            }
          }
        ]
      : null
  )

  useEffect(() => {
    if (isMockedId(promotion.id) || isLoading) {
      return
    }

    const fromPromotion =
      promotion.type !== 'flex_promotions'
        ? extractFromPromotion(promotion)
        : null

    const fromCustomPromotionRule = extractFromCustomPromotionRule(promotion)

    const tmpList = fromPromotion ?? fromCustomPromotionRule

    if (tmpList != null) {
      setCurrencyCodes(tmpList)
    } else {
      if (markets == null) {
        return
      }

      const currencyCodes = markets
        .map((market) => market.price_list?.currency_code)
        .filter(isDefined) as NonNullable<CurrencyCode[]>

      setCurrencyCodes(currencyCodes)
    }
  }, [promotion, isLoading, markets])

  return currencyCodes
}

function extractFromPromotion(
  promotion: Exclude<Promotion, FlexPromotion>
): CurrencyCode[] | null {
  const fromPromotion = promotion.currency_code as Nullable<CurrencyCode>

  const fromPromotionMarket = promotion.market?.price_list
    ?.currency_code as Nullable<CurrencyCode>

  return fromPromotion != null
    ? [fromPromotion]
    : fromPromotionMarket != null
      ? [fromPromotionMarket]
      : null
}

function extractFromCustomPromotionRule(
  promotion: Promotion
): CurrencyCode[] | null {
  const ruleFilters = getCustomPromotionRuleFilters(promotion)

  if (ruleFilters == null) {
    return null
  }

  const currencyCodeInList = extractValuesAsArray<CurrencyCode>(
    ruleFilters.currency_code_in
  )

  const currencyCodeNotInAsArray = extractValuesAsArray(
    ruleFilters.currency_code_not_in
  )

  const currencyCodeNotInList = (
    currencyCodeNotInAsArray != null
      ? Object.values(currencies)
          .map((obj) => obj.iso_code)
          .filter((code) => !currencyCodeNotInAsArray.includes(code))
      : null
  ) as CurrencyCode[] | null | undefined

  return currencyCodeInList ?? currencyCodeNotInList ?? null
}

function extractValuesAsArray<T extends string>(value: any): T[] | null {
  return value != null && typeof value === 'string'
    ? (value.split(',') as T[])
    : null
}

function getCustomPromotionRuleFilters(
  promotion: Promotion
): Record<string, any> | null {
  const rule = promotion.promotion_rules?.find(
    (pr): pr is CustomPromotionRule => pr.type === 'custom_promotion_rules'
  )

  return rule?.filters ?? null
}

type Nullable<T> = T | null | undefined

/**
 * Search for `searchElements` inside the provided `list`. Returns the first element found.
 * @param list Source list.
 * @param searchElements List of elements to search inside the provided `list`.
 * @returns The first element found.
 */
function findOneOf(
  list: string[],
  searchElements: string[]
): string | undefined {
  return list.find((str) => searchElements.includes(str))
}
