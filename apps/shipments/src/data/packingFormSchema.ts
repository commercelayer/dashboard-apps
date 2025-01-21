import {
  getContentType,
  getDeliveryConfirmation,
  getIncotermsRule,
  getNonDeliveryOption,
  getRestrictionType
} from '#data/customsInfo'
import { t } from '@commercelayer/app-elements'
import isEmpty from 'lodash/isEmpty'
import { z } from 'zod'

export const packingFormSchema = z
  .object({
    packageId: z
      .string()
      .optional()
      // allow to start with an empty value
      .refine(
        (val) => !isEmpty(val),
        t('apps.shipments.form.required_package')
      ),
    weight: z.string().min(1, {
      message: t('apps.shipments.form.invalid_weight')
    }),
    unitOfWeight: z
      .enum(['gr', 'lb', 'oz'])
      .optional()
      .transform((val, ctx) => {
        if (val === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('apps.shipments.form.invalid_unit_of_weight')
          })

          return z.NEVER
        }
        return val
      }),
    items: z
      .array(
        z.object({
          value: z.string().min(1),
          quantity: z.number()
        })
      )
      .superRefine((val, ctx) => {
        if (val.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.too_small,
            minimum: 1,
            type: 'array',
            inclusive: true,
            message: t('validation.select_one_item')
          })
        }
      }),
    // more options
    incoterm: z.enum(getIncotermsRule().acceptedValues).nullish(),
    delivery_confirmation: z
      .enum(getDeliveryConfirmation().acceptedValues)
      .nullish(),
    // customs info
    customs_info_required: z.boolean().optional(),
    eel_pfc: z.string().optional(),
    contents_type: z.enum(getContentType().acceptedValues).nullish(),
    contents_explanation: z.string().optional(),
    non_delivery_option: z
      .enum(getNonDeliveryOption().acceptedValues)
      .nullish(),
    restriction_type: z.enum(getRestrictionType().acceptedValues).nullish(),
    restriction_comments: z.string().optional(),
    customs_signer: z.string().optional(),
    customs_certify: z.boolean().optional()
  })
  .superRefine((data, ctx) => {
    // customs info: `customs_signer` always required when enabling customs info
    if (data.customs_info_required === true && isEmpty(data.customs_signer)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customs_signer'],
        message: t('apps.shipments.form.required_custom_form_value')
      })
    }

    // customs info: `customs_certify` always required when enabling customs info
    if (data.customs_info_required === true && data.customs_certify !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customs_certify'],
        message: t('apps.shipments.form.required_custom_form_value')
      })
    }

    // customs info: `contents_explanation` required when `contents_type` is `other`
    if (data.contents_type === 'other' && isEmpty(data.contents_explanation)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contents_explanation'],
        message: t('apps.shipments.form.required_if_other_is_selected')
      })
    }

    // customs info: `restriction_comments` required when `restriction_type` different from `none`
    if (
      !isEmpty(data.restriction_type) &&
      data.restriction_type !== 'none' &&
      isEmpty(data.restriction_comments)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['restriction_comments'],
        message: t('apps.shipments.form.required_restriction_comments')
      })
    }
  })

export type PackingFormValues = z.infer<typeof packingFormSchema>
export type PackingFormDefaultValues = z.input<typeof packingFormSchema>
