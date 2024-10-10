import { useAddItemOverlay } from '#hooks/useAddItemOverlay'
import {
  Button,
  Icon,
  SearchBar,
  Spacer,
  Text,
  useCoreSdkProvider,
  useResourceList,
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
    const [excludedSkusFromAdd, setExcludedSkusFromAdd] = useState<string[]>([])
    const { ResourceList, refresh } = useResourceList({
      type: 'sku_list_items',
      query: {
        filters: {
          sku_list_id_eq: skuListId,
          ...(searchValue != null
            ? { sku_code_or_sku_name_cont: searchValue }
            : {})
        },
        include: ['sku'],
        sort: ['position']
      }
    })

    return (
      <>
        <Spacer top='10'>
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
            emptyState={
              <Spacer top='4'>
                <Text variant='info'>No items.</Text>
              </Spacer>
            }
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
                .then(() => {
                  refresh()
                })
            }}
          />
        </Spacer>
      </>
    )
  }
)
