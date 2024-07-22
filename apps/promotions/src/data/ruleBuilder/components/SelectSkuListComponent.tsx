import {
  HookedInputSelect,
  useCoreApi,
  useCoreSdkProvider,
  type InputSelectValue
} from '@commercelayer/app-elements'
import type { QueryParamsList, SkuList } from '@commercelayer/sdk'

export function SelectSkuListComponent(): JSX.Element {
  const { sdkClient } = useCoreSdkProvider()

  const { data: skuLists } = useCoreApi('sku_lists', 'list', [
    getParams({ name: '' })
  ])

  return (
    <HookedInputSelect
      name='value'
      placeholder='Search...'
      menuFooterText={
        skuLists != null && skuLists.meta.recordCount > 25
          ? 'Type to search for more options.'
          : undefined
      }
      initialValues={toInputSelectValues(skuLists ?? [])}
      loadAsyncValues={async (name) => {
        const skuLists = await sdkClient.sku_lists.list(getParams({ name }))

        return toInputSelectValues(skuLists)
      }}
    />
  )
}

function getParams({ name }: { name: string }): QueryParamsList<SkuList> {
  return {
    pageSize: 25,
    sort: {
      name: 'asc'
    },
    filters: {
      name_cont: name
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
