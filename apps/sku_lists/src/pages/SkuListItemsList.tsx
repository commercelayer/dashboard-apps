import { ListItemSkuListItem } from '#components/ListItemSkuListItem'
import { appRoutes } from '#data/routes'
import { useSkuListDetails } from '#hooks/useSkuListDetails'
import {
  EmptyState,
  PageLayout,
  ResourceList,
  SearchBar,
  Spacer,
  useTokenProvider,
  type PageProps
} from '@commercelayer/app-elements'
import { useState } from 'react'
import { useLocation } from 'wouter'

function SkuListItemsList(
  props: PageProps<typeof appRoutes.itemsList>
): JSX.Element {
  const {
    settings: { mode }
  } = useTokenProvider()
  const [, setLocation] = useLocation()
  const [searchValue, setSearchValue] = useState<string>()
  const { skuList } = useSkuListDetails(props.params.skuListId)

  return (
    <PageLayout
      overlay={props.overlay}
      title='All items'
      mode={mode}
      gap='only-top'
      navigationButton={{
        label: skuList.name,
        icon: 'arrowLeft',
        onClick() {
          setLocation(
            appRoutes.details.makePath({
              skuListId: props.params.skuListId
            })
          )
        }
      }}
    >
      <Spacer top='4'>
        <SearchBar
          initialValue={searchValue}
          onSearch={setSearchValue}
          placeholder='Search...'
          onClear={() => {
            setSearchValue('')
          }}
        />
      </Spacer>

      <Spacer top='14'>
        <ResourceList
          title='Results'
          type='sku_list_items'
          query={{
            filters: {
              sku_list_id_eq: props.params.skuListId,
              ...(searchValue != null ? { sku_name_cont: searchValue } : {})
            },
            include: ['sku'],
            sort: ['position']
          }}
          ItemTemplate={ListItemSkuListItem}
          emptyState={
            <EmptyState
              title='No items found!'
              icon='shield'
              description='No markets found for this SKU list.'
            />
          }
        />
      </Spacer>
    </PageLayout>
  )
}

export default SkuListItemsList
