import { z } from 'zod'
import { matchers, ruleBuilderConfig } from '../config'

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

type LastOf<T> =
  UnionToIntersection<T extends any ? () => T : never> extends () => infer R
    ? R
    : never

type Push<T extends any[], V> = [...T, V]

type TuplifyUnion<
  T,
  L = LastOf<T>,
  N = [T] extends [never] ? true : false
> = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>

export const ruleBuilderFormValidator = z
  .object({
    parameter: z
      .enum(
        Object.keys(ruleBuilderConfig) as TuplifyUnion<
          keyof typeof ruleBuilderConfig
        >
      )
      .nullable(),
    operator: z
      .enum(Object.keys(matchers) as TuplifyUnion<keyof typeof matchers>)
      .nullable(),
    value: z
      .string()
      .min(1)
      .or(z.string().array().min(1))
      .or(z.number())
      .nullable()
  })
  .superRefine((data, ctx) => {
    // Validate "parameter"
    if (data.parameter == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['parameter'],
        message: `One of ${Object.values(ruleBuilderConfig)
          .map(({ label }) => `"${label}"`)
          .join(' or ')} is required`
      })
    }

    // Validate "operator"
    if (
      data.parameter != null &&
      ruleBuilderConfig[data.parameter].operators != null &&
      data.operator == null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['operator'],
        message: `One of ${ruleBuilderConfig[data.parameter].operators?.map(({ label }) => `"${label}"`).join(' or ')} is required`
      })
    }

    // Validate "value"
    if (data.parameter != null && data.value == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['value'],
        message: `Input is required`
      })
    }
  })
  .and(
    z
      .object({
        value: z
          .string()
          .min(1)
          .or(z.string().array().min(1))
          .or(z.number())
          .nullable(),
        all_skus: z.enum(['all', 'any', 'number']),
        min_quantity: z
          .string()
          .nullable()
          .default(null)
          .transform((minQuantity) => {
            if (isNaN(parseInt(minQuantity ?? ''))) {
              return null
            }

            return minQuantity
          })
      })
      .superRefine((data, ctx) => {
        if (
          data.all_skus === 'number' &&
          isNaN(parseInt(data.min_quantity ?? ''))
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['min_quantity'],
            message: `Input is required`
          })
        }
      })
  )
