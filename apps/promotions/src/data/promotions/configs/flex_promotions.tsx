import { HookedInputTextArea, Spacer } from '@commercelayer/app-elements'
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
          <HookedInputTextArea
            rows={25}
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              lineHeight: '1.3rem'
            }}
            name='rules'
            label='Rules'
            placeholder='{
  "rules": []
}'
          />
        </Spacer>
      </>
    ),
    Options: () => <></>,
    StatusDescription: () => <>Flex</>,
    DetailsSectionInfo: () => <></>
  }
} satisfies Pick<PromotionConfig, 'flex_promotions'>
