import { SectionFlexRules } from '#components/FlexRuleBuilder'
import { makeFlexPromotion } from '#mocks'
import {
  InputFeedback,
  Spacer,
  useValidationFeedback
} from '@commercelayer/app-elements'
import { z } from 'zod'
import type { PromotionConfig } from '../config'
import { genericPromotionOptions } from './promotions'

export default {
  flex_promotions: {
    type: 'flex_promotions',
    slug: 'flex',
    icon: 'target',
    titleList: 'Flex promotion',
    description:
      'Create advanced promotions with flexible conditions using the rules engine.',
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
    Options: ({ promotion, hookFormReturn }) => {
      const feedback = useValidationFeedback('rules')
      return (
        <>
          {promotion == null && (
            <Spacer top='14'>
              <SectionFlexRules
                promotion={makeFlexPromotion()}
                onChange={(rules) => {
                  hookFormReturn.setValue(
                    'rules',
                    JSON.stringify(rules, null, 2)
                  )
                }}
              />
              {feedback != null && (
                <InputFeedback className='mt-2' {...feedback} />
              )}
            </Spacer>
          )}
        </>
      )
    },
    Fields: () => <></>,
    StatusDescription: () => <>Flex</>,
    DetailsSectionInfo: () => <></>
  }
} satisfies Pick<PromotionConfig, 'flex_promotions'>
