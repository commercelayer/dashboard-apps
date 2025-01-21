import { isValidUnitOfWeight, type SkuFormValues } from '#components/SkuForm'
import type { CommerceLayerClient, SkuUpdate } from '@commercelayer/sdk'

/**
 * Generates a SKU object from form values object.
 * @param formValues - object with sku react-hook-form values.
 * @returns a SKU object.
 */

export const getSkuFromFormValues = (
  formValues: SkuFormValues,
  sdkClient: CommerceLayerClient
): SkuUpdate => {
  /*
   * Note: `unit of weight` field will be sent as `undefined` if the `weight` field is not a positive number
   */
  const refinedUnitOfWeight =
    parseInt(formValues.weight ?? '') > 0 &&
    formValues.unitOfWeight != null &&
    formValues.unitOfWeight?.length > 0 &&
    isValidUnitOfWeight(formValues.unitOfWeight)
      ? formValues.unitOfWeight
      : undefined

  return {
    id: formValues.id ?? '',
    code: formValues.code ?? '',
    name: formValues.name,
    description: formValues.description,
    image_url: formValues.imageUrl,
    shipping_category: sdkClient.shipping_categories.relationship(
      formValues.shippingCategory ?? null
    ),
    weight: parseInt(formValues.weight ?? ''),
    unit_of_weight: refinedUnitOfWeight,
    pieces_per_pack: formValues.piecesPerPack ?? null,
    hs_tariff_number: formValues.hsTariffNumber,
    do_not_ship: formValues.doNotShip,
    do_not_track: formValues.doNotTrack
  }
}
