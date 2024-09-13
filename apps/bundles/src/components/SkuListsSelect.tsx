import { fetchSkuLists } from '#utils/fetchSkuLists'
import {
  HookedInputSelect,
  useCoreSdkProvider
} from '@commercelayer/app-elements'
import type { SkuList } from '@commercelayer/sdk'

export function SkuListsSelect({
  options
}: {
  options: SkuList[]
}): JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()

  return (
    <HookedInputSelect
      name='sku_list'
      placeholder='All SKU lists with manual items...'
      initialValues={options.map(({ id, name }) => ({
        value: id,
        label: name
      }))}
      isClearable
      pathToValue='value'
      loadAsyncValues={async (hint) => {
        const list = await fetchSkuLists({ sdkClient, hint })
        return list.map(({ id, name }) => ({
          value: id,
          label: name
        }))
      }}
    />
  )
}
