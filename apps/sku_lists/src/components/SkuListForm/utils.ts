import type {
  FormSkuListItem,
  SkuListFormValues
} from '#components/SkuListForm'
import type {
  CommerceLayerClient,
  SkuList,
  SkuListCreate,
  SkuListItem,
  SkuListItemCreate,
  SkuListItemUpdate,
  SkuListUpdate
} from '@commercelayer/sdk'

export function makeFormSkuListItem(
  skuListItem: SkuListItem,
  itemIndex: number
): FormSkuListItem {
  return {
    id: skuListItem.id,
    quantity: skuListItem.quantity ?? 1,
    sku_code: skuListItem.sku_code ?? '',
    position: skuListItem.position ?? itemIndex,
    sku: {
      id: skuListItem.sku?.id ?? '',
      code: skuListItem.sku?.code ?? '',
      name: skuListItem.sku?.name ?? '',
      image_url: skuListItem.sku?.image_url ?? undefined
    }
  }
}

export function adaptFormValuesToSkuListCreate(
  formValues: SkuListFormValues
): SkuListCreate {
  return {
    name: formValues.name,
    manual: formValues.manual,
    sku_code_regex: !formValues.manual ? formValues.sku_code_regex : null
  }
}

export function adaptFormValuesToSkuListUpdate(
  formValues: SkuListFormValues
): SkuListUpdate {
  return {
    id: formValues.id ?? '',
    name: formValues.name,
    manual: formValues.manual,
    sku_code_regex: !formValues.manual ? formValues.sku_code_regex : null
  }
}

export function adaptFormListItemToSkuListItemCreate(
  item: FormSkuListItem,
  listId: SkuList['id'],
  sdkClient: CommerceLayerClient
): SkuListItemCreate {
  return {
    sku_code: item.sku_code,
    quantity: item.quantity,
    sku: sdkClient.skus.relationship(item.sku.id),
    sku_list: sdkClient.sku_lists.relationship(listId)
  }
}

export function adaptFormListItemToSkuListItemUpdate(
  item: FormSkuListItem
): SkuListItemUpdate {
  return {
    id: item.id,
    sku_code: item.sku_code,
    quantity: item.quantity
  }
}
