import { useAddItemOverlay } from '#hooks/useAddItemOverlay'
import {
  Button,
  Icon,
  ResourceList,
  SearchBar,
  Spacer,
  Text,
  useCoreSdkProvider,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import { useState } from 'react'
import { ListItemSkuListItem } from './ListItemSkuListItem'

interface Props {
  skuListId: string
  hasBundles: boolean
}

export const SkuListManualItems = withSkeletonTemplate<Props>(
  ({ skuListId, hasBundles }): JSX.Element | null => {
    const [searchValue, setSearchValue] = useState<string>()
    const { show: showAddItemOverlay, Overlay: AddItemOverlay } =
      useAddItemOverlay()
    const { canUser } = useTokenProvider()
    const { sdkClient } = useCoreSdkProvider()
    const [reRenderListKey, setReRenderListKey] = useState<string>()
    const [excludedSkusFromAdd, setExcludedSkusFromAdd] = useState<string[]>([])

    return (
      <>
        <SearchBar
          initialValue={searchValue}
          onSearch={setSearchValue}
          placeholder='Search...'
          onClear={() => {
            setSearchValue('')
          }}
        />
        <Spacer top='14'>
          <ResourceList
            key={reRenderListKey}
            title='Results'
            type='sku_list_items'
            emptyState={
              <Spacer top='4'>
                <Text variant='info'>No items.</Text>
              </Spacer>
            }
            query={{
              filters: {
                sku_list_id_eq: skuListId,
                ...(searchValue != null
                  ? { sku_code_or_sku_name_cont: searchValue }
                  : {})
              },
              include: ['sku'],
              sort: ['position']
            }}
            actionButton={
              canUser('create', 'sku_list_items') &&
              !hasBundles && (
                <Button
                  variant='secondary'
                  size='mini'
                  alignItems='center'
                  aria-label='Add bundle'
                  onClick={() => {
                    showAddItemOverlay(excludedSkusFromAdd)
                  }}
                >
                  <Icon name='plus' />
                  Add item
                </Button>
              )
            }
            ItemTemplate={({ resource, remove }) => {
              const excludedItems = excludedSkusFromAdd
              if (
                resource?.sku?.id != null &&
                !excludedItems.includes(resource?.sku?.id)
              ) {
                excludedItems.push(resource?.sku?.id)
                setExcludedSkusFromAdd(excludedItems)
              }
              return (
                <ListItemSkuListItem
                  resource={resource}
                  remove={remove}
                  hasBundles={hasBundles}
                  key={resource?.id}
                />
              )
            }}
          />
          <AddItemOverlay
            onConfirm={(resource) => {
              void sdkClient.sku_list_items
                .create({
                  quantity: 1,
                  sku_list: sdkClient.sku_lists.relationship(skuListId),
                  sku: sdkClient.skus.relationship(resource.id)
                })
                .then((newItem) => {
                  setReRenderListKey(newItem.id)
                })
            }}
          />
        </Spacer>
      </>
    )
  }
)
