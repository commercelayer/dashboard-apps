import { useAddItemOverlay } from '#hooks/useAddItemOverlay'
import {
  Button,
  Icon,
  SearchBar,
  Section,
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
    const { ResourceList, refresh, list, meta } = useResourceList({
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

    const excludedSkusFromAdd = list
      ?.map((item) => item?.sku?.code ?? '')
      .filter((item) => item !== '')
    const itemsCount = meta?.recordCount ?? 0

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
          <Section
            title={`Items${itemsCount > 0 ? ` · ${itemsCount}` : ''}`}
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
          >
            <ResourceList
              emptyState={
                <Spacer top='4'>
                  <Text variant='info'>No items.</Text>
                </Spacer>
              }
              titleSize='normal'
              ItemTemplate={(itemTemplateProps) => (
                <ListItemSkuListItem
                  hasBundles={hasBundles}
                  {...itemTemplateProps}
                />
              )}
            />
          </Section>
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
