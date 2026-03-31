import { isFalsy } from '#utils/isFalsy'
import { z, type ZodTypeAny } from 'zod'
import { zodEnforceBoolean, zodEnforceFloat } from './zodUtils'

const makeSchema = (): ZodTypeAny =>
  z
    .object({
      'customer.email': z.string().email(),
      'address.id': z.optional(z.string()),
      // flat address.* keys matching PapaParse output from the CSV template
      'address.business': zodEnforceBoolean({ optional: true }),
      'address.first_name': z.optional(z.string().min(1)),
      'address.last_name': z.optional(z.string().min(1)),
      'address.company': z.optional(z.string().min(1)),
      'address.line_1': z.optional(z.string().min(1)),
      'address.line_2': z.optional(z.string().min(1)),
      'address.city': z.optional(z.string().min(1)),
      'address.zip_code': z.optional(z.string().min(1)),
      'address.state_code': z.optional(z.string().min(1).max(2)),
      'address.country_code': z.optional(z.string().min(1).max(2)),
      'address.phone': z.optional(z.string().min(1)),
      'address.email': z.optional(z.string().email()),
      'address.notes': z.optional(z.string()),
      'address.lat': z.optional(zodEnforceFloat),
      'address.lng': z.optional(zodEnforceFloat),
      'address.billing_info': z.optional(z.string()),
      reference: z.optional(z.string()),
      reference_origin: z.optional(z.string())
    })
    .passthrough()
    .superRefine((data, ctx) => {
      const hasAddressId = !isFalsy(data['address.id'])
      // address.line_1 is the required sentinel for an inline address
      const hasInlineAddress = !isFalsy(data['address.line_1'])

      if (!hasAddressId && !hasInlineAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address.line_1'],
          message:
            'Either address.id or address.* fields (e.g. address.line_1) are required'
        })
      }
      if (hasAddressId && hasInlineAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['address.id'],
          message:
            'Only one of address.id or address.* fields is allowed, not both'
        })
      }
      if (hasInlineAddress) {
        const requiredWhenInline: Array<[string, string]> = [
          ['address.line_1', 'line_1 is required'],
          ['address.city', 'city is required'],
          ['address.zip_code', 'zip_code is required'],
          ['address.state_code', 'state_code is required'],
          ['address.country_code', 'country_code is required'],
          ['address.phone', 'phone is required']
        ]
        for (const [field, message] of requiredWhenInline) {
          if (isFalsy(data[field])) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [field],
              message
            })
          }
        }
        if (
          isFalsy(data['address.business']) &&
          isFalsy(data['address.first_name'])
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['address.first_name'],
            message: 'first_name is required if business is false'
          })
        }
        if (
          isFalsy(data['address.business']) &&
          isFalsy(data['address.last_name'])
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['address.last_name'],
            message: 'last_name is required if business is false'
          })
        }
        if (
          data['address.business'] === true &&
          isFalsy(data['address.company'])
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['address.company'],
            message: 'company is required if business is true'
          })
        }
      }
    })

export const csvCustomerAddressesSchema = z.array(makeSchema())
