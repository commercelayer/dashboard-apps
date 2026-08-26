import {
  HookedInputSelect,
  useCoreSdkProvider,
} from "@commercelayer/app-elements"
import type { SkuList } from "@commercelayer/sdk"
import { fetchSkuLists } from "#utils/fetchSkuLists"

export function SkuListsSelect({
  options,
}: {
  options: SkuList[]
}): React.JSX.Element | null {
  const { sdkClient } = useCoreSdkProvider()

  return (
    <HookedInputSelect
      name="sku_list"
      placeholder="All SKU lists with manual items..."
      initialValues={options.map(({ id, name }) => ({
        value: id,
        label: name,
      }))}
      isClearable
      pathToValue="value"
      infiniteScroll
      loadAsyncValues={async (hint, { page }) => {
        const list = await fetchSkuLists({ sdkClient, hint, pageNumber: page })
        return {
          options: list.map(({ id, name }) => ({
            value: id,
            label: name,
          })),
          hasMore: list.meta?.pageCount != null && list.meta.pageCount > page,
        }
      }}
    />
  )
}
