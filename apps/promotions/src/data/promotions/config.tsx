import type { Promotion } from '#types'
import { type IconProps } from '@commercelayer/app-elements'
import type { ResourceTypeLock } from '@commercelayer/sdk'
import type { Replace } from 'type-fest'
import { type z } from 'zod'
import buy_x_pay_y_promotions from './configs/buy_x_pay_y_promotions'
import external_promotions from './configs/external_promotions'
import fixed_amount_promotions from './configs/fixed_amount_promotions'
import fixed_price_promotions from './configs/fixed_price_promotions'
import free_gift_promotions from './configs/free_gift_promotions'
import free_shipping_promotions from './configs/free_shipping_promotions'
import percentage_discount_promotions from './configs/percentage_discount_promotions'

/** The attribute `reference_origin: "app-promotions"` identifies a promotion directly created from the App. */
export const appPromotionsReferenceOrigin = 'app-promotions'

// @ts-expect-error TODO: We need to manage the @flex_promotions
export const promotionConfig: PromotionConfig = {
  ...percentage_discount_promotions,
  ...free_shipping_promotions,
  ...fixed_amount_promotions,
  ...free_gift_promotions,
  ...fixed_price_promotions,
  ...buy_x_pay_y_promotions,
  ...external_promotions
}

type Sanitize<PT extends PromotionType> = Replace<
  Replace<PT, '_promotions', ''>,
  '_',
  '-',
  { all: true }
>

export type PromotionType = Extract<ResourceTypeLock, `${string}_promotions`>

export type PromotionConfig = {
  [type in PromotionType]: {
    type: type
    slug: Sanitize<type>
    titleList: string
    description: string
    titleNew: string
    icon: IconProps['name']
    /** This is the text shown in the CardStatus (promotion detail page) */
    StatusDescription: React.FC<{
      promotion: Extract<Promotion, { type: type }>
    }>
    formType: z.ZodObject<z.ZodRawShape, 'strip', z.ZodTypeAny>
    Fields: React.FC<{ promotion?: Promotion }>
    Options: React.FC<{ promotion?: Promotion }>
    DetailsSectionInfo: React.FC<{
      promotion: Extract<Promotion, { type: type }>
    }>
  }
}
