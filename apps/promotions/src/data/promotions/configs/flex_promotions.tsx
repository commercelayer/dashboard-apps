import { HookedCodeEditor, Spacer } from '@commercelayer/app-elements'
import { z } from 'zod'
import type { PromotionConfig } from '../config'
import { genericPromotionOptions } from './promotions'

export default {
  flex_promotions: {
    type: 'flex_promotions',
    slug: 'flex',
    icon: 'asteriskSimple',
    titleList: 'Flex promotion',
    description: 'A powerful flex promotion.',
    titleNew: 'flex promotion',
    formType: genericPromotionOptions.merge(
      z.object({
        rules: z.any().refine((value) => {
          try {
            if (typeof value === 'string') {
              JSON.parse(value)
            }
            return true
          } catch (error) {
            return false
          }
        }, 'JSON is not valid')
      })
    ),
    Fields: () => (
      <>
        <Spacer top='6'>
          <HookedCodeEditor
            name='rules'
            label='Rules'
            language='json'
            jsonSchema='order-rules'
            height='600px'
          />
        </Spacer>
      </>
    ),
    Options: () => <></>,
    StatusDescription: () => <>Flex</>,
    DetailsSectionInfo: () => <></>
  }
} satisfies Pick<PromotionConfig, 'flex_promotions'>
