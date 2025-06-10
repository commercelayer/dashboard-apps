import { appRoutes } from '#data/routes'
import {
  Button,
  Icon,
  SearchBar,
  Section,
  Spacer,
  Text,
  useResourceList,
  useTokenProvider,
  withSkeletonTemplate
} from '@commercelayer/app-elements'
import { useState } from 'react'
import { useLocation } from 'wouter'
import { ListItemSkuListItem } from './ListItemSkuListItem'

interface Props {
  skuListId: string
  hasBundles: boolean
}

export const SkuListManualItems = withSkeletonTemplate<Props>(
  ({ skuListId, hasBundles }): React.JSX.Element | null => {
    const [searchValue, setSearchValue] = useState<string>()
    const [, setLocation] = useLocation()
    const { canUser } = useTokenProvider()
    const { ResourceList, meta } = useResourceList({
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
    const itemsCount = meta?.recordCount ?? 0

    return (
      <>
        <Spacer top='2'>
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
                  onClick={() => {
                    setLocation(
                      appRoutes.detailsAddItems.makePath({ skuListId })
                    )
                  }}
                >
                  <Icon name='plus' />
                  Add items
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
        </Spacer>
      </>
    )
  }
)
