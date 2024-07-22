import type { Promotion } from '#types'
import { HookedInputCurrency } from '@commercelayer/app-elements'
import { useCurrencyCodes } from '../currency'

export function InputCurrencyComponent({
  promotion
}: {
  promotion: Promotion
}): React.ReactNode {
  const currencyCodes = useCurrencyCodes(promotion)
  const [currencyCode] = currencyCodes

  if (currencyCodes.length !== 1 || currencyCode == null) {
    return null
  }

  return <HookedInputCurrency name='value' currencyCode={currencyCode} />
}
