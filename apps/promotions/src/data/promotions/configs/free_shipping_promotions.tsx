import type { PromotionConfig } from '../config'
import { genericPromotionOptions } from './promotions'

export default {
  free_shipping_promotions: {
    type: 'free_shipping_promotions',
    slug: 'free-shipping',
    icon: 'truck',
    titleList: 'Free shipping',
    description: 'Set the shipping cost amount to zero for orders.',
    titleNew: 'free shipping promotion',
    formType: genericPromotionOptions,
    Fields: () => <></>,
    Options: () => <></>,
    StatusDescription: () => <>Free shipping</>,
    DetailsSectionInfo: () => <></>
  }
} satisfies Pick<PromotionConfig, 'free_shipping_promotions'>
