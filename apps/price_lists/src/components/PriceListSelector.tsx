import {
  HookedInputSelect,
  useCoreSdkProvider,
} from "@commercelayer/app-elements"
import isEmpty from "lodash-es/isEmpty"
import type { FC } from "react"

/** Core caps `pageSize` at 25, so this is also the most we can load in one go. */
const pageSize = 25

/**
 * Picks the price list a new price belongs to.
 *
 * Options are always fetched from the api, one page at a time as the menu is
 * scrolled: an organization can hold far more price lists than a single page,
 * and everything past the first one has to stay reachable both by scrolling and
 * by typing.
 */
export const PriceListSelector: FC = () => {
  const { sdkClient } = useCoreSdkProvider()

  return (
    <HookedInputSelect
      name="price_list"
      label="Price list"
      placeholder="Select a price list"
      initialValues={[]}
      isClearable={false}
      isSearchable
      infiniteScroll
      loadAsyncValues={async (hint, { page }) => {
        const priceLists = await sdkClient.price_lists.list({
          fields: {
            price_lists: ["name", "currency_code"],
          },
          pageSize,
          pageNumber: page,
          sort: {
            name: "asc",
          },
          ...(isEmpty(hint) ? {} : { filters: { name_cont: hint } }),
        })

        return {
          options: priceLists.map((priceList) => ({
            label: priceList.name,
            value: priceList.id,
            meta: priceList,
          })),
          hasMore:
            priceLists.meta?.pageCount != null &&
            priceLists.meta.pageCount > page,
        }
      }}
    />
  )
}
