import type { SkuListFormValues } from '#components/SkuListForm'
import type { SkuListCreate, SkuListUpdate } from '@commercelayer/sdk'

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
