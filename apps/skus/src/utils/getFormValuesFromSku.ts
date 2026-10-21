import type { Sku } from "@commercelayer/sdk"
import type { SkuFormValues } from "#components/SkuForm"

/**
 * Generates the react-hook-form values object from a SKU.
 * @param sku - the SKU to read the values from.
 * @returns an object with sku react-hook-form values.
 */
export const getFormValuesFromSku = (sku?: Sku): SkuFormValues => {
  return {
    id: sku?.id,
    code: sku?.code ?? "",
    name: sku?.name ?? "",
    description: sku?.description ?? "",
    shippingCategory: sku?.shipping_category?.id ?? null,
    weight: sku?.weight?.toString() ?? "",
    unitOfWeight: sku?.unit_of_weight ?? "",
    piecesPerPack: sku?.pieces_per_pack ?? null,
    hsTariffNumber: sku?.hs_tariff_number?.toString() ?? "",
    doNotShip: sku?.do_not_ship ?? false,
    doNotTrack: sku?.do_not_track ?? false,
    imageUrl: sku?.image_url ?? "",
  }
}
