import type { Promotion } from '#types'
import {
  HookedInputSelect,
  currencies,
  type CurrencyCode,
  type InputSelectValue
} from '@commercelayer/app-elements'
import { useCurrencyCodes } from '../currency'

export function SelectCurrencyComponent({
  promotion
}: {
  promotion: Promotion
}): JSX.Element {
  const currencyCodes = useCurrencyCodes(promotion)
  const currencyValues: InputSelectValue[] =
    currencyCodes.length > 0
      ? currencyCodes.map((currencyCode) => {
          const currency =
            currencies[currencyCode.toLowerCase() as Lowercase<CurrencyCode>]
          return {
            label: `${currency.name} (${currencyCode})`,
            value: currencyCode
          }
        })
      : Object.entries(currencies).map(([code, currency]) => ({
          label: `${currency.name} (${code.toUpperCase()})`,
          value: code.toUpperCase()
        }))

  return (
    <HookedInputSelect
      name='value'
      placeholder='Search...'
      initialValues={currencyValues}
      isMulti
    />
  )
}
