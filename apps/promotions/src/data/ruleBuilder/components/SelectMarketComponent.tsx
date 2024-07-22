import type { Promotion } from '#types'
import {
  HookedInputSelect,
  useCoreApi,
  useCoreSdkProvider,
  type CurrencyCode,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type { Market, QueryParamsList } from '@commercelayer/sdk'
import { useCurrencyCodes } from '../currency'

export function SelectMarketComponent({
  promotion
}: {
  promotion: Promotion
}): JSX.Element {
  const { sdkClient } = useCoreSdkProvider()
  const currencyCodes = useCurrencyCodes(promotion)

  const { data: markets } = useCoreApi('markets', 'list', [
    getParams({ currencyCodes, name: '' })
  ])

  return (
    <HookedInputSelect
      key={currencyCodes.join(',')}
      name='value'
      placeholder='Search...'
      menuFooterText={
        markets != null && markets.meta.recordCount > 25
          ? 'Type to search for more options.'
          : undefined
      }
      initialValues={toInputSelectValues(markets ?? [])}
      loadAsyncValues={async (name) => {
        const markets = await sdkClient.markets.list(
          getParams({ currencyCodes, name })
        )

        return toInputSelectValues(markets)
      }}
      isMulti
    />
  )
}

function getParams({
  currencyCodes,
  name
}: {
  name: string
  currencyCodes: CurrencyCode[]
}): QueryParamsList<Market> {
  return {
    pageSize: 25,
    sort: {
      name: 'asc'
    },
    filters: {
      name_cont: name,
      price_list_currency_code_in: currencyCodes.join(',')
    }
  }
}

function toInputSelectValues(
  items: Array<{ name: string; id: string }>
): InputSelectValue[] {
  return items.map(({ name, id }) => ({
    label: name,
    value: id
  }))
}
