/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { isFalsy } from '#utils/isFalsy'
import { z } from 'zod'

import { zodEnforceNonNegativeInt } from './zodUtils'

const makeSchema = (hasParentResourceId: boolean) =>
  z
    .object({
      sku_code: z.optional(z.string().min(1)),
      quantity: zodEnforceNonNegativeInt,
      reference: z.optional(z.string()),
      reference_origin: z.optional(z.string()),
      stock_location_id: z.optional(z.string().min(1)),
      sku_id: z.optional(z.string().min(1))
    })
    .passthrough()
    .superRefine((data, ctx) => {
      if (!hasParentResourceId && isFalsy(data.stock_location_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['stock_location_id'],
          message: 'stock_location_id is required if parent resource is not set'
        })
      }

      if (isFalsy(data.sku_code) && isFalsy(data.sku_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sku_id'],
          message: 'sku_id is required, if sku_code is not present'
        })
      }
    })

export const csvStockItemsSchema = ({
  hasParentResource
}: {
  hasParentResource: boolean
}) => z.array(makeSchema(hasParentResource))
