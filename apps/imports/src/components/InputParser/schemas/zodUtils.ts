import { isFalsy } from '#utils/isFalsy'
import { z } from 'zod'

type MaybeBoolean = boolean | undefined

export function zodEnforceBoolean({
  optional
}: {
  optional?: boolean
}): z.ZodEffects<
  z.ZodBoolean | z.ZodOptional<z.ZodBoolean>,
  MaybeBoolean,
  unknown
> {
  return z.preprocess(
    (value) =>
      value === undefined || value === ''
        ? undefined
        : String(value).toLowerCase() === 'true',
    isFalsy(optional) ? z.boolean() : z.optional(z.boolean())
  )
}

export const zodEnforceInt = z.preprocess(
  (value) => parseFloat(String(value)),
  z.number().int()
)

export const zodEnforcePositiveInt = z.preprocess(
  (value) => parseFloat(String(value)),
  z.number().int().positive()
)

export const zodEnforceNonNegativeInt = z.preprocess(
  (value) => parseFloat(String(value)),
  z.number().int().nonnegative()
)

export const zodEnforceFloat = z.preprocess(
  (value) => parseFloat(String(value)),
  z.number()
)

export const zodEnforcePositiveFloat = z.preprocess(
  (value) => parseFloat(String(value)),
  z.number().positive()
)

export const zodEnforceNonNegativeFloat = z.preprocess(
  (value) => parseFloat(String(value)),
  z.number().nonnegative()
)

export const zodEnforceDateString = z.preprocess((value: unknown) => {
  try {
    return new Date(value as string).toISOString()
  } catch {
    return undefined
  }
}, z.string())

interface DefaultEnumLike {
  [k: string]: string | number
  [nu: number]: string
}

export function zodCaseInsensitiveNativeEnum<T extends DefaultEnumLike>(
  enumValue: T
): z.ZodEffects<z.ZodNativeEnum<T>, T[keyof T], unknown> {
  return z.preprocess(
    (enumValue) => String(enumValue).toLowerCase(),
    z.nativeEnum(enumValue)
  )
}
